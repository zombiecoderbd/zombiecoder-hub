# ZombieCoder Hub v2.0 - Deployment Guide

**Production Deployment Instructions for Windows, Linux, and Cloud Platforms**

---

## Quick Start (All Platforms)

```bash
# 1. Clone repository
git clone <repo-url>
cd zombiecoder-hub

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env.local
# Edit .env.local with your configuration

# 4. Initialize database
npm run init:db

# 5. Start development server
npm run dev
```

---

## Platform-Specific Setup

### Windows Setup

#### Prerequisites
- Node.js 18+ (Download from nodejs.org)
- Git Bash or Windows Terminal
- Visual Studio Build Tools (optional, for native modules)

#### Installation Steps

```powershell
# PowerShell (Run as Administrator)

# 1. Clone the repo
git clone <repo-url>
cd zombiecoder-hub

# 2. Install dependencies
npm install

# 3. Create environment file
Copy-Item .env.example .env.local

# 4. Edit .env.local
notepad .env.local
# Or use your favorite editor

# 5. Initialize database
npm run init:db

# 6. Start dev server
npm run dev
```

#### Windows-Specific Configuration

```env
# .env.local - Windows Configuration

# Database (Use forward slashes)
DATABASE_URL=file:./prisma/dev.db

# Application
NODE_ENV=development
APP_URL=http://localhost:3000
APP_PORT=3000

# For production with PostgreSQL/MySQL:
# DATABASE_URL=postgresql://user:password@localhost:5432/zombiecoder
# DATABASE_URL=mysql://user:password@localhost:3306/zombiecoder
```

#### Troubleshooting on Windows

**Issue:** `npm install` fails with permission error
```powershell
# Solution: Run as Administrator
# or use
npm install --no-save --no-audit
```

**Issue:** Prisma migration fails
```powershell
# Clear Prisma cache
Remove-Item -Path node_modules\.prisma -Recurse -Force
npm install
npm run init:db
```

**Issue:** Port 3000 already in use
```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or use different port
$env:APP_PORT=3001
npm run dev
```

---

### Linux/macOS Setup

#### Prerequisites
- Node.js 18+ (`apt-get install nodejs` or `brew install node`)
- npm or pnpm
- SQLite3 development files (for SQLite)

#### Ubuntu/Debian Installation

```bash
# 1. Install Node.js (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Clone and setup
git clone <repo-url>
cd zombiecoder-hub

# 3. Install dependencies
npm install

# 4. Create environment file
cp .env.example .env.local
nano .env.local  # or use your favorite editor

# 5. Initialize database
npm run init:db

# 6. Start development server
npm run dev
```

#### macOS Installation

```bash
# 1. Install Node.js (if using Homebrew)
brew install node

# 2. Clone and setup
git clone <repo-url>
cd zombiecoder-hub

# 3. Install dependencies
npm install

# 4. Create environment file
cp .env.example .env.local
vim .env.local

# 5. Initialize database
npm run init:db

# 6. Start development server
npm run dev
```

#### Linux-Specific Configuration

```env
# .env.local - Linux Configuration

# Database
DATABASE_URL=file:./prisma/dev.db

# Make sure the directory is writable
# chmod 755 prisma/

# Or use PostgreSQL for production:
DATABASE_URL=postgresql://zombiecoder:password@localhost:5432/zombiecoder
```

#### File Permissions (Linux)

```bash
# Make scripts executable
chmod +x scripts/*.sh
chmod +x scripts/init-db.ts

# Ensure database directory is writable
chmod 755 prisma/

# For Ollama IPC socket (if using Ollama)
chmod 666 /tmp/ollama.sock
```

---

## Database Configuration

### Development (SQLite)

**Best for:** Local development, testing, single-user applications

```env
DATABASE_URL=file:./prisma/dev.db
```

```bash
# Initialize
npm run init:db

# Reset (warning: deletes all data)
npm run prisma:reset

# View data with GUI
npm run prisma:studio
```

### Production (PostgreSQL)

**Best for:** Multi-user, high-traffic applications

#### Setup PostgreSQL

**Ubuntu/Debian:**
```bash
sudo apt-get install postgresql postgresql-contrib

# Start service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql

# In PostgreSQL console:
CREATE DATABASE zombiecoder;
CREATE USER zombiecoder WITH PASSWORD 'your-secure-password';
ALTER ROLE zombiecoder SET client_encoding TO 'utf8';
ALTER ROLE zombiecoder SET default_transaction_isolation TO 'read committed';
GRANT ALL PRIVILEGES ON DATABASE zombiecoder TO zombiecoder;
\q
```

**macOS (Homebrew):**
```bash
brew install postgresql

# Start PostgreSQL
brew services start postgresql

# Create database
createdb -U postgres zombiecoder
```

#### Configure ZombieCoder

```env
DATABASE_URL=postgresql://zombiecoder:password@localhost:5432/zombiecoder
```

```bash
npm run prisma:migrate
npm run prisma:generate
npm run init:db
```

### Production (MySQL)

**Best for:** Web hosting providers, cPanel shared hosting

#### Setup MySQL

**Ubuntu/Debian:**
```bash
sudo apt-get install mysql-server

sudo mysql

# In MySQL console:
CREATE DATABASE zombiecoder;
CREATE USER 'zombiecoder'@'localhost' IDENTIFIED BY 'your-secure-password';
GRANT ALL PRIVILEGES ON zombiecoder.* TO 'zombiecoder'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### Configure ZombieCoder

```env
DATABASE_URL=mysql://zombiecoder:password@localhost:3306/zombiecoder
```

---

## Deployment to Vercel

### Prerequisites
- Vercel account
- GitHub repository connected

### Steps

1. **Push to GitHub:**
```bash
git add .
git commit -m "Initial commit: ZombieCoder Hub v2.0"
git push origin main
```

2. **Create Vercel Project:**
- Go to https://vercel.com/new
- Import your GitHub repository
- Project name: `zombiecoder-hub`
- Framework: Next.js

3. **Environment Variables:**
In Vercel Dashboard:
- Settings → Environment Variables
- Add all variables from `.env.example`:
  ```
  DATABASE_URL=postgresql://... (use a managed PostgreSQL)
  JWT_SECRET=your-secret
  ADMIN_JWT_SECRET=your-admin-secret
  OLLAMA_URL=http://your-ollama-server:11434
  ```

4. **Database:**
- Use Vercel's PostgreSQL: https://vercel.com/storage
- Or use managed PostgreSQL (AWS RDS, Heroku Postgres, etc.)

5. **Deploy:**
```bash
npm install -g vercel
vercel
```

---

## Deployment to Self-Hosted Server

### Prerequisites
- Ubuntu 20.04 LTS (or CentOS/Alpine)
- Root or sudo access
- Domain name (for production)

### Step 1: Server Setup

```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Nginx (reverse proxy)
sudo apt-get install -y nginx

# Install PostgreSQL
sudo apt-get install -y postgresql postgresql-contrib
```

### Step 2: Database Setup

```bash
sudo -u postgres psql

# In PostgreSQL:
CREATE DATABASE zombiecoder;
CREATE USER zombiecoder WITH PASSWORD 'secure-password';
GRANT ALL PRIVILEGES ON DATABASE zombiecoder TO zombiecoder;
\q
```

### Step 3: Application Setup

```bash
# Create app directory
sudo mkdir -p /var/www/zombiecoder
cd /var/www/zombiecoder

# Clone repository
sudo git clone <repo-url> .
sudo chown -R $USER:$USER /var/www/zombiecoder

# Install dependencies
npm install
npm run build

# Create .env file
cp .env.example .env.local
nano .env.local  # Set DATABASE_URL, secrets, etc.
```

### Step 4: Start with PM2

```bash
# Initialize database
npm run init:db

# Start with PM2
pm2 start npm --name "zombiecoder" -- start

# Save PM2 process list
pm2 save

# Enable auto-restart on boot
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/local/lib/node_modules/pm2/bin/pm2 startup systemd -u $(whoami) --hp /home/$(whoami)

# Check status
pm2 status
pm2 logs zombiecoder
```

### Step 5: Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/zombiecoder
```

Add:
```nginx
upstream zombiecoder_app {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://zombiecoder_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/zombiecoder /etc/nginx/sites-enabled/

# Test Nginx config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Step 6: SSL/TLS Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

---

## Docker Deployment

### Dockerfile

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build Next.js
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://zombiecoder:password@db:5432/zombiecoder
      - JWT_SECRET=${JWT_SECRET}
      - ADMIN_JWT_SECRET=${ADMIN_JWT_SECRET}
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:15
    environment:
      - POSTGRES_USER=zombiecoder
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=zombiecoder
    volumes:
      - db_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  db_data:
```

### Build and Run

```bash
# Build
docker-compose build

# Run
docker-compose up -d

# Initialize database
docker-compose exec app npm run init:db

# View logs
docker-compose logs -f app
```

---

## Security Checklist

- [ ] Change all JWT_SECRET values
- [ ] Change all admin passwords
- [ ] Enable HTTPS/SSL certificate
- [ ] Set NODE_ENV=production
- [ ] Set ENABLE_GOVERNANCE=true
- [ ] Set ENABLE_AUDIT_LOGGING=true
- [ ] Configure firewall rules
- [ ] Enable database backups
- [ ] Set up monitoring & alerting
- [ ] Review security headers
- [ ] Enable rate limiting
- [ ] Set up log rotation
- [ ] Configure CORS properly
- [ ] Use strong database passwords
- [ ] Keep dependencies updated

---

## Monitoring & Logs

### PM2 Monitoring

```bash
# Real-time monitoring
pm2 monit

# View logs
pm2 logs zombiecoder

# Save logs
pm2 logs zombiecoder > logs/zombiecoder.log

# View specific lines
pm2 logs zombiecoder --lines 100
```

### Nginx Logs

```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

### Application Health Check

```bash
# Check if running
curl http://localhost:3000

# Check API health
curl http://localhost:3000/api/health  # [To be implemented]

# Check database
npm run prisma:studio
```

---

## Maintenance

### Database Backups (PostgreSQL)

```bash
# Manual backup
pg_dump -U zombiecoder -d zombiecoder > backup_$(date +%Y%m%d).sql

# Automated backup (daily at 2 AM)
sudo crontab -e

# Add this line:
0 2 * * * pg_dump -U zombiecoder -d zombiecoder > /var/backups/zombiecoder_$(date +\%Y\%m\%d).sql
```

### Update Dependencies

```bash
# Check for updates
npm outdated

# Update all
npm update

# Update specific
npm update @prisma/client

# Full major version update (use caution)
npm upgrade
```

### Clear Database

```bash
# Reset (deletes all data!)
npm run prisma:reset

# Migrate specific version
npx prisma migrate resolve --rolled-back <migration-name>
```

---

## Troubleshooting

### Port Already in Use

```bash
# Linux/macOS
lsof -i :3000
kill -9 <PID>

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Database Connection Errors

```bash
# Check PostgreSQL service
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql

# Test connection
psql -U zombiecoder -d zombiecoder -h localhost
```

### High Memory Usage

```bash
# Check Node processes
ps aux | grep node

# Restart application
pm2 restart zombiecoder

# Check for memory leaks
pm2 status
```

---

## Support

For issues or questions:
- **Email:** info@zombiecoder.my.id
- **Website:** https://zombiecoder.my.id/
- **Phone:** +880 1323-626282

---

**Last Updated:** April 1, 2026

*"যেখানে কোড ও কথা বলে" - Where Code Speaks and Problems Are Shouldered*
