import { NextRequest } from 'next/server';
import { prisma } from '@/src/lib/db/client';
import { authService } from '@/src/lib/auth/service';
import { success, error, validationError, serverError, parseRequestBody } from '@/src/lib/api/response';
import { addSecurityHeaders } from '@/src/lib/api/middleware';

interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const parseResult = await parseRequestBody<RegisterRequest>(request);
    if (!parseResult.success) {
      return error(parseResult.error || 'Invalid request', 400);
    }

    const { email, password, confirmPassword, firstName, lastName } = parseResult.data || {};

    // Validate required fields
    const validationErrors: Record<string, string[]> = {};

    if (!email || !email.includes('@')) {
      validationErrors.email = ['Valid email is required'];
    }
    if (!password) {
      validationErrors.password = ['Password is required'];
    }
    if (password !== confirmPassword) {
      validationErrors.confirmPassword = ['Passwords do not match'];
    }
    if (!firstName?.trim()) {
      validationErrors.firstName = ['First name is required'];
    }
    if (!lastName?.trim()) {
      validationErrors.lastName = ['Last name is required'];
    }

    if (Object.keys(validationErrors).length > 0) {
      return addSecurityHeaders(validationError(validationErrors));
    }

    // Validate password strength
    const strengthCheck = authService.validatePasswordStrength(password!);
    if (!strengthCheck.valid) {
      validationErrors.password = strengthCheck.errors;
      return addSecurityHeaders(validationError(validationErrors));
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email!.toLowerCase() },
    });

    if (existingUser) {
      return error('Email already registered', 400);
    }

    // Hash password
    const passwordHash = await authService.hashPassword(password!);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email!.toLowerCase(),
        passwordHash,
        name: `${firstName!.trim()} ${lastName!.trim()}`.trim(),
        role: 'CLIENT', // Default role for new users
        isActive: true,
        lastLoginAt: null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    // Generate token pair
    const tokens = authService.generateTokenPair(user.id, user.email, user.role);

    // Create session
    await prisma.session.create({
      data: {
        userId: user.id,
        agentId: 'default-agent',
        agentName: 'ZombieCoder Editor Agent',
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'ACTIVE',
        startTime: new Date(),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    });

    // Log action
    await prisma.auditLog.create({
      data: {
        action: 'USER_REGISTERED',
        resource: 'user',
        resourceId: user.id,
        details: JSON.stringify({ email, name: user.name }),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        user: { connect: { id: user.id } },
      },
    });

    const response = addSecurityHeaders(
      success(
        {
          user,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn,
        },
        201
      )
    );

    return response;
  } catch (err) {
    console.error('[Auth] Registration error:', err);
    return addSecurityHeaders(serverError('Registration failed'));
  }
}

export async function OPTIONS() {
  const response = new Response(null, { status: 200 });
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}
