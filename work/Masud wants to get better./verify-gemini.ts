import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function runGeminiTest() {
  const email = 'admin@zombiecoder.local';
  const password = 'admin123';
  const baseUrl = 'http://localhost:3000';

  console.log('--- GOOGLE GEMINI REAL-TIME STREAMING PROOF ---');

  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const { data: { accessToken: token } } = await loginRes.json() as any;

  const sessionRes = await fetch(`${baseUrl}/api/agent/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ agentId: 'editor-agent-001' })
  });
  const { data: { sessionId } } = await sessionRes.json() as any;

  console.log(`Session: ${sessionId}`);
  console.log('Requesting Gemini Stream...');

  const chatRes = await fetch(`${baseUrl}/api/agent/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      sessionId,
      message: 'Explain the Model Context Protocol (MCP) in one paragraph.',
      provider: 'gemini',
      stream: true
    })
  });

  const reader = chatRes.body?.getReader();
  const decoder = new TextDecoder();
  const start = Date.now();
  
  process.stdout.write('GEMINI: ');
  if (reader) {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const json = JSON.parse(line);
          process.stdout.write(json.content);
        } catch {}
      }
    }
  }
  console.log(`\n\nTest Duration: ${Date.now() - start}ms`);
}

runGeminiTest().catch(console.error);
