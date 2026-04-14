import { NextRequest } from 'next/server';
import { verifyJWT } from '@/src/lib/auth/service';
import { getDbClient } from '@/src/lib/db/client';
import { error, success } from '@/src/lib/api/response';

function ensureAdmin(role?: string | null) {
  return role === 'ADMIN';
}

async function fetchOllamaModels(): Promise<string[]> {
  const baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  const res = await fetch(`${baseUrl}/api/tags`);
  if (!res.ok) {
    throw new Error(`Ollama tags failed: ${res.status} ${res.statusText}`);
  }
  const data = (await res.json()) as any;
  const names = Array.isArray(data?.models) ? data.models.map((m: any) => m?.name).filter(Boolean) : [];
  return Array.from(new Set(names));
}

async function upsertProviderWithModels(db: ReturnType<typeof getDbClient>, providerKey: string, providerName: string, models: string[]) {
  const clean = Array.from(
    new Set(
      (models || [])
        .map((m) => (typeof m === 'string' ? m.trim() : ''))
        .filter(Boolean)
    )
  );

  const provider = await db.provider.upsert({
    where: { key: providerKey },
    update: { name: providerName, lastSyncedAt: new Date() },
    create: { key: providerKey, name: providerName, lastSyncedAt: new Date() },
    select: { id: true },
  });

  if (clean.length === 0) {
    return { providerId: provider.id, models: [] as string[] };
  }

  await db.model.createMany({
    data: clean.map((name) => ({ providerId: provider.id, name })),
    skipDuplicates: true,
  });

  return { providerId: provider.id, models: clean };
}

async function fetchGeminiModels(): Promise<string[]> {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) return [];

  const baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
  const res = await fetch(`${baseUrl}/models?key=${apiKey}`);
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Gemini models failed: ${res.status} ${res.statusText} ${body}`);
  }

  const data = (await res.json()) as any;
  const raw = Array.isArray(data?.models) ? data.models : [];
  const names = raw
    .map((m: any) => (typeof m?.name === 'string' ? m.name : null))
    .filter(Boolean)
    .map((n: string) => (n.startsWith('models/') ? n.slice('models/'.length) : n));

  return Array.from(new Set(names));
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

    const db = getDbClient();

    let ollamaModels: string[] = [];
    let geminiModels: string[] = [];
    let ollamaError = '';
    let geminiError = '';

    try {
      ollamaModels = await fetchOllamaModels();
    } catch (e) {
      ollamaError = e instanceof Error ? e.message : 'Unknown error';
    }

    try {
      geminiModels = await fetchGeminiModels();
    } catch (e) {
      geminiError = e instanceof Error ? e.message : 'Unknown error';
    }

    const now = new Date().toISOString();

    const ollamaResult = await upsertProviderWithModels(db, 'ollama', 'Ollama', ollamaModels);
    const geminiResult = await upsertProviderWithModels(db, 'gemini', 'Gemini', geminiModels);

    await db.systemConfig.upsert({
      where: { key: 'models.lastSyncAt' },
      update: { value: now },
      create: { key: 'models.lastSyncAt', value: now, description: 'Last time models were synced from providers' },
    });

    const existingOllamaDefault = await db.systemConfig.findUnique({
      where: { key: 'models.ollama.default' },
      select: { value: true },
    });

    if (!existingOllamaDefault?.value && ollamaModels.length > 0) {
      await db.systemConfig.create({
        data: {
          key: 'models.ollama.default',
          value: ollamaModels[0],
          description: 'Default Ollama model',
        },
      });
    }

    const existingGeminiDefault = await db.systemConfig.findUnique({
      where: { key: 'models.gemini.default' },
      select: { value: true },
    });

    if (!existingGeminiDefault?.value && geminiModels.length > 0) {
      await db.systemConfig.create({
        data: {
          key: 'models.gemini.default',
          value: geminiModels[0],
          description: 'Default Gemini model',
        },
      });
    }

    const ollamaDefault = (existingOllamaDefault?.value || (ollamaResult.models[0] || '')).trim();
    if (ollamaDefault) {
      const row = await db.model.findFirst({
        where: { providerId: ollamaResult.providerId, name: ollamaDefault },
        select: { id: true },
      });
      if (row?.id) {
        await db.provider.update({
          where: { id: ollamaResult.providerId },
          data: { defaultModelId: row.id },
        });
      }
    }

    const geminiDefault = (existingGeminiDefault?.value || (geminiResult.models[0] || '')).trim();
    if (geminiDefault) {
      const row = await db.model.findFirst({
        where: { providerId: geminiResult.providerId, name: geminiDefault },
        select: { id: true },
      });
      if (row?.id) {
        await db.provider.update({
          where: { id: geminiResult.providerId },
          data: { defaultModelId: row.id },
        });
      }
    }

    return success({
      ollama: { models: ollamaModels, error: ollamaError },
      gemini: { models: geminiModels, error: geminiError },
      syncedAt: now,
    });
  } catch (err) {
    console.error('[v0] Admin models sync error:', err);
    return error('Failed to sync models', 500);
  }
}
