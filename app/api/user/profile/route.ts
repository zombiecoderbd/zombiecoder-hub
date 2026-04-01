import { NextRequest } from 'next/server';
import { prisma } from '@/src/lib/db/client';
import { verifyAuthToken } from '@/src/lib/api/middleware';
import { success, unauthorized, notFound, serverError } from '@/src/lib/api/response';
import { addSecurityHeaders } from '@/src/lib/api/middleware';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const auth = verifyAuthToken(request);
    if (!auth) {
      return addSecurityHeaders(unauthorized('Missing or invalid authentication token'));
    }

    // Fetch user profile
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      return addSecurityHeaders(notFound('User not found'));
    }

    const response = addSecurityHeaders(success({ user }));
    return response;
  } catch (err) {
    console.error('[User] Profile fetch error:', err);
    return addSecurityHeaders(serverError('Failed to fetch profile'));
  }
}

export async function OPTIONS() {
  const response = new Response(null, { status: 200 });
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Authorization');
  return response;
}
