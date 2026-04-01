import { NextRequest, NextResponse } from 'next/server';
import { authService } from '../auth/service';
import { unauthorized, forbidden } from './response';

/**
 * User context from authenticated request
 */
export interface AuthContext {
  userId: string;
  email: string;
  role: 'ADMIN' | 'CLIENT';
  sessionId: string;
  token: string;
}

/**
 * Request with auth context
 */
declare global {
  namespace NodeJS {
    interface Global {
      authContext?: AuthContext;
    }
  }
}

/**
 * Parse and verify JWT token from request
 */
export function verifyAuthToken(request: NextRequest): AuthContext | null {
  const authHeader = request.headers.get('Authorization');
  const token = authService.extractTokenFromHeader(authHeader || '');

  if (!token) {
    return null;
  }

  const payload = authService.verifyToken(token);
  if (!payload) {
    return null;
  }

  return {
    userId: payload.userId,
    email: payload.email,
    role: payload.role as 'ADMIN' | 'CLIENT',
    sessionId: payload.sessionId,
    token,
  };
}

/**
 * Require authentication middleware
 */
export function requireAuth(handler: (req: NextRequest, auth: AuthContext) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const auth = verifyAuthToken(request);

    if (!auth) {
      return unauthorized('Missing or invalid authentication token');
    }

    return handler(request, auth);
  };
}

/**
 * Require specific role middleware
 */
export function requireRole(
  roles: Array<'ADMIN' | 'CLIENT'>,
  handler: (req: NextRequest, auth: AuthContext) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const auth = verifyAuthToken(request);

    if (!auth) {
      return unauthorized('Missing or invalid authentication token');
    }

    if (!roles.includes(auth.role)) {
      return forbidden(`This action requires one of these roles: ${roles.join(', ')}`);
    }

    return handler(request, auth);
  };
}

/**
 * Add rate limiting headers to response
 */
export function addRateLimitHeaders(
  response: NextResponse,
  limit: number = 100,
  window: number = 60,
  remaining: number = limit - 1
): NextResponse {
  response.headers.set('X-RateLimit-Limit', limit.toString());
  response.headers.set('X-RateLimit-Window', window.toString());
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  response.headers.set('X-RateLimit-Reset', Math.ceil(Date.now() / 1000 + window).toString());
  return response;
}

/**
 * Add CORS headers to response
 */
export function addCORSHeaders(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || 'http://localhost:3000');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}

/**
 * Add security headers to response
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  return response;
}

/**
 * Validate request content type
 */
export function validateContentType(
  request: NextRequest,
  expectedType: string
): boolean {
  const contentType = request.headers.get('Content-Type');
  return contentType?.includes(expectedType) ?? false;
}

/**
 * Extract pagination params
 */
export function parsePaginationParams(request: NextRequest): { page: number; limit: number } {
  const searchParams = request.nextUrl.searchParams;
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
  return { page, limit };
}
