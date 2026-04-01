/**
 * Role-Based Access Control (RBAC) System
 * 
 * Manages permissions based on user roles (ADMIN, CLIENT)
 * Used by all API routes and admin operations
 */

import { Role } from '@prisma/client'

// ============================================================================
// PERMISSION TYPES
// ============================================================================

export enum Permission {
  // User Management
  USER_CREATE = 'user:create',
  USER_READ = 'user:read',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',

  // Agent Management
  AGENT_CREATE = 'agent:create',
  AGENT_READ = 'agent:read',
  AGENT_UPDATE = 'agent:configure',
  AGENT_ENABLE = 'agent:enable',
  AGENT_DISABLE = 'agent:disable',
  AGENT_EXECUTE = 'agent:execute',

  // Tool Management
  TOOL_REGISTER = 'tool:register',
  TOOL_READ = 'tool:read',
  TOOL_UPDATE = 'tool:update',
  TOOL_EXECUTE = 'tool:execute',

  // System Management
  SYSTEM_CONFIG = 'system:config',
  SYSTEM_MONITOR = 'system:monitor',
  SYSTEM_LOGS = 'system:logs',

  // Governance
  GOVERNANCE_READ = 'governance:read',
  GOVERNANCE_UPDATE = 'governance:update',
  AUDIT_READ = 'audit:read',
}

// ============================================================================
// ROLE-PERMISSION MAPPING
// ============================================================================

const rolePermissions: Record<Role, Permission[]> = {
  ADMIN: [
    // Admin can do everything
    Permission.USER_CREATE,
    Permission.USER_READ,
    Permission.USER_UPDATE,
    Permission.USER_DELETE,

    Permission.AGENT_CREATE,
    Permission.AGENT_READ,
    Permission.AGENT_UPDATE,
    Permission.AGENT_ENABLE,
    Permission.AGENT_DISABLE,
    Permission.AGENT_EXECUTE,

    Permission.TOOL_REGISTER,
    Permission.TOOL_READ,
    Permission.TOOL_UPDATE,
    Permission.TOOL_EXECUTE,

    Permission.SYSTEM_CONFIG,
    Permission.SYSTEM_MONITOR,
    Permission.SYSTEM_LOGS,

    Permission.GOVERNANCE_READ,
    Permission.GOVERNANCE_UPDATE,
    Permission.AUDIT_READ,
  ],

  CLIENT: [
    // Clients can only execute tools and read basic info
    Permission.AGENT_READ,
    Permission.AGENT_EXECUTE,
    Permission.TOOL_READ,
    Permission.TOOL_EXECUTE,
  ],
}

// ============================================================================
// PERMISSION CHECKING
// ============================================================================

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: Role | null, permission: Permission): boolean {
  if (!role) return false
  const permissions = rolePermissions[role]
  return permissions.includes(permission)
}

/**
 * Check if a role has all specified permissions
 */
export function hasAllPermissions(
  role: Role | null,
  permissions: Permission[]
): boolean {
  return permissions.every((p) => hasPermission(role, p))
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(
  role: Role | null,
  permissions: Permission[]
): boolean {
  return permissions.some((p) => hasPermission(role, p))
}

/**
 * Get all permissions for a role
 */
export function getPermissions(role: Role | null): Permission[] {
  if (!role) return []
  return rolePermissions[role]
}

// ============================================================================
// PERMISSION GUARDS FOR API ROUTES
// ============================================================================

/**
 * Create a permission checking middleware
 */
export function createPermissionGuard(requiredPermissions: Permission[]) {
  return (userRole: Role | null): boolean => {
    return hasAllPermissions(userRole, requiredPermissions)
  }
}

/**
 * Permission check response for API routes
 */
export function permissionDenied(permission: Permission): {
  error: string
  code: string
  permission: Permission
} {
  return {
    error: 'Permission Denied',
    code: 'PERMISSION_DENIED',
    permission,
  }
}

// ============================================================================
// SPECIFIC PERMISSION CHECKS (Convenience Functions)
// ============================================================================

export const PermissionChecks = {
  // User Management
  canCreateUsers: (role: Role | null) => hasPermission(role, Permission.USER_CREATE),
  canDeleteUsers: (role: Role | null) => hasPermission(role, Permission.USER_DELETE),
  canUpdateUsers: (role: Role | null) => hasPermission(role, Permission.USER_UPDATE),

  // Agent Management
  canConfigureAgents: (role: Role | null) =>
    hasPermission(role, Permission.AGENT_UPDATE),
  canExecuteAgents: (role: Role | null) =>
    hasPermission(role, Permission.AGENT_EXECUTE),
  canEnableAgents: (role: Role | null) => hasPermission(role, Permission.AGENT_ENABLE),
  canDisableAgents: (role: Role | null) =>
    hasPermission(role, Permission.AGENT_DISABLE),

  // Tool Management
  canRegisterTools: (role: Role | null) =>
    hasPermission(role, Permission.TOOL_REGISTER),
  canExecuteTools: (role: Role | null) => hasPermission(role, Permission.TOOL_EXECUTE),
  canUpdateTools: (role: Role | null) => hasPermission(role, Permission.TOOL_UPDATE),

  // System Management
  canConfigureSystem: (role: Role | null) =>
    hasPermission(role, Permission.SYSTEM_CONFIG),
  canMonitorSystem: (role: Role | null) =>
    hasPermission(role, Permission.SYSTEM_MONITOR),
  canViewLogs: (role: Role | null) => hasPermission(role, Permission.SYSTEM_LOGS),

  // Governance
  canManageGovernance: (role: Role | null) =>
    hasPermission(role, Permission.GOVERNANCE_UPDATE),
  canReadAuditLogs: (role: Role | null) => hasPermission(role, Permission.AUDIT_READ),
}

// ============================================================================
// RESOURCE-LEVEL PERMISSION CHECKS
// ============================================================================

/**
 * Check if user can access a specific resource
 * Can be extended to include resource-specific rules
 */
export function canAccessResource(
  userRole: Role | null,
  resourceType: string,
  action: 'read' | 'create' | 'update' | 'delete'
): boolean {
  const permissionMap: Record<string, Record<string, Permission>> = {
    user: {
      create: Permission.USER_CREATE,
      read: Permission.USER_READ,
      update: Permission.USER_UPDATE,
      delete: Permission.USER_DELETE,
    },
    agent: {
      create: Permission.AGENT_CREATE,
      read: Permission.AGENT_READ,
      update: Permission.AGENT_UPDATE,
      delete: Permission.AGENT_DISABLE,
    },
    tool: {
      create: Permission.TOOL_REGISTER,
      read: Permission.TOOL_READ,
      update: Permission.TOOL_UPDATE,
      delete: Permission.TOOL_UPDATE,
    },
  }

  const permission = permissionMap[resourceType]?.[action]
  if (!permission) return false

  return hasPermission(userRole, permission)
}

// ============================================================================
// ROLE HELPERS
// ============================================================================

/**
 * Check if role is admin
 */
export function isAdmin(role: Role | null): boolean {
  return role === 'ADMIN'
}

/**
 * Check if role is client
 */
export function isClient(role: Role | null): boolean {
  return role === 'CLIENT'
}

/**
 * Get human-readable role name
 */
export function getRoleName(role: Role): string {
  const names: Record<Role, string> = {
    ADMIN: 'Administrator',
    CLIENT: 'Client User',
  }
  return names[role]
}

// ============================================================================
// PERMISSION MATRIX (For Documentation/Audit)
// ============================================================================

/**
 * Generate a permission matrix for documentation/auditing
 */
export function generatePermissionMatrix(): Record<Role, Record<Permission, boolean>> {
  const matrix: Record<Role, Record<Permission, boolean>> = {
    ADMIN: {} as Record<Permission, boolean>,
    CLIENT: {} as Record<Permission, boolean>,
  }

  Object.values(Permission).forEach((permission) => {
    matrix.ADMIN[permission] = hasPermission('ADMIN', permission)
    matrix.CLIENT[permission] = hasPermission('CLIENT', permission)
  })

  return matrix
}

/**
 * Print permission matrix for debugging
 */
export function printPermissionMatrix(): void {
  const matrix = generatePermissionMatrix()

  console.log('\n=== RBAC Permission Matrix ===\n')

  Object.entries(matrix).forEach(([role, permissions]) => {
    console.log(`[${role}]`)
    Object.entries(permissions).forEach(([permission, allowed]) => {
      console.log(`  ${allowed ? '✓' : '✗'} ${permission}`)
    })
    console.log()
  })
}
