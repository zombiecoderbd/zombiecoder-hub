import { NextRequest } from 'next/server';
import { verifyJWT } from '@/src/lib/auth/service';
import { success, error, validationError, parseRequestBody } from '@/src/lib/api/response';
import { getDbClient } from '@/src/lib/db/client';
import { getAgentExecutor, AgentExecutor } from '@/src/lib/agent/executor';

interface ChatRequest {
  sessionId: string;
  message: string;
  provider?: 'ollama' | 'openai' | 'gemini';
  model?: string;
}

/**
 * POST /api/agent/chat
 * Send message to agent and get response
 * Real implementation with Ollama → OpenAI fallback chain
 */
export async function POST(request: NextRequest) {
  try {
    // Verify JWT authentication
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

    // Parse request body
    const parseResult = await parseRequestBody<ChatRequest>(request);
    if (!parseResult.success) {
      return validationError({ message: ['Invalid request format'] });
    }

    const { sessionId, message, provider, model } = parseResult.data || {};

    // Validate inputs
    if (!sessionId?.trim()) {
      return validationError({
        sessionId: ['Session ID is required'],
      });
    }

    if (!message?.trim()) {
      return validationError({
        message: ['Message cannot be empty'],
      });
    }

    if (provider && !['ollama', 'openai', 'gemini'].includes(provider)) {
      return validationError({
        provider: ['Invalid provider. Allowed: ollama, openai, gemini'],
      });
    }

    const db = getDbClient();

    // Verify session exists and belongs to user
    const session = await AgentExecutor.getSession(sessionId);
    if (!session) {
      return error('Session not found', 404);
    }

    if (session.userId !== userId) {
      return error('Unauthorized: Session does not belong to this user', 403);
    }

    // Store user message
    const executor = getAgentExecutor(sessionId, userId);
    await executor.storeMessage('user', message);

    // Get conversation history (last 5 messages for context)
    const history = await executor.getHistory(5);

    // Add current message to history
    history.push({ role: 'user', content: message });

    // Execute agent with provider fallback
    const response = await executor.execute(history, {
      provider,
      model: model?.trim() ? model.trim() : undefined,
    });

    // Store assistant message
    await executor.storeMessage('assistant', response.content, {
      provider: response.provider,
      executionTime: response.executionTime,
    });

    // Log to audit trail
    try {
      await db.auditLog.create({
        data: {
          user: { connect: { id: userId } },
          action: 'AGENT_CHAT',
          resource: 'session',
          details: JSON.stringify({
            sessionId,
            provider: response.provider,
            messageLength: message.length,
            responseLength: response.content.length,
            executionTime: response.executionTime,
          }),
        },
      });
    } catch (logErr) {
      console.warn('[v0] Failed to log chat action:', logErr);
    }

    // Return response with metadata
    return success({
      sessionId,
      userMessage: {
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
      },
      assistantMessage: {
        role: 'assistant',
        content: response.content,
        timestamp: new Date().toISOString(),
        metadata: {
          provider: response.provider,
          executionTime: response.executionTime,
        },
      },
    });
  } catch (err) {
    console.error('[v0] Chat endpoint error:', err);
    return error(
      err instanceof Error ? err.message : 'Internal server error',
      500
    );
  }
}

/**
 * GET /api/agent/chat?sessionId=X
 * Get session messages
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

    // Verify session ownership
    const session = await AgentExecutor.getSession(sessionId);
    if (!session || session.userId !== userId) {
      return error('Unauthorized', 403);
    }

    // Get messages
    const db = getDbClient();
    const messages = await db.message.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
    });

    return success({
      sessionId,
      messages: messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: m.createdAt.toISOString(),
        metadata: m.metadata,
      })),
    });
  } catch (err) {
    console.error('[v0] Get messages error:', err);
    return error('Failed to retrieve messages', 500);
  }
}
