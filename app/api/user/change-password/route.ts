import { NextRequest } from 'next/server';
import { prisma } from '@/src/lib/db/client';
import { authService } from '@/src/lib/auth/service';
import { verifyAuthToken } from '@/src/lib/api/middleware';
import { success, error, validationError, unauthorized, serverError, parseRequestBody } from '@/src/lib/api/response';
import { addSecurityHeaders } from '@/src/lib/api/middleware';

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const auth = verifyAuthToken(request);
    if (!auth) {
      return addSecurityHeaders(unauthorized('Missing or invalid authentication token'));
    }

    // Parse request body
    const parseResult = await parseRequestBody<ChangePasswordRequest>(request);
    if (!parseResult.success) {
      return error(parseResult.error || 'Invalid request', 400);
    }

    const { currentPassword, newPassword, confirmPassword } = parseResult.data || {};

    // Validate required fields
    const validationErrors: Record<string, string[]> = {};

    if (!currentPassword) {
      validationErrors.currentPassword = ['Current password is required'];
    }
    if (!newPassword) {
      validationErrors.newPassword = ['New password is required'];
    }
    if (newPassword !== confirmPassword) {
      validationErrors.confirmPassword = ['Passwords do not match'];
    }

    if (Object.keys(validationErrors).length > 0) {
      return addSecurityHeaders(validationError(validationErrors));
    }

    // Fetch user
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
    });

    if (!user) {
      return addSecurityHeaders(unauthorized('User not found'));
    }

    // Verify current password
    const passwordValid = await authService.comparePassword(currentPassword!, user.passwordHash);
    if (!passwordValid) {
      return addSecurityHeaders(error('Current password is incorrect', 401));
    }

    // Validate new password strength
    const strengthCheck = authService.validatePasswordStrength(newPassword!);
    if (!strengthCheck.valid) {
      validationErrors.newPassword = strengthCheck.errors;
      return addSecurityHeaders(validationError(validationErrors));
    }

    // Ensure new password is different from current
    const newPasswordSame = await authService.comparePassword(newPassword!, user.passwordHash);
    if (newPasswordSame) {
      return addSecurityHeaders(error('New password must be different from current password', 400));
    }

    // Hash new password
    const newPasswordHash = await authService.hashPassword(newPassword!);

    // Update password
    await prisma.user.update({
      where: { id: auth.userId },
      data: { passwordHash: newPasswordHash },
    });

    // Invalidate all sessions (user must login again)
    await prisma.session.deleteMany({
      where: { userId: auth.userId },
    });

    // Log action
    await prisma.auditLog.create({
      data: {
        action: 'PASSWORD_CHANGED',
        resource: 'user',
        resourceId: auth.userId,
        details: JSON.stringify({ email: user.email }),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        user: { connect: { id: auth.userId } },
      },
    });

    const response = addSecurityHeaders(
      success({ message: 'Password changed successfully. Please login again.' })
    );

    return response;
  } catch (err) {
    console.error('[User] Password change error:', err);
    return addSecurityHeaders(serverError('Failed to change password'));
  }
}

export async function OPTIONS() {
  const response = new Response(null, { status: 200 });
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  return response;
}
