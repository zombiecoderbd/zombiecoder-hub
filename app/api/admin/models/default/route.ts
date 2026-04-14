import { NextRequest } from 'next/server';
import { verifyJWT } from '@/src/lib/auth/service';
import { getDbClient } from '@/src/lib/db/client';
import { error, success, validationError, parseRequestBody } from '@/src/lib/api/response';

type Provider = 'ollama' | 'gemini';

function ensureAdmin(role?: string | null) {
  return role === 'ADMIN';
}

export async function POST(request: NextRequest) {
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
    } else if (process.env.NODE_ENV !== 'development') {
      return error('Missing or invalid authorization', 401);
    }

    const parseResult = await parseRequestBody<{ provider: Provider; model: string }>(request);
    if (!parseResult.success) {
      return validationError({ message: ['Invalid request format'] });
    }

    const provider = parseResult.data?.provider;
    const model = (parseResult.data?.model || '').trim();

    if (!provider || !['ollama', 'gemini'].includes(provider)) {
      return validationError({ provider: ['Invalid provider'] });
    }

    if (!model) {
      return validationError({ model: ['Model is required'] });
    }

    const db = getDbClient();

    const providerRow = await db.provider.findUnique({
      where: { key: provider },
      select: { id: true },
    });

    if (!providerRow) {
      return validationError({ provider: ['Provider not synced yet. Click Sync first.'] });
    }

    const modelRow = await db.model.findFirst({
      where: { providerId: providerRow.id, name: model },
      select: { id: true },
    });

    if (!modelRow) {
      return validationError({ model: ['Model not found for this provider. Click Sync first.'] });
    }

    await db.provider.update({
      where: { id: providerRow.id },
      data: { defaultModelId: modelRow.id },
    });

    const key = provider === 'ollama' ? 'models.ollama.default' : 'models.gemini.default';
    await db.systemConfig.upsert({
      where: { key },
      update: { value: model },
      create: { key, value: model, description: `Default ${provider} model` },
    });

    return success({ provider, model });
  } catch (err) {
    console.error('[v0] Admin model default error:', err);
    return error('Failed to set default model', 500);
  }
}
