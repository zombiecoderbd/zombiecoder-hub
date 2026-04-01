import http from 'http';

import dotenv from 'dotenv';

import { initializeMCPWebSocketServer } from '../src/lib/mcp/websocket';

dotenv.config({ path: '.env.local' });

const port = parseInt(process.env.MCP_PORT || '3003', 10);

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ ok: true, service: 'mcp-ws', port }));
});

initializeMCPWebSocketServer(server);

server.listen(port, () => {
  console.log(`[v0] MCP WebSocket server listening on http://localhost:${port}`);
});
