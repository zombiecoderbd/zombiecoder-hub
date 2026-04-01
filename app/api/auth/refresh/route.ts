import { NextRequest } from 'next/server';
import { prisma } from '@/src/lib/db/client';
import { authService } from '@/src/lib/auth/service';
import { success, error, validationError, serverError, parseRequestBody } from '@/src/lib/api/response';
import { addSecurityHeaders } from '@/src/lib/api/middleware';

interface RefreshRequest {
  refreshToken: string;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const parseResult = await parseRequestBody<RefreshRequest>(request);
    if (!parseResult.success) {
      return error(parseResult.error || 'Invalid request', 400);
    }

    const { refreshToken } = parseResult.data || {};

    // Validate required fields
    if (!refreshToken) {
      return addSecurityHeaders(validationError({ refreshToken: ['Refresh token is required'] }));
    }

    // Verify token
    const payload = authService.verifyToken(refreshToken);
    if (!payload || payload.type !== 'refresh') {
      return addSecurityHeaders(error('Invalid refresh token', 401));
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || !user.isActive) {
      return addSecurityHeaders(error('User not found or inactive', 401));
    }

    // Verify session exists and is valid
    const session = await prisma.session.findFirst({
      where: {
        userId: user.id,
        token: refreshToken,
        expiresAt: { gt: new Date() },
      },
    });

    if (!session) {
      return addSecurityHeaders(error('Session expired or invalid', 401));
    }

    // Generate new token pair
    const tokens = authService.generateTokenPair(user.id, user.email, user.role);

    // Update session
    await prisma.session.update({
      where: { id: session.id },
      data: {
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Log token refresh
    await prisma.auditLog.create({
      data: {
        action: 'TOKEN_REFRESHED',
        resource: 'session',
        resourceId: session.id,
        details: JSON.stringify({ sessionId: session.id }),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        user: { connect: { id: user.id } },
      },
    });

    const response = addSecurityHeaders(
      success(
        {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn,
        },
        200
      )
    );

    return response;
  } catch (err) {
    console.error('[Auth] Refresh error:', err);
    return addSecurityHeaders(serverError('Token refresh failed'));
  }
}

export async function OPTIONS() {
  const response = new Response(null, { status: 200 });
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}
