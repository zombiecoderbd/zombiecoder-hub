import { NextRequest } from 'next/server';
import { verifyJWT } from '@/src/lib/auth/service';
import { getDbClient } from '@/src/lib/db/client';
import { error, success } from '@/src/lib/api/response';

function ensureAdmin(role?: string | null) {
  return role === 'ADMIN';
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = await verifyJWT(token);
      if (!payload?.userId) {
        return error('Invalid or expired token', 401);
      }

      if (!ensureAdmin(payload.role)) {
        return error('Forbidden', 403);
      }
    }

    const db = getDbClient();

    const [ollama, gemini, lastSync] = await Promise.all([
      db.provider.findUnique({
        where: { key: 'ollama' },
        include: { defaultModel: true, models: { select: { name: true }, orderBy: { name: 'asc' } } },
      }),
      db.provider.findUnique({
        where: { key: 'gemini' },
        include: { defaultModel: true, models: { select: { name: true }, orderBy: { name: 'asc' } } },
      }),
      db.systemConfig.findUnique({ where: { key: 'models.lastSyncAt' }, select: { value: true } }),
    ]);

    return success({
      ollama: {
        models: (ollama?.models || []).map((m) => m.name),
        defaultModel: (ollama?.defaultModel?.name || '').trim(),
      },
      gemini: {
        models: (gemini?.models || []).map((m) => m.name),
        defaultModel: (gemini?.defaultModel?.name || '').trim(),
      },
      lastSyncAt: (lastSync?.value || '').trim(),
    });
  } catch (err) {
    console.error('[v0] Admin models GET error:', err);
    return error('Failed to load models', 500);
  }
}
