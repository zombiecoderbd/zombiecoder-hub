# EXECUTION SIGNATURE - ZombieCoder Hub v2.0 Fix Execution

## প্রতিশ্রুতি নথি

**তারিখ:** 13 April 2026, 10:36 AM (BDT)
**Executor:** Antigravity (Claude Opus 4.6 Thinking)
**প্রজেক্ট:** ZombieCoder Hub v2.0
**প্রজেক্ট পাথ:** /home/sahon/zombiecoder hub/
**Request By:** Totka Sahon

---

## কি করব (প্রতিশ্রুতি)

নিচের 11টি সমস্যা fix করব। প্রতিটি ধাপ output.log-এ record হবে।

| # | কাজ | ফাইল | Confidence |
|---|------|------|------------|
| 1 | Task model-এ result field যোগ | prisma/schema.prisma | 100% |
| 2 | AgentMemory-তে sessionId field যোগ | prisma/schema.prisma | 100% |
| 3 | ignoreBuildErrors: true সরানো | next.config.mjs | 90% |
| 4 | WebSocket-এ AgentExecutor ব্যবহার | src/lib/mcp/websocket.ts | 95% |
| 5 | WebSocket auth ownership check | src/lib/mcp/websocket.ts | 100% |
| 6 | Duplicate singleton সরানো | src/lib/agent/core.ts | 100% |
| 7 | Dead code delete | src/lib/agent/provider.ts | 100% |
| 8 | Gemini logUsage() DB audit | src/lib/agent/providers/gemini.ts | 100% |
| 9 | identity.json SQLite->MySQL | identity.json | 100% |
| 10 | Duplicate files delete | styles/, hooks/ | 95% |
| 11 | Vercel Analytics সরানো | app/layout.tsx | 100% |

## Verification Plan

- প্রতিটি fix-এর পর file diff দেখানো হবে
- সব fix শেষে: `npx prisma generate` + `npx prisma migrate dev`
- `next build` চালিয়ে TypeScript error check
- সব process বন্ধ করে নতুন করে start
- output.log-এ সব command output record

## Accountability

- কাজ মিললে: **Audit Verified**
- আংশিক হলে transparent কারণ দেব: **Partial Delivery**
- কথা ও কাজ না মিললে: **Audit Bypass / False Report**

## Signature

```
SIGNED: Antigravity-Claude-Opus-4.6
TIMESTAMP: 2026-04-13T04:36:19Z
HASH: SHA256(fix-plan.html + execution-signature.md)
STATUS: EXECUTION_AUTHORIZED
WITNESS: output.log (before + after comparison)
```

---

এই নথি অস্বীকারযোগ্য নয়। কাজ শুরু হচ্ছে।
