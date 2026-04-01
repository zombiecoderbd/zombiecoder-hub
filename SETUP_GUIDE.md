# ZombieCoder Hub v2.0 - Setup Guide

## Quick Start

### Prerequisites
- Node.js 18+ (LTS recommended)
- npm 9+ or pnpm 8+
- SQLite 3 (included with Node.js) or PostgreSQL/MySQL for production

### Installation Steps

#### 1. Install Dependencies
```bash
npm install
# or with pnpm
pnpm install
```

#### 2. Configure Environment
```bash
# Copy example environment file
cp .env.example .env.local

# Edit with your settings
nano .env.local  # or use your preferred editor
```

**Required environment variables:**
- `DATABASE_URL` - Database connection string
- `JWT_SECRET` - Secret key for JWT signing (minimum 32 characters)
- `AI_PROVIDER` - "ollama" | "openai" | "gemini" (default: ollama)
- `NODE_ENV` - "development" | "production" | "test"

#### 3. Setup Database
```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Initialize with seed data
npm run init:db
```

#### 4. Start Development Server
```bash
npm run dev
```

Server will be available at `http://localhost:3000`

---

## Database Setup

### SQLite (Development)
Best for local development and small deployments.

```bash
# .env.local
DATABASE_URL="file:./prisma/dev.db"
```

```bash
npm run init:db
```

Database file will be created at `prisma/dev.db`

### PostgreSQL (Production)
Recommended for production deployments.

```bash
# .env.local
DATABASE_URL="postgresql://user:password@localhost:5432/zombiecoder"
```

```bash
npm run prisma:migrate
npm run init:db
```

### MySQL (Alternative)
Also supported for production.

```bash
# .env.local
DATABASE_URL="mysql://user:password@localhost:3306/zombiecoder"
```

```bash
npm run prisma:migrate
npm run init:db
```

---

## Authentication Setup

### Default Admin Account
After running `npm run init:db`, a default admin account is created:

- **Email:** `admin@zombiecoder.local`
- **Password:** `ZombieCoder@Admin123`
- **Role:** ADMIN

**⚠️ IMPORTANT:** Change this password immediately in production!

```bash
# Login and change password via API
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@zombiecoder.local",
    "password": "ZombieCoder@Admin123"
  }'
```

### JWT Secret Configuration
The JWT secret is used to sign authentication tokens.

```bash
# Generate a secure JWT secret (Linux/macOS)
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Add to `.env.local`:
```
JWT_SECRET="your-generated-secret-here"
```

---

## AI Provider Configuration

### Ollama (Local - Recommended)
```bash
# .env.local
AI_PROVIDER="ollama"
OLLAMA_BASE_URL="http://localhost:11434"
OLLAMA_MODEL="mistral"  # or your preferred model

# Install and start Ollama
# https://ollama.ai
ollama serve

# In another terminal, pull a model
ollama pull mistral
```

### OpenAI (Cloud)
```bash
# .env.local
AI_PROVIDER="openai"
OPENAI_API_KEY="sk-..."
OPENAI_MODEL="gpt-4-turbo-preview"
```

### Google Gemini (Cloud)
```bash
# .env.local
AI_PROVIDER="gemini"
GEMINI_API_KEY="..."
GEMINI_MODEL="gemini-pro"
```

---

## Verification

### Check System Health
```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "services": {
      "database": "up",
      "api": "up"
    }
  }
}
```

### View Database
```bash
npm run prisma:studio
```

Opens Prisma Studio at `http://localhost:5555`

### Check Identity
```bash
curl http://localhost:3000/api/health
# Look for X-Powered-By: ZombieCoder header in response
```

---

## Development Commands

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Database commands
npm run prisma:generate    # Generate Prisma client
npm run prisma:migrate     # Run migrations
npm run prisma:studio      # Open database UI
npm run prisma:validate    # Validate schema
npm run prisma:reset       # Reset database (DESTRUCTIVE)

# Setup everything at once
npm run setup
```

---

## Project Structure

```
zombiecoder-hub/
├── app/                          # Next.js app directory
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   │   ├── register/
│   │   │   ├── login/
│   │   │   └── refresh/
│   │   ├── health/               # Health check endpoint
│   │   └── ...
│   └── ...
├── src/
│   ├── lib/
│   │   ├── auth/                 # Authentication utilities
│   │   │   ├── service.ts        # JWT, password hashing
│   │   │   └── rbac.ts           # Role-based access control
│   │   ├── db/                   # Database utilities
│   │   │   └── client.ts         # Prisma client singleton
│   │   ├── api/                  # API utilities
│   │   │   ├── response.ts       # Response formatters
│   │   │   └── middleware.ts     # Request middleware
│   │   ├── config/               # Configuration
│   │   │   └── index.ts          # Environment & settings
│   │   └── ...
│   └── ...
├── prisma/
│   ├── schema.prisma             # Database schema
│   ├── dev.db                    # SQLite database (dev)
│   └── migrations/               # Database migrations
├── scripts/
│   └── init-db.ts                # Database initialization
├── identity.json                 # System identity & metadata
├── middleware.ts                 # Global middleware
├── .env.example                  # Environment template
├── package.json
├── tsconfig.json
└── README.md
```

---

## Troubleshooting

### Database Connection Error
```
Error: ENOENT: no such file or directory, open 'prisma/dev.db'
```

Solution:
```bash
npm run prisma:migrate
npm run init:db
```

### JWT Secret Not Set
```
Error: JWT_SECRET environment variable is required
```

Solution:
```bash
# Generate and add to .env.local
JWT_SECRET="your-secret-here"
```

### Prisma Client Error
```
Error: Prisma client is not available
```

Solution:
```bash
npm run prisma:generate
npm install
```

### Port Already in Use
```bash
# Change port
PORT=3001 npm run dev

# Or kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

---

## Next Steps

1. **Read Documentation**
   - `IMPLEMENTATION_GUIDE.md` - Architecture and design
   - `DEPLOYMENT.md` - Production deployment
   - `PROJECT_SUMMARY.md` - Feature overview

2. **Test API Endpoints**
   - Register a new user
   - Login and get tokens
   - Test authenticated endpoints

3. **Configure Agents**
   - Edit agent configurations in database
   - Set up tools and permissions

4. **Deploy to Production**
   - Follow `DEPLOYMENT.md` guide
   - Set up PostgreSQL database
   - Configure environment for production

---

## Support

For issues or questions:
1. Check documentation files
2. Review error logs in console
3. Check database state with `npm run prisma:studio`
4. Review API responses for error details

---

**By the grace of Allah, ZombieCoder is ready to serve.**

*"جেখানে কোড ও কথা বলে"* - Where Code Speaks and Problems Are Shouldered.
