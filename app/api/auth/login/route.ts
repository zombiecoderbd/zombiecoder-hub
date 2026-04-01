import { NextRequest } from 'next/server';
import { prisma } from '@/src/lib/db/client';
import { authService } from '@/src/lib/auth/service';
import { success, error, validationError, serverError, parseRequestBody } from '@/src/lib/api/response';
import { addSecurityHeaders } from '@/src/lib/api/middleware';

interface LoginRequest {
  email: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const parseResult = await parseRequestBody<LoginRequest>(request);
    if (!parseResult.success) {
      return error(parseResult.error || 'Invalid request', 400);
    }

    const { email, password } = parseResult.data || {};

    // Validate required fields
    const validationErrors: Record<string, string[]> = {};

    if (!email || !email.includes('@')) {
      validationErrors.email = ['Valid email is required'];
    }
    if (!password) {
      validationErrors.password = ['Password is required'];
    }

    if (Object.keys(validationErrors).length > 0) {
      return addSecurityHeaders(validationError(validationErrors));
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email!.toLowerCase() },
    });

    if (!user) {
      // Don't reveal if email exists
      return addSecurityHeaders(error('Invalid email or password', 401));
    }

    if (!user.isActive) {
      return addSecurityHeaders(error('Account is disabled', 403));
    }

    // Check password
    const passwordValid = await authService.comparePassword(password!, user.passwordHash);
    if (!passwordValid) {
      // Log failed attempt
      await prisma.auditLog.create({
        data: {
          action: 'LOGIN_FAILED',
          resource: 'session',
          resourceId: user.id,
          details: JSON.stringify({ reason: 'Invalid password' }),
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          user: { connect: { id: user.id } },
        },
      });

      return addSecurityHeaders(error('Invalid email or password', 401));
    }

    // Generate token pair
    const tokens = authService.generateTokenPair(user.id, user.email, user.role);

    // Create session
    await prisma.session.create({
      data: {
        userId: user.id,
        agentId: 'default-agent',
        agentName: 'ZombieCoder Editor Agent',
        token: tokens.refreshToken,
        status: 'ACTIVE',
        startTime: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Log successful login
    await prisma.auditLog.create({
      data: {
        action: 'LOGIN_SUCCESS',
        resource: 'session',
        resourceId: user.id,
        details: JSON.stringify({ email }),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        user: { connect: { id: user.id } },
      },
    });

    const response = addSecurityHeaders(
      success(
        {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn,
        },
        200
      )
    );

    return response;
  } catch (err) {
    console.error('[Auth] Login error:', err);
    return addSecurityHeaders(serverError('Login failed'));
  }
}

export async function OPTIONS() {
  const response = new Response(null, { status: 200 });
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}
