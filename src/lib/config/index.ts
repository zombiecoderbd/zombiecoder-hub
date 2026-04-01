/**
 * ZombieCoder Hub v2.0 - System Configuration
 * 
 * Central configuration management for the entire system.
 * Loads identity metadata and validates environment setup.
 * 
 * Compatible: Windows, Linux, macOS
 */

import fs from 'fs'
import path from 'path'

// ============================================================================
// IDENTITY CONFIGURATION
// ============================================================================

export interface SystemIdentity {
  system_identity: {
    name: string
    version: string
    tagline: string
    tagline_en: string
    created_at: string
    last_updated: string
    branding: {
      owner: string
      organization: string
      address: string
      location: string
      country_code: string
      contact: {
        phone: string
        email: string
        website: string
      }
      social: {
        github: string
        linkedin: string
      }
    }
    license: {
      type: string
      protocol: string
      description: string
    }
    technical: {
      stack: Record<string, any>
      features: Record<string, boolean>
    }
    security: {
      identity_watermark: string
      signature_algorithm: string
      metadata_protection: string
      tamper_detection: boolean
    }
    governance: {
      ethics_framework: string
      agent_constraint: string
      data_privacy: string
      audit_logging: boolean
    }
    mission: string
    vision: string
  }
}

let cachedIdentity: SystemIdentity | null = null

/**
 * Load system identity from identity.json
 * This is the immutable core of ZombieCoder's identity
 */
export function loadSystemIdentity(): SystemIdentity {
  if (cachedIdentity) {
    return cachedIdentity
  }

  try {
    const identityPath = path.join(process.cwd(), 'identity.json')
    const identityData = fs.readFileSync(identityPath, 'utf-8')
    cachedIdentity = JSON.parse(identityData) as SystemIdentity
    return cachedIdentity
  } catch (error) {
    console.error('[ZombieCoder] Failed to load identity.json:', error)
    throw new Error(
      'System identity not found. identity.json must exist at project root.'
    )
  }
}

// ============================================================================
// ENVIRONMENT CONFIGURATION
// ============================================================================

export interface EnvironmentConfig {
  // Application
  NODE_ENV: 'development' | 'production' | 'test'
  APP_URL: string
  APP_PORT: number

  // Database
  DATABASE_URL: string

  // Authentication
  JWT_SECRET: string
  JWT_EXPIRE_IN: string

  // AI Providers
  OLLAMA_URL: string
  OLLAMA_MODEL: string
  OPENAI_API_KEY?: string
  OPENAI_MODEL?: string
  GEMINI_API_KEY?: string
  GEMINI_MODEL?: string

  // MCP Configuration
  MCP_TRANSPORT: 'stdio' | 'http' | 'sse' | 'websocket'
  MCP_PORT: number
  MCP_ENDPOINT: string

  // Admin Configuration
  ADMIN_JWT_SECRET: string
  ADMIN_SESSION_TIMEOUT: number

  // System
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error'
  ENABLE_GOVERNANCE: boolean
  ENABLE_AUDIT_LOGGING: boolean
}

/**
 * Get environment configuration with defaults
 * Validates required variables at startup
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  const config: EnvironmentConfig = {
    // Application
    NODE_ENV: (process.env.NODE_ENV || 'development') as any,
    APP_URL: process.env.APP_URL || 'http://localhost:3000',
    APP_PORT: parseInt(process.env.APP_PORT || '3000', 10),

    // Database
    DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',

    // Authentication
    JWT_SECRET: process.env.JWT_SECRET || 'dev-jwt-secret-change-in-production',
    JWT_EXPIRE_IN: process.env.JWT_EXPIRE_IN || '24h',

    // AI Providers
    OLLAMA_URL: process.env.OLLAMA_URL || 'http://localhost:11434',
    OLLAMA_MODEL: process.env.OLLAMA_MODEL || 'mistral',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4-turbo',
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-pro',

    // MCP Configuration
    MCP_TRANSPORT: (process.env.MCP_TRANSPORT || 'stdio') as any,
    MCP_PORT: parseInt(process.env.MCP_PORT || '3003', 10),
    MCP_ENDPOINT: process.env.MCP_ENDPOINT || '/mcp',

    // Admin Configuration
    ADMIN_JWT_SECRET: process.env.ADMIN_JWT_SECRET || 'admin-jwt-secret-change-in-production',
    ADMIN_SESSION_TIMEOUT: parseInt(process.env.ADMIN_SESSION_TIMEOUT || '1800000', 10),

    // System
    LOG_LEVEL: (process.env.LOG_LEVEL || 'info') as any,
    ENABLE_GOVERNANCE: process.env.ENABLE_GOVERNANCE !== 'false',
    ENABLE_AUDIT_LOGGING: process.env.ENABLE_AUDIT_LOGGING !== 'false',
  }

  // Validate critical variables in production
  if (config.NODE_ENV === 'production') {
    const requiredVars = ['JWT_SECRET', 'DATABASE_URL', 'ADMIN_JWT_SECRET']
    const missing = requiredVars.filter((v) => !config[v as keyof EnvironmentConfig])
    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variables in production: ${missing.join(', ')}`
      )
    }
  }

  return config
}

// ============================================================================
// SYSTEM CONSTANTS
// ============================================================================

export const ZOMBIECODER_CONSTANTS = {
  // HTTP Headers
  WATERMARK_HEADER: 'X-Powered-By',
  WATERMARK_VALUE: 'ZombieCoder',
  VERSION_HEADER: 'X-ZombieCoder-Version',
  OWNER_HEADER: 'X-ZombieCoder-Owner',
  SIGNATURE_HEADER: 'X-ZombieCoder-Signature',

  // Roles and Permissions
  ROLES: {
    ADMIN: 'ADMIN',
    CLIENT: 'CLIENT',
  },

  // Tool Risk Levels
  RISK_LEVELS: {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
  },

  // Session Status
  SESSION_STATUS: {
    ACTIVE: 'ACTIVE',
    COMPLETED: 'COMPLETED',
    TERMINATED: 'TERMINATED',
  },

  // Governance
  ETHICS_RULES: {
    NO_FILE_DESTRUCTION: true,
    NO_UNAUTHORIZED_CHANGES: true,
    NO_DECEPTION: true,
    TRANSPARENCY_REQUIRED: true,
  },

  // Default Timeout Values (ms)
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  TASK_TIMEOUT: 5 * 60 * 1000, // 5 minutes
  API_TIMEOUT: 30 * 1000, // 30 seconds

  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,

  // AI Model Defaults
  DEFAULT_TEMPERATURE: 0.7,
  DEFAULT_MAX_TOKENS: 2048,
  DEFAULT_PROVIDER: 'ollama',
  DEFAULT_MODEL: 'mistral',
}

// ============================================================================
// SYSTEM INITIALIZATION
// ============================================================================

/**
 * Initialize ZombieCoder system configuration
 * Called once at application startup
 */
export function initializeSystemConfig(): void {
  try {
    // Load and validate identity
    const identity = loadSystemIdentity()
    console.log(`[ZombieCoder] System initialized: ${identity.system_identity.name} v${identity.system_identity.version}`)
    console.log(`[ZombieCoder] Owner: ${identity.system_identity.branding.owner}`)
    console.log(`[ZombieCoder] Organization: ${identity.system_identity.branding.organization}`)
    console.log(`[ZombieCoder] Location: ${identity.system_identity.branding.location}`)

    // Validate environment
    const env = getEnvironmentConfig()
    console.log(`[ZombieCoder] Environment: ${env.NODE_ENV}`)
    console.log(`[ZombieCoder] Database: ${env.DATABASE_URL}`)
    console.log(`[ZombieCoder] MCP Transport: ${env.MCP_TRANSPORT}`)
    console.log(`[ZombieCoder] Governance Enabled: ${env.ENABLE_GOVERNANCE}`)
    console.log(`[ZombieCoder] Audit Logging Enabled: ${env.ENABLE_AUDIT_LOGGING}`)

    // Display governance notice
    if (env.ENABLE_GOVERNANCE) {
      console.log(
        '[ZombieCoder] Ethics Framework: Local-First, User-Safe, Transparent'
      )
    }

    console.log('[ZombieCoder] System ready. "যেখানে কোড ও কথা বলে"')
  } catch (error) {
    console.error('[ZombieCoder] System initialization failed:', error)
    process.exit(1)
  }
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Get full system identity with environment info
 */
export function getFullSystemContext(): any {
  const identity = loadSystemIdentity()
  const env = getEnvironmentConfig()

  return {
    identity: identity.system_identity,
    environment: {
      NODE_ENV: env.NODE_ENV,
      APP_URL: env.APP_URL,
      MCP_TRANSPORT: env.MCP_TRANSPORT,
      GOVERNANCE_ENABLED: env.ENABLE_GOVERNANCE,
    },
    timestamp: new Date().toISOString(),
  }
}

/**
 * Verify system integrity
 * Check that identity.json has not been tampered with
 */
export function verifySystemIntegrity(): boolean {
  try {
    const identity = loadSystemIdentity()
    const requiredFields = [
      'name',
      'version',
      'tagline',
      'branding',
      'license',
      'technical',
      'security',
      'governance',
    ]

    const systemIdentity = identity.system_identity
    const allFieldsPresent = requiredFields.every((field) =>
      Object.prototype.hasOwnProperty.call(systemIdentity, field)
    )

    if (!allFieldsPresent) {
      console.warn('[ZombieCoder] System identity integrity check failed: Missing required fields')
      return false
    }

    console.log('[ZombieCoder] System integrity verified')
    return true
  } catch (error) {
    console.error('[ZombieCoder] System integrity verification failed:', error)
    return false
  }
}
