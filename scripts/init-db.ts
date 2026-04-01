#!/usr/bin/env node

/**
 * ZombieCoder Hub v2.0 - Database Initialization Script
 * 
 * This script:
 * 1. Creates/initializes the SQLite database
 * 2. Runs Prisma migrations
 * 3. Seeds initial data (Admin user, default agents, tools)
 * 4. Verifies database integrity
 * 
 * Compatible: Windows, Linux, macOS
 * 
 * Usage:
 *   npm run init:db
 *   npx tsx scripts/init-db.ts
 */

import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const execAsync = promisify(exec)
const prisma = new PrismaClient()

// ============================================================================
// LOGGER UTILITY
// ============================================================================

const log = {
  info: (msg: string) => console.log(`[ZombieCoder] INFO: ${msg}`),
  success: (msg: string) => console.log(`[ZombieCoder] SUCCESS: ${msg}`),
  warn: (msg: string) => console.warn(`[ZombieCoder] WARN: ${msg}`),
  error: (msg: string) => console.error(`[ZombieCoder] ERROR: ${msg}`),
}

// ============================================================================
// DATABASE INITIALIZATION
// ============================================================================

async function initializeDatabase() {
  log.info('Starting database initialization...')

  try {
    // Step 1: Run Prisma migrations
    log.info('Running Prisma migrations...')
    try {
      await execAsync('npx prisma migrate deploy', {
        cwd: process.cwd(),
      })
      log.success('Prisma migrations completed')
    } catch (error: any) {
      // First run - create migration
      log.info('First run detected. Creating initial migration...')
      try {
        await execAsync('npx prisma migrate dev --name init', {
          cwd: process.cwd(),
        })
        log.success('Initial migration created')
      } catch (innerError) {
        log.warn('Migration setup skipped - database may already exist')
      }
    }

    // Step 2: Create Admin User
    log.info('Setting up admin user...')
    await createAdminUser()

    // Step 3: Create Default Agents
    log.info('Setting up default agents...')
    await createDefaultAgents()

    // Step 4: Create Default Tools
    log.info('Setting up default tools...')
    await createDefaultTools()

    // Step 5: Create Governance Policies
    log.info('Setting up governance policies...')
    await createGovernancePolicies()

    // Step 6: Verify Database
    log.info('Verifying database integrity...')
    await verifyDatabase()

    log.success('Database initialization completed successfully!')
    log.info('System is ready to use.')
  } catch (error) {
    log.error(`Database initialization failed: ${error}`)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// ============================================================================
// SEED DATA FUNCTIONS
// ============================================================================

async function createAdminUser() {
  try {
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    })

    if (existingAdmin) {
      log.warn('Admin user already exists')
      return
    }

    // Hash password with bcrypt
    const salt = await bcrypt.genSalt(12)
    const hashedPassword = await bcrypt.hash('admin123', salt)

    const adminUser = await prisma.user.create({
      data: {
        name: 'System Administrator',
        email: 'admin@zombiecoder.local',
        passwordHash: hashedPassword,
        role: 'ADMIN',
        isActive: true,
      },
    })

    log.success(`Admin user created: ${adminUser.email}`)
    log.info('  Password: admin123 (CHANGE IN PRODUCTION!)')
  } catch (error: any) {
    log.warn(`Admin user creation skipped: ${error.message}`)
  }
}

async function createDefaultAgents() {
  try {
    const existingAgent = await prisma.agent.findFirst({
      where: { agentId: 'editor-agent-001' },
    })

    if (existingAgent) {
      log.warn('Default agents already exist')
      return
    }

    const agents = [
      {
        agentId: 'editor-agent-001',
        name: 'ZombieCoder Editor Agent',
        description: 'Primary development assistant for code editing and generation',
        modelProvider: 'ollama',
        modelName: 'mistral',
        personaJson: JSON.stringify({
          name: 'ZombieCoder Dev Agent',
          tagline: 'যেখানে কোড ও কথা বলে',
          traits: ['helpful', 'honest', 'serious', 'human-centric'],
          language: 'bengali',
        }),
      },
      {
        agentId: 'docs-agent-001',
        name: 'ZombieCoder Documentation Agent',
        description: 'Documentation generation and knowledge management',
        modelProvider: 'ollama',
        modelName: 'mistral',
        personaJson: JSON.stringify({
          name: 'Documentation Agent',
          traits: ['detailed', 'organized', 'technical'],
        }),
      },
      {
        agentId: 'governance-agent-001',
        name: 'ZombieCoder Governance Agent',
        description: 'Ethics validation and risk assessment',
        modelProvider: 'ollama',
        modelName: 'mistral',
        personaJson: JSON.stringify({
          name: 'Governance Agent',
          traits: ['strict', 'safety-focused', 'compliant'],
        }),
      },
    ]

    for (const agent of agents) {
      await prisma.agent.create({ data: agent })
    }

    log.success(`${agents.length} default agents created`)
  } catch (error: any) {
    log.warn(`Agent creation skipped: ${error.message}`)
  }
}

async function createDefaultTools() {
  try {
    const existingTool = await prisma.tool.findFirst({
      where: { toolId: 'read-file' },
    })

    if (existingTool) {
      log.warn('Default tools already exist')
      return
    }

    const tools = [
      {
        toolId: 'read-file',
        name: 'Read File',
        description: 'Read file contents from the file system',
        riskLevel: 'LOW' as const,
        schema: JSON.stringify({
          type: 'object',
          properties: {
            path: { type: 'string', description: 'File path to read' },
          },
          required: ['path'],
        }),
      },
      {
        toolId: 'write-file',
        name: 'Write File',
        description: 'Write content to a file',
        riskLevel: 'HIGH' as const,
        requiresConfirmation: true,
        schema: JSON.stringify({
          type: 'object',
          properties: {
            path: { type: 'string' },
            content: { type: 'string' },
          },
          required: ['path', 'content'],
        }),
      },
      {
        toolId: 'execute-command',
        name: 'Execute Command',
        description: 'Execute terminal commands',
        riskLevel: 'HIGH' as const,
        requiresConfirmation: true,
        schema: JSON.stringify({
          type: 'object',
          properties: {
            command: { type: 'string' },
            cwd: { type: 'string' },
          },
          required: ['command'],
        }),
      },
      {
        toolId: 'search-files',
        name: 'Search Files',
        description: 'Search for files using glob patterns',
        riskLevel: 'LOW' as const,
        schema: JSON.stringify({
          type: 'object',
          properties: {
            pattern: { type: 'string' },
            cwd: { type: 'string' },
          },
          required: ['pattern'],
        }),
      },
    ]

    for (const tool of tools) {
      await prisma.tool.create({ data: tool })
    }

    log.success(`${tools.length} default tools created`)
  } catch (error: any) {
    log.warn(`Tool creation skipped: ${error.message}`)
  }
}

async function createGovernancePolicies() {
  try {
    const existingPolicy = await prisma.governancePolicy.findFirst({
      where: { name: 'default-safety-policy' },
    })

    if (existingPolicy) {
      log.warn('Governance policies already exist')
      return
    }

    const policies = [
      {
        name: 'default-safety-policy',
        description: 'Default safety and ethics policy',
        ruleJson: JSON.stringify({
          forbidden_actions: [
            'rm -rf /',
            'DROP TABLE',
            'DELETE FROM users',
          ],
          max_risk_score: 75,
          requires_confirmation: true,
        }),
      },
      {
        name: 'file-protection-policy',
        description: 'Protection against destructive file operations',
        ruleJson: JSON.stringify({
          protected_paths: ['.git', 'node_modules', '.env'],
          warn_on_delete: true,
        }),
      },
    ]

    for (const policy of policies) {
      await prisma.governancePolicy.create({ data: policy })
    }

    log.success(`${policies.length} governance policies created`)
  } catch (error: any) {
    log.warn(`Governance policy creation skipped: ${error.message}`)
  }
}

async function verifyDatabase() {
  try {
    const users = await prisma.user.count()
    const agents = await prisma.agent.count()
    const tools = await prisma.tool.count()

    log.success(`Database verification passed:`)
    log.info(`  - Users: ${users}`)
    log.info(`  - Agents: ${agents}`)
    log.info(`  - Tools: ${tools}`)
  } catch (error: any) {
    log.error(`Database verification failed: ${error.message}`)
    throw error
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log('')
  console.log('╔════════════════════════════════════════════════════════════╗')
  console.log('║   ZombieCoder Hub v2.0 - Database Initialization Script   ║')
  console.log('║                 "যেখানে কোড ও কথা বলে"                    ║')
  console.log('╚════════════════════════════════════════════════════════════╝')
  console.log('')

  await initializeDatabase()
}

// Execute
main().catch((error) => {
  log.error(`Fatal error: ${error.message}`)
  process.exit(1)
})
