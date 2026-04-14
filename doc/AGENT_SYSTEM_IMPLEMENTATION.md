# ZombieCoder Hub v2.0 - Agent System Implementation Guide

## Current Status (Audit Results)

### What Actually Works (Tested & Real)
1. **Database Layer** - Prisma schema with 13 models (Users, Sessions, Messages, Agents, Tools, etc.)
2. **Authentication** - JWT tokens, bcrypt hashing, register/login/refresh endpoints
3. **RBAC System** - 20 permissions defined, role-based access control
4. **Provider Abstraction** - Base AIProvider class with Ollama/OpenAI/Gemini support
5. **API Response Utility** - Standard response formatting with watermarking

### What Was Template Code (Now Removed)
- ✅ Removed: `/app/api/agent/chat/route.ts` (referenced non-existent imports)
- ✅ Removed: `/app/api/agent/stream/route.ts` (referenced non-existent imports)
- ✅ Removed: `/app/admin/layout.tsx` (referenced non-existent components)
- ✅ Removed: `/app/admin/page.tsx` (template without real data)

### What Doesn't Exist Yet (Need to Build)
- Agent execution engine
- Tool execution framework
- Governance validator
- Memory system
- WebSocket handler
- SSE streaming

## Next Steps: Phase 6 - Production-Ready Agent System

### Build Order
1. Ollama provider (local AI)
2. OpenAI provider (cloud fallback)
3. Gemini provider (cloud fallback)
4. Agent core executor
5. Tool system with real execution
6. Governance validator
7. Chat endpoint with tool use
8. Real-time streaming

### Architecture
```
User Input
  ↓
/api/agent/chat POST
  ↓
Verify JWT
  ↓
Get or create session
  ↓
Store user message in DB
  ↓
Call AI Provider (Ollama → OpenAI → Gemini)
  ↓
Parse response for tool calls
  ↓
Execute tools with governance checks
  ↓
Store assistant message in DB
  ↓
Return response
```

## Files to Create (Phase 6)

### 1. Providers (270 lines total)
- `src/lib/agent/providers/ollama.ts` (90 lines)
- `src/lib/agent/providers/openai.ts` (90 lines)
- `src/lib/agent/providers/gemini.ts` (90 lines)

### 2. Agent System (400 lines)
- `src/lib/agent/executor.ts` (200 lines) - Main agent logic
- `src/lib/agent/tools-executor.ts` (150 lines) - Tool execution
- `src/lib/agent/memory-store.ts` (50 lines) - Message persistence

### 3. API Endpoint (120 lines)
- `app/api/agent/chat/route.ts` (120 lines) - Chat endpoint

## Key Implementation Notes

### Ollama (Local, Primary)
```
Environment: OLLAMA_BASE_URL=http://localhost:11434
Model: OLLAMA_MODEL=smollm:latest (default)
Cost: $0 (runs locally)
Fallback: If connection fails, try OpenAI
```

### OpenAI (Cloud, Fallback)
```
Environment: OPENAI_API_KEY=sk-...
Model: gpt-4-turbo-preview
Cost: $0.01-0.03 per 1K tokens
```

### Gemini (Cloud, Fallback)
```
Environment: GEMINI_API_KEY=...
Model: gemini-flash-latest
Cost: Free tier available
```

## Build Commands
```bash
# Setup
npm install
npm run prisma:generate
npm run setup

# Development
npm run dev

# Production
npm run build
npm start
```

## Testing the Agent
```bash
# 1. Get JWT token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@zombiecoder.local","password":"ZombieCoder@Admin123"}'

# 2. Create session
curl -X POST http://localhost:3000/api/agent/session \
  -H "Authorization: Bearer $TOKEN"

# 3. Send message
curl -X POST http://localhost:3000/api/agent/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"...","message":"What is 2+2?"}'
```

## Success Criteria
- ✅ Can authenticate with JWT
- ✅ Can create agent sessions
- ✅ Can send messages to Ollama (local)
- ✅ Falls back to OpenAI if Ollama unavailable
- ✅ Messages stored in database
- ✅ Responses include proper metadata
- ✅ No broken imports
- ✅ All errors properly handled
- ✅ Audit logging on all operations
