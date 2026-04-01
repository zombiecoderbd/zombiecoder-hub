import { NextRequest } from 'next/server';
import { prisma } from '@/src/lib/db/client';
import { verifyAuthToken } from '@/src/lib/api/middleware';
import { success, unauthorized, serverError } from '@/src/lib/api/response';
import { addSecurityHeaders } from '@/src/lib/api/middleware';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const auth = verifyAuthToken(request);
    if (!auth) {
      return addSecurityHeaders(unauthorized('Missing or invalid authentication token'));
    }

    // Delete all sessions for this user (logout all devices)
    await prisma.session.deleteMany({
      where: { userId: auth.userId },
    });

    // Log logout action
    await prisma.auditLog.create({
      data: {
        action: 'LOGOUT',
        resource: 'session',
        resourceId: auth.userId,
        details: JSON.stringify({ allDevices: true }),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        user: { connect: { id: auth.userId } },
      },
    });

    const response = addSecurityHeaders(success({ message: 'Logged out successfully' }));
    return response;
  } catch (err) {
    console.error('[Auth] Logout error:', err);
    return addSecurityHeaders(serverError('Logout failed'));
  }
}

export async function OPTIONS() {
  const response = new Response(null, { status: 200 });
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Authorization');
  return response;
}
