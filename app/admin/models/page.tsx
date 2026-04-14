'use client';

import { useEffect, useMemo, useState } from 'react';
import { Header } from '../components/Header';

type ProviderKey = 'ollama' | 'gemini';

interface ModelsResponse {
  ollama: { models: string[]; defaultModel: string };
  gemini: { models: string[]; defaultModel: string };
  lastSyncAt: string;
}

function getToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('token') || '';
}

export default function ModelsPage() {
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');

  const [data, setData] = useState<ModelsResponse>({
    ollama: { models: [], defaultModel: '' },
    gemini: { models: [], defaultModel: '' },
    lastSyncAt: '',
  });

  const [selectedDefault, setSelectedDefault] = useState<{ ollama: string; gemini: string }>({
    ollama: '',
    gemini: '',
  });

  const token = useMemo(() => getToken(), []);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/models', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();
      if (!res.ok || !json?.success) {
        throw new Error(json?.error || 'Failed to load models');
      }

      setData(json.data);
      setSelectedDefault({
        ollama: json.data?.ollama?.defaultModel || '',
        gemini: json.data?.gemini?.defaultModel || '',
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const sync = async () => {
    setSyncing(true);
    setError('');
    try {
      const res = await fetch('/api/admin/models/sync', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();
      if (!res.ok || !json?.success) {
        throw new Error(json?.error || 'Failed to sync models');
      }

      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setSyncing(false);
    }
  };

  const saveDefault = async (provider: ProviderKey) => {
    setError('');
    try {
      const model = (selectedDefault[provider] || '').trim();
      if (!model) return;

      const res = await fetch('/api/admin/models/default', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ provider, model }),
      });

      const json = await res.json();
      if (!res.ok || !json?.success) {
        throw new Error(json?.error || 'Failed to set default model');
      }

      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <Header title="Models" subtitle="Manage provider model lists and default models" />

      <div className="mt-6 flex items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">
          {data.lastSyncAt ? `Last sync: ${data.lastSyncAt}` : 'Not synced yet'}
        </div>
        <button
          onClick={sync}
          disabled={syncing}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {syncing ? 'Syncing…' : 'Sync'}
        </button>
      </div>

      {error ? (
        <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-bold text-foreground">Ollama</h3>
          <p className="text-sm text-muted-foreground mt-1">Local provider models</p>

          <div className="mt-4">
            <label className="block text-sm font-medium text-foreground mb-2">Default model</label>
            <div className="flex gap-3">
              <select
                value={selectedDefault.ollama}
                onChange={(e) => setSelectedDefault((p) => ({ ...p, ollama: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg border border-border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={loading}
              >
                <option value="">Select default</option>
                {data.ollama.models.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <button
                onClick={() => saveDefault('ollama')}
                disabled={!selectedDefault.ollama || loading}
                className="px-4 py-2 rounded-lg border border-border hover:bg-muted disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>

          <div className="mt-6">
            <div className="text-sm font-medium text-foreground mb-2">Models</div>
            <div className="rounded-lg border border-border bg-background max-h-72 overflow-auto">
              {loading ? (
                <div className="p-4 text-sm text-muted-foreground">Loading…</div>
              ) : data.ollama.models.length ? (
                <ul className="divide-y divide-border">
                  {data.ollama.models.map((m) => (
                    <li key={m} className="px-4 py-3 text-sm text-foreground">
                      {m}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-sm text-muted-foreground">No models found. Click Sync.</div>
              )}
            </div>
          </div>
        </section>

        <section className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-bold text-foreground">Gemini</h3>
          <p className="text-sm text-muted-foreground mt-1">Cloud provider models (requires GEMINI_API_KEY and quota)</p>

          <div className="mt-4">
            <label className="block text-sm font-medium text-foreground mb-2">Default model</label>
            <div className="flex gap-3">
              <select
                value={selectedDefault.gemini}
                onChange={(e) => setSelectedDefault((p) => ({ ...p, gemini: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg border border-border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={loading}
              >
                <option value="">Select default</option>
                {data.gemini.models.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <button
                onClick={() => saveDefault('gemini')}
                disabled={!selectedDefault.gemini || loading}
                className="px-4 py-2 rounded-lg border border-border hover:bg-muted disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>

          <div className="mt-6">
            <div className="text-sm font-medium text-foreground mb-2">Models</div>
            <div className="rounded-lg border border-border bg-background max-h-72 overflow-auto">
              {loading ? (
                <div className="p-4 text-sm text-muted-foreground">Loading…</div>
              ) : data.gemini.models.length ? (
                <ul className="divide-y divide-border">
                  {data.gemini.models.map((m) => (
                    <li key={m} className="px-4 py-3 text-sm text-foreground">
                      {m}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-sm text-muted-foreground">No models found. Click Sync.</div>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
