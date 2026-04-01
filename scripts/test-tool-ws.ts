import { io } from 'socket.io-client';

type JoinPayload = { sessionId: string; userId: string; token: string };

type ToolCallPayload = {
  sessionId: string;
  userId: string;
  toolName: string;
  parameters: Record<string, any>;
};

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const WS_URL = process.env.MCP_WS_URL || 'http://localhost:3003';
  const BASE_URL = process.env.MCP_BASE_URL || 'http://localhost:3000';
  const EMAIL = process.env.MCP_EMAIL;
  const PASSWORD = process.env.MCP_PASSWORD;

  if (!EMAIL || !PASSWORD) {
    throw new Error('Missing MCP_EMAIL/MCP_PASSWORD env vars');
  }

  const loginRes = await fetch(new URL('/api/auth/login', BASE_URL), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const loginJson: any = await loginRes.json();
  const token = loginJson?.data?.accessToken;
  const userId = loginJson?.data?.user?.id;
  if (!token || !userId) throw new Error('Login failed or missing token/userId');

  const sessionRes = await fetch(new URL('/api/agent/session', BASE_URL), {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
    body: JSON.stringify({}),
  });
  const sessionJson: any = await sessionRes.json();
  const sessionId = sessionJson?.data?.sessionId;
  if (!sessionId) throw new Error('Session create failed');

  console.log(`[test] userId=${userId}`);
  console.log(`[test] sessionId=${sessionId}`);

  const socket = io(WS_URL, { transports: ['websocket'] });

  const joined = await new Promise<boolean>((resolve) => {
    socket.on('connect', () => {
      const payload: JoinPayload = { sessionId, userId, token };
      socket.emit('join-session', payload);
    });

    socket.on('joined-session', () => resolve(true));
    socket.on('error', (e: any) => {
      console.error('[socket error]', e);
      resolve(false);
    });
  });

  if (!joined) {
    socket.disconnect();
    process.exit(1);
  }

  console.log('[test] joined-session OK');

  socket.on('tool-denied', (d: any) => {
    console.error('[test] tool-denied', d);
  });

  const toolResult = await new Promise<any>((resolve, reject) => {
    const payload: ToolCallPayload = {
      sessionId,
      userId,
      toolName: 'search-files',
      parameters: { pattern: 'package.json', directory: '.' },
    };

    socket.emit('call-tool', payload);

    const timer = setTimeout(() => reject(new Error('Timed out waiting tool-result')), 15000);

    socket.on('tool-result', (r: any) => {
      clearTimeout(timer);
      resolve(r);
    });

    socket.on('error', (e: any) => {
      clearTimeout(timer);
      reject(new Error(e?.message || 'socket error'));
    });
  });

  console.log('[test] tool-result:', JSON.stringify(toolResult, null, 2));

  await sleep(250);
  socket.disconnect();

  console.log('[test] done');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
