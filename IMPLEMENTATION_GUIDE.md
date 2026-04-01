# ZombieCoder Hub v2.0 - Implementation Guide

**যেখানে কোড ও কথা বলে** | *Where Code Speaks and Problems Are Shouldered*

---

## Executive Summary

ZombieCoder Hub v2.0 is a **production-ready, ethically-driven development assistant platform** built on:

- **Local-First Operation** - All processing happens on-device
- **Identity Watermarking** - Every response carries immutable ownership metadata
- **Ethics Framework** - Governance validates all operations for safety
- **Multi-Provider AI** - Ollama (primary), OpenAI, Gemini (fallback)
- **MCP Protocol** - Full Model Context Protocol support (HTTP, SSE, WebSocket, Stdio)
- **Complete RBAC** - Role-based access control for Admin/Client users
- **Cross-Platform** - Windows, Linux, macOS compatible

---

## Project Status

**Phase 1: Core Identity System** ✅ COMPLETE

The foundational layer has been implemented:
- ✅ `identity.json` - Immutable system identity (Read-Only)
- ✅ `src/middleware.ts` - Global HTTP watermarking middleware
- ✅ `prisma/schema.prisma` - Complete database schema (13 models, 50+ fields)
- ✅ `src/lib/config/index.ts` - System configuration management
- ✅ `.env.example` - Environment template with full documentation
- ✅ `scripts/init-db.ts` - Database initialization and seeding
- ✅ `src/lib/auth/rbac.ts` - Complete RBAC permission system

**Next Phases (To Be Implemented):**
- Phase 2: Build Authentication & API Gateway
- Phase 3: Implement Agent Core System
- Phase 4: Create Admin Dashboard
- Phase 5: Setup MCP Transport Protocol

---

## File Structure Overview

```
zombiecoder-hub/
├── identity.json                    # ✅ Immutable system identity
├── .env.example                     # ✅ Environment template
│
├── src/
│   ├── middleware.ts               # ✅ Global watermarking
│   ├── lib/
│   │   ├── config/
│   │   │   └── index.ts            # ✅ System configuration
│   │   └── auth/
│   │       └── rbac.ts             # ✅ Role-based access control
│   ├── app/
│   │   ├── api/                    # [To Be Implemented]
│   │   ├── admin/                  # [To Be Implemented]
│   │   ├── agents/                 # [To Be Implemented]
│   │   └── layout.tsx
│   └── agents/                     # [To Be Implemented]
│
├── prisma/
│   ├── schema.prisma               # ✅ Complete database schema
│   ├── seed.ts                     # [To Be Implemented]
│   └── dev.db                      # [Auto-created on init]
│
├── scripts/
│   └── init-db.ts                  # ✅ Database initialization
│
└── Documentation files
    ├── README.md
    ├── IMPLEMENTATION_GUIDE.md     # ← You are here
    └── DEVELOPMENT.md              # [To Be Implemented]
```

---

## Phase 1: Core Identity System (COMPLETED)

### What Was Implemented

#### 1. **identity.json** - The Immutable Core
```json
{
  "system_identity": {
    "name": "ZombieCoder",
    "version": "2.0.0",
    "branding": {
      "owner": "Sahon Srabon",
      "organization": "Developer Zone",
      "address": "235 South Pirarbag, Amtala Bazar, Mirpur - 60 feet",
      "location": "Dhaka, Bangladesh",
      "phone": "+880 1323-626282",
      "email": "info@zombiecoder.my.id",
      "website": "https://zombiecoder.my.id/"
    },
    "security": {
      "identity_watermark": "X-Powered-By: ZombieCoder",
      "metadata_protection": "Read-Only",
      "tamper_detection": true
    }
  }
}
```

**Purpose:** Stores immutable system identity. Cannot be modified after creation.

**Protection:** File should be marked Read-Only in production.

#### 2. **middleware.ts** - HTTP Watermarking
Every HTTP response includes headers:
```
X-Powered-By: ZombieCoder
X-ZombieCoder-Version: 2.0.0
X-ZombieCoder-Owner: Sahon Srabon
X-ZombieCoder-Organization: Developer Zone
X-ZombieCoder-Signature: [UUID]
X-Request-ID: [UUID]
X-Timestamp: [ISO-8601]
```

**Purpose:** Proves ownership and enables tamper detection.

#### 3. **prisma/schema.prisma** - Database Schema

**13 Core Models:**
- **Users** - User accounts with roles (ADMIN, CLIENT)
- **Sessions** - Agent interaction sessions
- **Messages** - Conversation messages with role context
- **Agents** - AI agent configuration and metadata
- **AgentConfig** - Per-user agent customization
- **AgentMemory** - Vector embeddings and semantic memory
- **Tools** - Available tools with risk levels
- **ToolPermission** - Role-based tool access
- **ToolExecution** - Audit trail for tool runs
- **GovernancePolicy** - Ethics rules and constraints
- **AuditLog** - Complete operation audit trail
- **Task** - Session-bound task tracking
- **Project** - Project management metadata

**Key Features:**
- Relationships with cascading deletes
- Indexes for performance on common queries
- JSON fields for flexible metadata storage
- Timestamp tracking (createdAt, updatedAt)

#### 4. **lib/config/index.ts** - Configuration Management

**Functions:**
- `loadSystemIdentity()` - Load identity.json with caching
- `getEnvironmentConfig()` - Load and validate .env variables
- `initializeSystemConfig()` - Bootstrap with logging
- `verifySystemIntegrity()` - Integrity checking
- `getFullSystemContext()` - Complete system state

**Environment Variables Supported:**
- Application: NODE_ENV, APP_URL, APP_PORT
- Database: DATABASE_URL
- Authentication: JWT_SECRET, JWT_EXPIRE_IN, ADMIN_JWT_SECRET
- AI Providers: OLLAMA_URL, OPENAI_API_KEY, GEMINI_API_KEY
- MCP: MCP_TRANSPORT, MCP_PORT, MCP_ENDPOINT
- Governance: ENABLE_GOVERNANCE, ENABLE_AUDIT_LOGGING

#### 5. **lib/auth/rbac.ts** - Role-Based Access Control

**Permissions (20 total):**

| Admin | Client |
|-------|--------|
| ✓ User management (create, read, update, delete) | ✓ Agent execution |
| ✓ Agent configuration & control | ✓ Tool execution |
| ✓ Tool registration & management | ✓ Basic reading |
| ✓ System configuration | (Limited access) |
| ✓ Governance management | |
| ✓ Audit log access | |

**Functions:**
- `hasPermission(role, permission)` - Check single permission
- `hasAllPermissions(role, permissions[])` - Check multiple
- `canAccessResource(role, type, action)` - Resource-level checks
- `PermissionChecks` - Convenience functions (canCreateUsers, etc.)

#### 6. **scripts/init-db.ts** - Database Initialization

**Automated Setup:**
```bash
npm run init:db
# or
npx ts-node scripts/init-db.ts
```

**What It Does:**
1. Runs Prisma migrations
2. Creates admin user (admin@zombiecoder.local / admin123)
3. Seeds 3 default agents
4. Registers 4 default tools
5. Creates 2 governance policies
6. Verifies database integrity

**Output:**
```
[ZombieCoder] System initialized: ZombieCoder v2.0.0
[ZombieCoder] Owner: Sahon Srabon
[ZombieCoder] Organization: Developer Zone
[ZombieCoder] Location: Dhaka, Bangladesh
[ZombieCoder] Admin user created: admin@zombiecoder.local
[ZombieCoder] 3 default agents created
[ZombieCoder] 4 default tools created
[ZombieCoder] 2 governance policies created
[ZombieCoder] Database initialization completed successfully!
```

---

## Getting Started

### Prerequisites
- **Node.js** 18+
- **npm** or **pnpm**
- **Ollama** (optional, for local LLM)

### Installation

1. **Clone and Setup:**
```bash
# Copy environment file
cp .env.example .env.local

# Edit .env.local with your configuration
# At minimum, ensure DATABASE_URL is set
```

2. **Install Dependencies:**
```bash
npm install
# or
pnpm install
```

3. **Initialize Database:**
```bash
npm run init:db
```

4. **Start Development Server:**
```bash
npm run dev
```

The system will:
- Load identity.json
- Initialize Prisma client
- Verify system integrity
- Start Next.js dev server on http://localhost:3000

---

## Configuration Guide

### Environment Variables

#### **Critical (Required in Production)**
```env
# Database
DATABASE_URL=file:./prisma/dev.db

# Authentication
JWT_SECRET=your-secret-key-min-32-chars
ADMIN_JWT_SECRET=your-admin-secret-min-32-chars
```

#### **AI Provider Configuration**

**Option 1: Ollama (Recommended for Local-First)**
```bash
# Start Ollama
ollama pull mistral
ollama serve

# In .env.local
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=mistral
```

**Option 2: OpenAI**
```env
OPENAI_API_KEY=sk-your-key
OPENAI_MODEL=gpt-4-turbo
```

**Option 3: Google Gemini**
```env
GEMINI_API_KEY=your-key
GEMINI_MODEL=gemini-pro
```

#### **MCP Configuration**
```env
MCP_TRANSPORT=stdio          # stdio, http, sse, websocket
MCP_PORT=3003
MCP_ENDPOINT=/mcp
```

### Platform-Specific Notes

**Windows Users:**
```powershell
# Use forward slashes in paths
DATABASE_URL=file:./prisma/dev.db

# PowerShell environment variables
$env:NODE_ENV="development"
```

**Linux/macOS Users:**
```bash
# Use standard paths
DATABASE_URL=file:./prisma/dev.db

# Shell environment variables
export NODE_ENV=development
```

---

## Architecture Principles

### 1. **Identity & Watermarking**
- Every response carries immutable owner identity
- HTTP headers prove legitimate origin
- JSON responses include governance metadata
- Prevents unauthorized modifications

### 2. **Ethics Framework**
Core constraints:
- ✅ No file destruction without user confirmation
- ✅ No unauthorized changes
- ✅ No deception (never exaggerate capabilities)
- ✅ Transparency in limitations

### 3. **Multi-Provider Strategy**
Fallback chain:
```
Request → Ollama (Primary)
       → OpenAI (Fallback)
       → Gemini (Fallback)
```

### 4. **Local-First Design**
- All processing on-device
- No cloud dependencies
- User data ownership guaranteed
- Privacy-first approach

---

## Database Schema Details

### User Model
```
id (UUID)
name, email (unique)
passwordHash
role (ADMIN | CLIENT)
isActive
createdAt, updatedAt, lastLoginAt
```

### Session Model
```
id, userId, agentId
startTime, endTime
status (ACTIVE | COMPLETED | TERMINATED)
contextJson, metadata
```

### Agent Model
```
id, agentId (unique)
name, description
enabled, version
personaJson, modelProvider, modelName
temperature, maxTokens
```

### Tool Model
```
id, toolId (unique)
name, description
riskLevel (LOW | MEDIUM | HIGH)
requiresConfirmation
enabled, schema
```

### AuditLog Model
```
id, userId, action, resource
riskScore, ethicsPassed
details, ipAddress, userAgent
timestamp
```

---

## API Response Format

All API responses include ZombieCoder metadata:

```json
{
  "success": true,
  "data": { ... },
  "zombiecoder": {
    "powered_by": "ZombieCoder Hub v2.0",
    "owner": "Sahon Srabon",
    "timestamp": "2026-04-01T10:00:00Z",
    "request_id": "uuid-here",
    "governance": {
      "ethics_validated": true,
      "risk_score": 0,
      "compliance_rate": 100
    }
  }
}
```

---

## Governance & Ethics

### Constraints Enforced
1. **No Destructive Operations** - File deletion blocked without confirmation
2. **No Unauthorized Changes** - All write operations logged
3. **No Deception** - Honest about capabilities/limitations
4. **Transparency Required** - All operations auditable

### Audit Trail
Every operation logged with:
- User ID
- Action type
- Resource affected
- Risk score
- Ethics validation result
- Timestamp & IP address

---

## Testing

### Quick Test
```bash
# Test identity loading
node -e "import('./src/lib/config/index.ts').then(m => console.log(m.loadSystemIdentity()))"

# Test database connection
npm run prisma:studio

# Run database checks
npm run init:db --verify
```

---

## Troubleshooting

### Database Issues
```bash
# Reset database
rm prisma/dev.db
npm run init:db

# View database
npm run prisma:studio

# Check schema
npm run prisma:validate
```

### Environment Issues
```bash
# Check loaded configuration
node -e "import('./src/lib/config/index.ts').then(m => m.initializeSystemConfig())"

# Verify identity.json
cat identity.json | jq .
```

### Permission Issues
```bash
# Print RBAC matrix
node -e "import('./src/lib/auth/rbac.ts').then(m => m.printPermissionMatrix())"
```

---

## Security Checklist

- [ ] Change JWT_SECRET in production
- [ ] Change ADMIN_JWT_SECRET in production
- [ ] Set DATABASE_URL to production database
- [ ] Mark identity.json as Read-Only
- [ ] Enable ENABLE_GOVERNANCE=true
- [ ] Enable ENABLE_AUDIT_LOGGING=true
- [ ] Use HTTPS in production
- [ ] Configure CORS appropriately
- [ ] Set NODE_ENV=production
- [ ] Review audit logs regularly

---

## Development Workflow

### Adding a New Feature
1. **Update Schema** - Modify `prisma/schema.prisma`
2. **Create Migration** - `npx prisma migrate dev --name feature-name`
3. **Implement API** - Create routes in `src/app/api/`
4. **Check Permissions** - Add RBAC checks in route handlers
5. **Test** - Run database tests
6. **Log** - Ensure AuditLog entries are created

### Adding a New Tool
1. **Register in Database** - Add Tool entry
2. **Implement Executor** - Create tool handler
3. **Set Risk Level** - Define LOW|MEDIUM|HIGH
4. **Configure Governance** - Add validation rules
5. **Document** - Add schema definition
6. **Test** - Run with ENABLE_GOVERNANCE=true

---

## Next Steps (Roadmap)

### Phase 2: Authentication & API Gateway
- JWT token generation and validation
- Session management
- Secure password handling (bcrypt)
- Token refresh mechanisms
- Admin authentication layer

### Phase 3: Agent Core System
- Agent execution engine
- Governance validator
- Memory management (vector embeddings)
- Tool execution framework
- Response formatting with metadata

### Phase 4: Admin Dashboard
- User management interface
- Agent monitoring
- Tool registry
- System logs viewer
- Governance policy editor

### Phase 5: MCP Transport Protocol
- HTTP/REST endpoint
- Server-Sent Events (SSE)
- WebSocket bidirectional
- Stdio IPC support
- Protocol routing

---

## Support & Contact

- **Owner:** Sahon Srabon
- **Organization:** Developer Zone
- **Location:** Dhaka, Bangladesh
- **Phone:** +880 1323-626282
- **Email:** info@zombiecoder.my.id
- **Website:** https://zombiecoder.my.id/

---

## License

**Proprietary - Local Freedom Protocol**

ZombieCoder is proprietary software owned by Sahon Srabon. All rights reserved.

---

**Last Updated:** April 1, 2026

**System Status:** Foundation Complete ✅ | Ready for Next Phase →

---

*"যেখানে কোড ও কথা বলে" - Where Code Speaks and Problems Are Shouldered*
