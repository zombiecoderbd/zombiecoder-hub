import { NextRequest } from 'next/server';
import { verifyJWT } from '@/src/lib/auth/service';
import { success, error, validationError } from '@/src/lib/api/response';
import { getDbClient } from '@/src/lib/db/client';
import { AgentExecutor } from '@/src/lib/agent/executor';

/**
 * POST /api/agent/session
 * Create new agent session
 */
export async function POST(request: NextRequest) {
  try {
    // Verify JWT
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return error('Missing or invalid authorization', 401);
    }

    const token = authHeader.substring(7);
    const payload = await verifyJWT(token);
    if (!payload?.userId) {
      return error('Invalid or expired token', 401);
    }

    const userId = payload.userId;

    // Create session
    const session = await AgentExecutor.createSession(userId);

    // Log to audit trail
    const db = getDbClient();
    try {
      await db.auditLog.create({
        data: {
          user: { connect: { id: userId } },
          action: 'SESSION_CREATE',
          resource: 'session',
          details: JSON.stringify({ sessionId: session.id }),
        },
      });
    } catch (err) {
      console.warn('[v0] Audit log failed:', err);
    }

    return success({
      sessionId: session.id,
      userId: session.userId,
      agentId: session.agentId,
      createdAt: session.createdAt.toISOString(),
    });
  } catch (err) {
    console.error('[v0] Session creation error:', err);
    return error('Failed to create session', 500);
  }
}

/**
 * GET /api/agent/session?sessionId=X
 * Get session details
 */
export async function GET(request: NextRequest) {
  try {
    // Verify JWT
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return error('Missing or invalid authorization', 401);
    }

    const token = authHeader.substring(7);
    const payload = await verifyJWT(token);
    if (!payload?.userId) {
      return error('Invalid or expired token', 401);
    }

    const userId = payload.userId;
    const sessionId = request.nextUrl.searchParams.get('sessionId');

    if (!sessionId) {
      return validationError({ sessionId: ['Session ID required'] });
    }

    // Get session
    const session = await AgentExecutor.getSession(sessionId);
    if (!session) {
      return error('Session not found', 404);
    }

    // Verify ownership
    if (session.userId !== userId) {
      return error('Unauthorized: Session does not belong to this user', 403);
    }

    // Get message count
    const db = getDbClient();
    const messageCount = await db.message.count({
      where: { sessionId },
    });

    return success({
      sessionId: session.id,
      userId: session.userId,
      agentId: session.agentId,
      createdAt: session.createdAt.toISOString(),
      messageCount,
    });
  } catch (err) {
    console.error('[v0] Get session error:', err);
    return error('Failed to retrieve session', 500);
  }
}

/**
 * DELETE /api/agent/session?sessionId=X
 * End session and clean up
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verify JWT
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return error('Missing or invalid authorization', 401);
    }

    const token = authHeader.substring(7);
    const payload = await verifyJWT(token);
    if (!payload?.userId) {
      return error('Invalid or expired token', 401);
    }

    const userId = payload.userId;
    const sessionId = request.nextUrl.searchParams.get('sessionId');

    if (!sessionId) {
      return validationError({ sessionId: ['Session ID required'] });
    }

    // Verify session ownership
    const session = await AgentExecutor.getSession(sessionId);
    if (!session || session.userId !== userId) {
      return error('Unauthorized', 403);
    }

    // Delete session and messages
    const db = getDbClient();
    await db.message.deleteMany({ where: { sessionId } });
    await db.session.delete({ where: { id: sessionId } });

    // Log to audit
    try {
      await db.auditLog.create({
        data: {
          user: { connect: { id: userId } },
          action: 'SESSION_DELETE',
          resource: 'session',
          details: JSON.stringify({ sessionId }),
        },
      });
    } catch (err) {
      console.warn('[v0] Audit log failed:', err);
    }

    return success({
      message: 'Session deleted successfully',
      sessionId,
    });
  } catch (err) {
    console.error('[v0] Delete session error:', err);
    return error('Failed to delete session', 500);
  }
}
