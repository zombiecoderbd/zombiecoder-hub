import { getOllamaProvider } from '../../src/lib/agent/providers/ollama';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTest() {
  const provider = getOllamaProvider();
  const results: any[] = [];
  const questions = [
    { lang: 'English', text: 'Who are you and what is your purpose?' },
    { lang: 'Bengali', text: 'তুমি কে এবং তোমার কাজ কি?' },
    { lang: 'English', text: 'Explain the concept of Model Context Protocol (MCP).' },
    { lang: 'Bengali', text: 'মডেল কনটেক্সট প্রোটোকল (MCP) সম্পর্কে বিস্তারিত বলো।' }
  ];

  console.log('\n--- OLLAMA REAL-TIME VERIFICATION START ---');

  // 1. Non-Streaming Test
  console.log('\n[TEST 1: Non-Streaming JSON Response]');
  for (const q of questions.slice(0, 2)) {
    console.log(`\nQuestion (${q.lang}): ${q.text}`);
    const start = Date.now();
    try {
      const response = await provider.sendMessage([{ role: 'user', content: q.text }]);
      const latency = Date.now() - start;
      console.log(`Answer: ${response.substring(0, 50)}...`);
      results.push({
        type: 'non-streaming',
        lang: q.lang,
        question: q.text,
        answer: response,
        latency,
        model: process.env.OLLAMA_MODEL || 'smollm:latest',
        provider: 'ollama'
      });
    } catch (err) {
      console.error('Error:', err);
    }
  }

  // 2. Streaming Simulation (since sendMessage is non-streaming, we simulate chunk typing)
  console.log('\n[TEST 2: Streaming Mode (Simulated Typing Effect)]');
  for (const q of questions.slice(2)) {
    console.log(`\nQuestion (${q.lang}): ${q.text}`);
    const start = Date.now();
    try {
      const response = await provider.sendMessage([{ role: 'user', content: q.text }]);
      const latency = Date.now() - start;
      
      process.stdout.write('Agent: ');
      const words = response.split(' ');
      for (const word of words) {
        process.stdout.write(word + ' ');
        await sleep(50); // Simulated typing delay
      }
      console.log('\n');
      
      results.push({
        type: 'streaming',
        lang: q.lang,
        question: q.text,
        answer: response,
        latency,
        model: process.env.OLLAMA_MODEL || 'smollm:latest',
        provider: 'ollama'
      });
    } catch (err) {
      console.error('Error:', err);
    }
  }

  const resultPath = path.join(__dirname, 'ollama-results.json');
  fs.writeFileSync(resultPath, JSON.stringify(results, null, 2));
  console.log(`\nVerification Results saved to: ${resultPath}`);
  console.log('--- OLLAMA VERIFICATION COMPLETE ---');
}

runTest().catch(console.error);
