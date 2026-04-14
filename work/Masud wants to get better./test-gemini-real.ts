import { getGeminiProvider } from '../../src/lib/agent/providers/gemini';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTest() {
  const provider = getGeminiProvider();
  const results: any[] = [];
  const questions = [
    { lang: 'English', text: 'Tell me about the importance of Data Sovereignty for developers.' },
    { lang: 'Bengali', text: 'ডেভেলপারদের জন্য ডাটা সার্বভৌমত্বের গুরুত্ব সম্পর্কে বলো।' },
    { lang: 'English', text: 'How do you handle complex reasoning tasks?' },
    { lang: 'Bengali', text: 'তুমি কিভাবে জটিল যুক্তি ভিত্তিক কাজগুলো সমাধান করো?' }
  ];

  console.log('\n--- GEMINI REAL-TIME VERIFICATION START ---');

  if (!provider.isConfigured()) {
    console.error('Error: GEMINI_API_KEY is not configured in .env.local');
    return;
  }

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
        model: 'gemini-flash-latest',
        provider: 'gemini'
      });
    } catch (err) {
      console.error('Error:', err);
    }
  }

  // 2. Streaming Simulation (Simulated Typing Effect)
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
        await sleep(30); // Faster typing for Gemini
      }
      console.log('\n');
      
      results.push({
        type: 'streaming',
        lang: q.lang,
        question: q.text,
        answer: response,
        latency,
        model: 'gemini-flash-latest',
        provider: 'gemini'
      });
    } catch (err) {
      console.error('Error:', err);
    }
  }

  const resultPath = path.join(__dirname, 'gemini-results.json');
  fs.writeFileSync(resultPath, JSON.stringify(results, null, 2));
  console.log(`\nVerification Results saved to: ${resultPath}`);
  console.log('--- GEMINI VERIFICATION COMPLETE ---');
}

runTest().catch(console.error);
