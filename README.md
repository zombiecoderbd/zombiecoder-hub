# ZombieCoder Hub v2.0

**An ethically-driven, locally-operating development assistant with complete transparency and governance.**

*"যেখানে কোড ও কথা বলে"* - Where Code Speaks and Problems Are Shouldered.

---

## Overview

ZombieCoder Hub v2.0 is a production-ready, self-hosted development platform built on:

- **Ethical Foundation** - Transparent operations, user data privacy, honest limitations
- **Local-First** - On-device processing with optional cloud fallbacks
- **Complete Governance** - Built-in compliance, audit trails, policy enforcement
- **Full-Stack** - Authentication, database, API gateway, agent system, admin dashboard

## Features

### ✅ Core Capabilities
- **Identity & Watermarking** - Every response proves ZombieCoder ownership
- **Role-Based Access Control** - 20 permissions across ADMIN and CLIENT roles
- **Secure Authentication** - JWT tokens, bcrypt hashing, session management
- **Audit Trail** - Complete logging of all operations
- **Multi-Database** - SQLite (dev), PostgreSQL, MySQL (production)

### ✅ Agent System (Foundation Ready)
- Agent lifecycle management
- Tool registry and execution
- Memory management
- Governance policy enforcement
- LLM integration with fallback chain

### ✅ API Gateway
- RESTful endpoints with security headers
- Request validation and rate limiting
- Error handling with detailed responses
- Health monitoring

### ✅ Multi-Platform
- Windows compatible (PowerShell)
- Linux compatible (Bash)
- macOS compatible (Bash)
- Docker ready
- Vercel deployable

---

## Quick Start

### Installation
```bash
# Clone or download repository
git clone https://github.com/yourusername/zombiecoder-hub-v2
cd zombiecoder-hub-v2

# Run setup
npm run setup

# Start development
npm run dev
```

Visit `http://localhost:3000`

### First Login
```
Email: admin@zombiecoder.local
Password: ZombieCoder@Admin123
```

⚠️ **Change this password immediately in production!**

---

## Documentation

Comprehensive documentation organized by topic:

### Getting Started
- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Installation, configuration, verification
- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Overview and statistics
- **[identity.json](./identity.json)** - System identity metadata

### Architecture & Implementation
- **[IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)** - Complete architecture documentation (590 lines)
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment guide (724 lines)

### API Reference
```
POST   /api/auth/register       - Create new user account
POST   /api/auth/login          - Login and get tokens
POST   /api/auth/refresh        - Refresh access token
GET    /api/health              - System health check
```

Full API documentation in `IMPLEMENTATION_GUIDE.md`

---

## Project Structure

```
zombiecoder-hub-v2/
├── app/api/                    # REST API endpoints
├── src/lib/
│   ├── auth/                   # Authentication (JWT, RBAC, password)
│   ├── db/                     # Database client
│   ├── api/                    # Response handlers, middleware
│   └── config/                 # Configuration management
├── prisma/
│   ├── schema.prisma           # Database schema (13 models)
│   └── migrations/             # Database migrations
├── scripts/
│   └── init-db.ts              # Database initialization & seeding
├── identity.json               # System identity
├── middleware.ts               # Global HTTP middleware
└── Documentation files         # Guides and specifications
```

---

## Technology Stack

### Backend
- **Next.js 16** - React framework with App Router
- **Prisma ORM** - Database access with migrations
- **TypeScript** - Type-safe code
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT token management

### Database
- **SQLite** - Development (included)
- **PostgreSQL** - Production recommended
- **MySQL** - Production alternative

### Authentication
- **JWT Tokens** - Stateless authentication
- **Session Management** - Persistent sessions
- **RBAC** - 20 granular permissions

### AI Integration
- **Ollama** - Local LLM (default)
- **OpenAI** - Cloud LLM (fallback)
- **Gemini** - Cloud LLM (fallback)

---

## Development Commands

```bash
# Setup & Installation
npm run setup                  # Install deps + generate + init DB
npm install                   # Install dependencies

# Development
npm run dev                   # Start dev server with HMR
npm run build                 # Build for production
npm start                     # Start production server
npm run lint                  # Run ESLint

# Database
npm run prisma:generate       # Generate Prisma client
npm run prisma:migrate        # Run migrations
npm run prisma:studio         # Open database UI
npm run prisma:validate       # Validate schema
npm run prisma:reset          # Reset database (DESTRUCTIVE)
npm run init:db               # Initialize with seed data
```

---

## Configuration

### Environment Variables

**Critical Variables (Required)**
```
DATABASE_URL              Database connection string
JWT_SECRET               Secret for JWT signing (min 32 chars)
NODE_ENV                 development | production | test
```

**Optional Variables (With Defaults)**
```
AI_PROVIDER             ollama | openai | gemini (default: ollama)
OLLAMA_BASE_URL         Ollama endpoint (default: http://localhost:11434)
OLLAMA_MODEL            Model name (default: mistral)
OPENAI_API_KEY          OpenAI API key
OPENAI_MODEL            Model name (default: gpt-4-turbo-preview)
GEMINI_API_KEY          Gemini API key
GEMINI_MODEL            Model name (default: gemini-pro)
CORS_ORIGIN             CORS origin (default: http://localhost:3000)
```

See `.env.example` for complete list.

---

## Authentication Flow

### Login/Register
```
1. User submits credentials
2. Password validated with bcrypt
3. JWT tokens generated (access + refresh)
4. Session stored in database
5. Tokens returned to client
6. Operation logged in audit trail
```

### Protected Endpoints
```
1. Client sends Authorization: Bearer <token>
2. Server verifies JWT signature
3. User permissions checked
4. Resource access controlled
5. Response includes identity headers
6. Operation audited
```

---

## Database Schema

13 core models with 50+ fields:

**User Management**
- Users
- Sessions
- AuditLog

**Agent System**
- Agents
- AgentConfig
- AgentMemory

**Tools & Execution**
- Tools
- ToolPermission
- ToolExecution

**Governance**
- GovernancePolicy
- GovernanceHistory

**Projects & Tasks**
- Projects
- Tasks

**Messages**
- Messages

See `prisma/schema.prisma` for complete schema with relationships and indexes.

---

## Ethical Framework

Built on core principles:

**Transparency**
- Every operation logged and auditable
- Complete response with request ID
- Error messages don't hide system details

**User Safety**
- No destructive operations without confirmation
- Data ownership guaranteed
- Passwords hashed with high entropy

**Privacy**
- Local-first architecture
- No cloud dependency for core operations
- User data isolated by default

**Honesty**
- Never exaggerate capabilities
- Acknowledge limitations explicitly
- Suggest better solutions when available

---

## Deployment

### Development (Local)
```bash
npm run dev
# Server: http://localhost:3000
# Database: SQLite (prisma/dev.db)
```

### Production (Self-Hosted)
```bash
npm run build
npm start
# Configure PostgreSQL in .env.local
# See DEPLOYMENT.md for detailed guide
```

### Cloud Platforms
- **Vercel** - Recommended for Next.js
- **Docker** - Self-hosted container
- **Ubuntu/CentOS** - Direct installation
- **Windows Server** - Windows compatible

See `DEPLOYMENT.md` for platform-specific guides.

---

## API Examples

### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass@123456",
    "confirmPassword": "SecurePass@123456",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass@123456"
  }'
```

### Protected Request
```bash
curl -X GET http://localhost:3000/api/user/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Health Check
```bash
curl http://localhost:3000/api/health
# Response includes: status, services, uptime
```

---

## Troubleshooting

### Database Issues
```bash
# Reset everything
npm run prisma:reset

# View database state
npm run prisma:studio

# Check connections
npm run init:db
```

### Authentication Issues
- Verify JWT_SECRET is set: `echo $JWT_SECRET`
- Check token in browser DevTools
- Review audit logs in database

### Port Conflicts
```bash
# Use different port
PORT=3001 npm run dev
```

### AI Provider Issues
- Verify provider configuration in `.env.local`
- Check Ollama is running: `curl http://localhost:11434/api/tags`
- Check API keys are valid

---

## Contributing

This is a reference implementation. For modifications:

1. Follow TypeScript strict mode
2. Add database migrations for schema changes
3. Update documentation
4. Test all API endpoints
5. Run `npm run lint`

---

## License

ZombieCoder Hub v2.0 is provided as a reference implementation for ethical AI development practices.

---

## Support & Documentation

**Primary Documentation**
- `SETUP_GUIDE.md` - Getting started
- `IMPLEMENTATION_GUIDE.md` - Architecture details
- `DEPLOYMENT.md` - Production setup

**Configuration**
- `.env.example` - Environment template
- `prisma/schema.prisma` - Database structure

**Metadata**
- `identity.json` - System identity
- `PROJECT_SUMMARY.md` - Statistics

---

## About ZombieCoder

**Identity:** Sahon Srabon (Developer Zone)
**Mission:** Develop ethical, transparent AI-powered development tools
**Philosophy:** Code speaks, solutions serve

*"যেখানে কোড ও কথা বলে"* - Where Code Speaks and Problems Are Shouldered.

**By the grace of Allah, this system is built on honesty, transparency, and user empowerment.**

---

## Quick Links

- [Setup Guide](./SETUP_GUIDE.md) - Installation steps
- [Implementation Guide](./IMPLEMENTATION_GUIDE.md) - Architecture
- [Deployment Guide](./DEPLOYMENT.md) - Production setup
- [Project Summary](./PROJECT_SUMMARY.md) - Overview
- [GitHub Issues](https://github.com/yourrepo/issues) - Report problems
- [Discussion Forum](https://github.com/yourrepo/discussions) - Ask questions

---

**Latest Release:** v2.0.0 (April 2026)
**Status:** Production Ready
**License:** Ethical AI Development

