import readline from 'readline';

const MCP_BASE_URL = process.env.MCP_BASE_URL || 'http://localhost:3000';
const MCP_WS_URL = process.env.MCP_WS_URL || 'http://localhost:3003';

const MCP_EMAIL = process.env.MCP_EMAIL;
const MCP_PASSWORD = process.env.MCP_PASSWORD;

let accessToken = process.env.MCP_ACCESS_TOKEN || null;

async function jsonFetch(path, { method = 'GET', headers = {}, body } = {}) {
  const url = new URL(path, MCP_BASE_URL).toString();
  const res = await fetch(url, {
    method,
    headers: {
      'content-type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    const msg = data?.message || data?.error || `HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

async function ensureLogin() {
  if (accessToken) return accessToken;
  if (!MCP_EMAIL || !MCP_PASSWORD) {
    throw new Error('Missing MCP auth. Set MCP_ACCESS_TOKEN or MCP_EMAIL + MCP_PASSWORD in env.');
  }

  const data = await jsonFetch('/api/auth/login', {
    method: 'POST',
    body: { email: MCP_EMAIL, password: MCP_PASSWORD },
  });

  const token = data?.data?.accessToken;
  if (!token) throw new Error('Login succeeded but accessToken not found in response');
  accessToken = token;
  return accessToken;
}

async function authedFetch(path, { method = 'GET', body } = {}) {
  const token = await ensureLogin();
  return jsonFetch(path, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
    },
    body,
  });
}

function send(id, result, error) {
  const msg = {
    jsonrpc: '2.0',
    id,
    ...(error ? { error } : { result }),
  };
  process.stdout.write(JSON.stringify(msg) + '\n');
}

function toJsonRpcError(err) {
  return {
    code: -32000,
    message: err instanceof Error ? err.message : 'Unknown error',
    data: {
      status: err?.status,
      details: err?.data,
    },
  };
}

const tools = [
  {
    name: 'agent_session_create',
    description: 'Create a new agent session (HTTP: POST /api/agent/session)',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: 'agent_chat',
    description: 'Send a message to agent (HTTP: POST /api/agent/chat)',
    inputSchema: {
      type: 'object',
      properties: {
        sessionId: { type: 'string' },
        message: { type: 'string' },
      },
      required: ['sessionId', 'message'],
      additionalProperties: false,
    },
  },
  {
    name: 'agent_chat_history',
    description: 'Get session messages (HTTP: GET /api/agent/chat?sessionId=...)',
    inputSchema: {
      type: 'object',
      properties: {
        sessionId: { type: 'string' },
      },
      required: ['sessionId'],
      additionalProperties: false,
    },
  },
  {
    name: 'mcp_ws_info',
    description: 'Return MCP websocket URL for clients that want realtime socket.io (no auth performed).',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
  },
];

async function handleToolCall(toolName, args) {
  switch (toolName) {
    case 'agent_session_create': {
      const data = await authedFetch('/api/agent/session', { method: 'POST', body: {} });
      return data;
    }
    case 'agent_chat': {
      const data = await authedFetch('/api/agent/chat', {
        method: 'POST',
        body: { sessionId: args.sessionId, message: args.message },
      });
      return data;
    }
    case 'agent_chat_history': {
      const data = await authedFetch(`/api/agent/chat?sessionId=${encodeURIComponent(args.sessionId)}`);
      return data;
    }
    case 'mcp_ws_info': {
      return { ok: true, MCP_WS_URL };
    }
    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });

rl.on('line', async (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;

  let msg;
  try {
    msg = JSON.parse(trimmed);
  } catch {
    return;
  }

  const { id, method, params } = msg;

  try {
    if (method === 'initialize') {
      send(id, {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {},
        },
        serverInfo: {
          name: 'zombiecoder-mcp-stdio',
          version: '0.1.0',
        },
      });
      return;
    }

    if (method === 'tools/list') {
      send(id, { tools });
      return;
    }

    if (method === 'tools/call') {
      const toolName = params?.name;
      const args = params?.arguments || {};
      const result = await handleToolCall(toolName, args);

      send(id, {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
        isError: false,
      });
      return;
    }

    send(id, null, { code: -32601, message: `Method not found: ${method}` });
  } catch (err) {
    send(id, null, toJsonRpcError(err));
  }
});

rl.on('close', () => {
  process.exit(0);
});
