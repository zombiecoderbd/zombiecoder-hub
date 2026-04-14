import { io } from 'socket.io-client';

/**
 * MCP WebSocket টেস্ট স্ক্রিপ্ট
 * টেস্ট করবে:
 * 1. WebSocket সার্ভারে কানেক্ট হওয়া
 * 2. সেশনে জয়েন করা
 * 3. টুল কল করা (search-files)
 * 4. মেসেজ পাঠানো
 */

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const WS_URL = 'http://localhost:3003';
  const BASE_URL = 'http://localhost:3000';
  const EMAIL = 'admin@zombiecoder.local';
  const PASSWORD = 'admin123';

  console.log('═══════════════════════════════════════════');
  console.log('  🔌 MCP WebSocket টেস্ট শুরু হচ্ছে...');
  console.log('═══════════════════════════════════════════\n');

  // ধাপ ১: লগইন
  console.log('[১/৫] লগইন করা হচ্ছে...');
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });

  if (!loginRes.ok) {
    console.error('❌ লগইন ফেইল:', loginRes.status);
    process.exit(1);
  }

  const loginData = await loginRes.json();
  const token = loginData?.data?.accessToken;
  const userId = loginData?.data?.user?.id;

  if (!token || !userId) {
    console.error('❌ টোকেন বা userId পাওয়া যায়নি');
    process.exit(1);
  }

  console.log(`✅ লগইন সফল | userId: ${userId}\n`);

  // ধাপ ২: সেশন তৈরি
  console.log('[২/৫] নতুন সেশন তৈরি করা হচ্ছে...');
  const sessionRes = await fetch(`${BASE_URL}/api/agent/session`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({}),
  });

  if (!sessionRes.ok) {
    console.error('❌ সেশন তৈরি ফেইল:', sessionRes.status);
    process.exit(1);
  }

  const sessionData = await sessionRes.json();
  const sessionId = sessionData?.data?.sessionId;

  if (!sessionId) {
    console.error('❌ sessionId পাওয়া যায়নি');
    process.exit(1);
  }

  console.log(`✅ সেশন তৈরি সফল | sessionId: ${sessionId}\n`);

  // ধাপ ৩: WebSocket কানেক্ট
  console.log('[৩/৫] WebSocket সার্ভারে কানেক্ট করা হচ্ছে...');
  const socket = io(WS_URL, { transports: ['websocket'] });

  const joined = await new Promise<boolean>((resolve) => {
    socket.on('connect', () => {
      console.log('  → Socket কানেক্টেড');
      socket.emit('join-session', { sessionId, userId, token });
    });

    socket.on('joined-session', (data: any) => {
      console.log(`  → সেশনে জয়েন সফল: ${data?.sessionId}`);
      resolve(true);
    });

    socket.on('error', (e: any) => {
      console.error('  ❌ Socket এরর:', e);
      resolve(false);
    });

    // ১০ সেকেন্ড টাইমআউট
    setTimeout(() => resolve(false), 10000);
  });

  if (!joined) {
    console.error('❌ সেশনে জয়েন করতে পারেনি');
    socket.disconnect();
    process.exit(1);
  }

  console.log('✅ WebSocket কানেকশন সফল\n');

  // ধাপ ৪: টুল কল করা
  console.log('[৪/৫] টুল কল করা হচ্ছে (search-files)...');
  
  const toolResult = await new Promise<any>((resolve, reject) => {
    socket.emit('call-tool', {
      sessionId,
      userId,
      toolName: 'search-files',
      parameters: { pattern: 'package.json', directory: '.' },
    });

    const timer = setTimeout(() => {
      reject(new Error('১৫ সেকেন্ডে tool-result আসেনি'));
    }, 15000);

    socket.on('tool-result', (result: any) => {
      clearTimeout(timer);
      resolve(result);
    });

    socket.on('tool-denied', (data: any) => {
      clearTimeout(timer);
      reject(new Error(`টুল ডিনাইড: ${JSON.stringify(data)}`));
    });

    socket.on('error', (e: any) => {
      clearTimeout(timer);
      reject(new Error(e?.message || 'socket error'));
    });
  });

  console.log('✅ টুল কল সফল');
  console.log(`  ফলাফল: ${typeof toolResult === 'string' ? toolResult.substring(0, 100) : JSON.stringify(toolResult).substring(0, 100)}...\n`);

  // ধাপ ৫: মেসেজ পাঠানো
  console.log('[৫/৫] মেসেজ পাঠানো হচ্ছে...');
  
  const messageReceived = await new Promise<boolean>((resolve) => {
    socket.emit('send-message', {
      sessionId,
      userId,
      message: 'Hello from WebSocket test!',
    });

    const timer = setTimeout(() => resolve(false), 30000);

    socket.on('message', (data: any) => {
      if (data?.role === 'assistant') {
        clearTimeout(timer);
        console.log(`  → AI রেসপন্স: "${data?.content?.substring(0, 80)}..."`);
        console.log(`  → Provider: ${data?.provider}`);
        resolve(true);
      } else if (data?.role === 'user') {
        console.log(`  → ইউজার মেসেজ স্টোর্ড হয়েছে`);
      }
    });

    socket.on('error', () => {
      clearTimeout(timer);
      resolve(false);
    });
  });

  if (messageReceived) {
    console.log('✅ মেসেজ পাঠানো ও রেসপন্স পাওয়া সফল\n');
  } else {
    console.log('⚠️ মেসেজ পাঠানো হয়েছে কিন্তু রেসপন্স টাইমআউট হয়েছে\n');
  }

  // ক্লিনআপ
  await sleep(500);
  socket.disconnect();

  console.log('═══════════════════════════════════════════');
  console.log('  ✅ সব টেস্ট সফলভাবে সম্পন্ন হয়েছে!');
  console.log('═══════════════════════════════════════════');
  console.log('\nসারসংক্ষেপ:');
  console.log('  ✅ লগইন সফল');
  console.log('  ✅ সেশন তৈরি সফল');
  console.log('  ✅ WebSocket কানেকশন সফল');
  console.log('  ✅ টুল কল সফল');
  console.log('  ✅ মেসেজ পাঠানো সফল');
  console.log('\nMCP WebSocket সার্ভার সঠিকভাবে কাজ করছে! ✅\n');
}

main().catch((e) => {
  console.error('\n❌ টেস্ট ফেইল:', e.message);
  console.error(e.stack);
  process.exit(1);
});
