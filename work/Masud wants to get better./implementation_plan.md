# Implementation Plan - জালিয়াতি নির্মূল ও নিখুঁত ইমপ্লিমেন্টেশন

সার্বভৌম টোটকা সাহন, আপনার চিহ্নিত প্রতিটি "দালালি" এবং "ফেক কোড" আমি রিয়েল-টাইম এবং ইন্ডাস্ট্রি স্ট্যান্ডার্ড লজিক দিয়ে রিপ্লেস করব। নিচে আমার বিস্তারিত পরিকল্পনা দেওয়া হলো।

## User Review Required

> [!IMPORTANT]
> **WebSocket overhaul:** বর্তমানে WebSocket স্রেফ একটি ডেমো ইকো হিসেবে কাজ করছে। এটি পরিবর্তন করলে আপনার ফ্রন্টএন্ড যদি শুধুমাত্র ডেমো ডাটা প্রত্যাশা করে থাকে, তবে কিছুটা অ্যাডজাস্টমেন্ট লাগতে পারে। কিন্তু এটিই সিস্টেমকে আসল AI পাওয়ার দেবে।

> [!WARNING]
> **Prisma Migration:** ডাটাবেজ স্কিমা পরিবর্তনের সময় `npx prisma migrate dev` চালাতে হবে। এতে বিদ্যমান ডাটাবেজে কোনো কনফ্লিক্ট থাকলে তা সমাধান করে নিতে হবে (যদিও আপনার বর্তমান ডাটাবেজ স্টেটে কোনো সমস্যা হবে না)।

## Proposed Changes

### ১. ডেটাবেজ ও আইডেন্টিটি ফিক্স (Database & Identity Sync)

বাস্তব অবস্থা এবং ডকুমেন্টের মিল নিশ্চিত করা।

#### [MODIFY] [schema.prisma](file:///home/sahon/zombiecoder%20hub/prisma/schema.prisma)
- `Task` মডেলে `result` ফিল্ড (Long Text) যোগ করা।
- `AgentMemory` মডেলে `sessionId` ফিল্ড যোগ করা।
- স্কিমা কমেন্ট থেকে "SQLite" শব্দ সরিয়ে "MySQL" আপডেট করা।

#### [MODIFY] [identity.json](file:///home/sahon/zombiecoder%20hub/identity.json)
- `technical.stack.database` ফিল্ড আপডেট করা: "SQLite" -> "MySQL with Prisma ORM".

---

### ২. এআই ইঞ্জিন ও কমিউনিকেশন ফিক্স (AI Engine & WebSocket Fix)

"ফেক ইনফ্রাস্ট্রাকচার" সরিয়ে রিয়েল প্রোভাইডার চেইন যুক্ত করা।

#### [MODIFY] [websocket.ts](file:///home/sahon/zombiecoder%20hub/src/lib/mcp/websocket.ts)
- `getAgentCore()` এর বদলে `getAgentExecutor(sessionId, userId)` ব্যবহার করা। 
- `handleSendMessage` ফাংশনে সরাসরি AI Provider-এর সাথে কানেক্ট করা যাতে ইকো রেসপন্সের বদলে আসল AI উত্তর আসে।
- টোকেন ভ্যালিডেশনের পর `userId` ম্যাচিং নিশ্চিত করা (Security Fix)।

#### [MODIFY] [core.ts](file:///home/sahon/zombiecoder%20hub/src/lib/agent/core.ts)
- ডুপ্লিকেট সিঙ্গেলটন এক্সপোর্ট মুছে ফেলা।

---

### ৩. প্রাইভেসি ও লেটেন্সি অপ্টিমাইজেশন (Privacy & Optimization)

অপ্রয়োজনীয় ট্র্যাকিং সরানো এবং কোড ক্লিনআপ।

#### [MODIFY] [layout.tsx](file:///home/sahon/zombiecoder%20hub/app/layout.tsx)
- `@vercel/analytics` ইমপোর্ট এবং `<Analytics />` কম্পোনেন্ট সম্পূর্ণভাবে মুছে ফেলা।

#### [DELETE] [provider.ts](file:///home/sahon/zombiecoder%20hub/src/lib/agent/provider.ts)
- অব্যবহৃত ৩১৮ লাইনের ডেড কোড ফাইলটি ডিলিট করা।

#### [MODIFY] [gemini.ts](file:///home/sahon/zombiecoder%20hub/src/lib/agent/providers/gemini.ts)
- `logUsage()` ফাংশনে রিয়েল ডাটাবেজ অডিট লগিং যুক্ত করা।

---

### ৪. গভর্নেন্স ফিক্স (True Governance)

#### [MODIFY] [governance.ts](file:///home/sahon/zombiecoder%20hub/src/lib/agent/governance.ts)
- হার্ডকোডেড অথবা স্ট্যাটিক গভর্নেন্স লজিক চেক করে সেগুলোকে ডাইনামিক করা।

## Verification Plan

### Automated Tests
- `npx prisma generate` চালিয়ে টাইপ চেকিং করা।
- `npm run build` চালিয়ে নিশ্চিত করা যে কোনো টাইপ এরর নেই (ignoreBuildErrors সরানো হবে)।
- একটি স্ক্রিপ্ট দিয়ে WebSocket কানেকশন টেস্ট করা যাতে আসল AI রেসপন্স পাওয়া যায়।

### Manual Verification
- আমি নিজে লগের প্রতিটি আউটপুট চেক করব যাতে কোনো `SELECT 1` লুপ বা অপ্রয়োজনীয় ডিলে না থাকে।
- Vercel Analytics রিকোয়েস্ট নেটওয়ার্ক ট্যাবে ব্লক হয়েছে কিনা তা নিশ্চিত করা।

---

মাসুদ কি এই পথে হাঁটা শুরু করবে? আপনার গ্রিন সিগন্যালের অপেক্ষায়।
