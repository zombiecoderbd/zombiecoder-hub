import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });

const PROOF_LOG: any[] = [];

async function streamTest(token: string, sessionId: string, message: string, provider: string) {
  const baseUrl = 'http://localhost:3000';
  const chatRes = await fetch(`${baseUrl}/api/agent/chat`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      sessionId,
      message,
      provider,
      stream: true
    })
  });

  if (!chatRes.ok) {
    throw new Error(`Chat request for ${provider} failed: ${chatRes.statusText}`);
  }

  const reader = chatRes.body?.getReader();
  const decoder = new TextDecoder();
  const resLog: any = { provider, message, chunks: [], traceId: null };
  const startTime = Date.now();
  
  process.stdout.write(`${provider.toUpperCase()} Stream: `);

  if (reader) {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const data = JSON.parse(line);
          resLog.traceId = data.traceId;
          resLog.chunks.push({ content: data.content, timestamp: data.timestamp });
          process.stdout.write(data.content);
        } catch (e) {
          // Partial JSON
        }
      }
    }
  }

  const duration = Date.now() - startTime;
  resLog.duration = duration;
  console.log(`\n[METRICS] Duration: ${duration}ms\n`);
  PROOF_LOG.push(resLog);
}

async function runVerification() {
  const email = 'admin@zombiecoder.local';
  const password = 'admin123';
  const baseUrl = 'http://localhost:3000';

  console.log('\n--- DOUBLE PROOF FORENSIC VERIFICATION START ---');

  // 1. LOGIN
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const loginData = await loginRes.json() as any;
  if (!loginData.success) {
    throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
  }
  const token = loginData.data.accessToken;
  console.log('✓ Login successful.');

  // 2. CREATE SESSION
  const sessionRes = await fetch(`${baseUrl}/api/agent/session`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ agentId: 'editor-agent-001' })
  });
  const sessionData = await sessionRes.json() as any;
  const sessionId = sessionData.data.sessionId;
  console.log(`✓ Session created: ${sessionId}`);

  // 3. RUN TESTS
  console.log('\n[3/4] Requesting Ollama Stream...');
  await streamTest(token, sessionId, 'তুমি কে? তোমার আর্কিটেকচার সম্পর্কে সংক্ষেপে বলো।', 'ollama');

  console.log('\n[4/4] Requesting Gemini Stream...');
  await streamTest(token, sessionId, 'Explain the benefits of local-first AI development.', 'gemini');

  // 4. SAVE RESULTS
  const resultPath = '/home/sahon/zombiecoder hub/work/Masud wants to get better./double-proof-results.json';
  fs.writeFileSync(resultPath, JSON.stringify(PROOF_LOG, null, 2));
  console.log(`\n✓ Double Proof Results (Client-side) saved to: ${resultPath}`);
  console.log('\n--- VERIFICATION COMPLETE ---');
}

runVerification().catch(err => {
  console.error('\n❌ VERIFICATION FAILED:', err.message);
  process.exit(1);
});
