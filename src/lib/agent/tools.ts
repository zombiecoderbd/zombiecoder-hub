/**
 * TOOL EXECUTION SYSTEM
 * Manages agent tools, validates permissions, and executes operations safely
 * Supports sandboxed execution with governance checks
 */

import { getDbClient } from '../db/client';
import { Tool, ToolExecution } from '@prisma/client';
import { getGovernanceValidator, GovernanceContext } from './governance';
import * as fs from 'fs/promises';
import * as path from 'path';
import { spawn } from 'child_process';

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, any>;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  requiresConfirmation: boolean;
}

export interface ToolExecutionRequest {
  toolId: string;
  toolName: string;
  agentId: string;
  sessionId: string;
  userId: string;
  parameters: Record<string, any>;
  context?: Record<string, any>;
}

export interface ToolExecutionResult {
  executionId: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING_APPROVAL';
  output?: string;
  error?: string;
  executionTime: number;
  timestamp: Date;
}

export class ToolExecutor {
  private registeredTools: Map<string, ToolDefinition> = new Map();
  private maxFileReadBytes = 1024 * 1024;
  private maxSearchResults = 200;
  private maxCommandOutputBytes = 256 * 1024;
  private commandTimeoutMs = 15000;

  constructor() {
    this.initializeDefaultTools();
  }

  /**
   * Initialize default tools
   */
  private initializeDefaultTools(): void {
    this.registerTool({
      name: 'read-file',
      description: 'Read contents of a file',
      parameters: {
        path: { type: 'string', description: 'File path to read', required: true }
      },
      riskLevel: 'LOW',
      requiresConfirmation: false
    });

    this.registerTool({
      name: 'write-file',
      description: 'Write contents to a file',
      parameters: {
        path: { type: 'string', description: 'File path to write', required: true },
        content: { type: 'string', description: 'File content', required: true },
        overwrite: { type: 'boolean', description: 'Allow overwriting existing file (requires confirmation)' },
        confirmed: { type: 'boolean', description: 'Set true to confirm this high-risk operation' }
      },
      riskLevel: 'HIGH',
      requiresConfirmation: true
    });

    this.registerTool({
      name: 'execute-command',
      description: 'Execute a shell command',
      parameters: {
        command: { type: 'string', description: 'Command to execute', required: true },
        cwd: { type: 'string', description: 'Working directory (optional)' },
        timeoutMs: { type: 'number', description: 'Timeout in milliseconds (optional)' },
        confirmed: { type: 'boolean', description: 'Set true to confirm this high-risk operation' }
      },
      riskLevel: 'HIGH',
      requiresConfirmation: true
    });

    this.registerTool({
      name: 'search-files',
      description: 'Search for files matching pattern',
      parameters: {
        pattern: { type: 'string', description: 'File search pattern', required: true },
        directory: { type: 'string', description: 'Starting directory', required: true },
        maxDepth: { type: 'number', description: 'Max directory depth (optional)' }
      },
      riskLevel: 'LOW',
      requiresConfirmation: false
    });
  }

  /**
   * Register a tool
   */
  registerTool(definition: ToolDefinition): void {
    this.registeredTools.set(definition.name, definition);
    console.log(`[v0] Tool registered: ${definition.name}`);
  }

  /**
   * Check if user has permission to use tool
   */
  async hasToolPermission(userId: string, toolName: string): Promise<boolean> {
    const db = getDbClient();
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });
    if (!user) return false;

    // Default: admins can execute tools even if ToolPermission rows are not seeded.
    if (user.role === 'ADMIN') return true;

    const permission = await db.toolPermission.findFirst({
      where: {
        role: user.role,
        allowed: true,
        tool: {
          name: toolName
        }
      }
    });

    return Boolean(permission);
  }

  /**
   * Execute tool with governance checks
   */
  async executeTool(request: ToolExecutionRequest): Promise<ToolExecutionResult> {
    const startTime = Date.now();

    try {
      // Check permissions
      const hasPermission = await this.hasToolPermission(request.userId, request.toolName);
      if (!hasPermission) {
        return {
          executionId: `exec_${Date.now()}`,
          status: 'FAILED',
          error: `User does not have permission to use tool: ${request.toolName}`,
          executionTime: Date.now() - startTime,
          timestamp: new Date()
        };
      }

      // Get tool definition
      const toolDef = this.registeredTools.get(request.toolName);
      if (!toolDef) {
        return {
          executionId: `exec_${Date.now()}`,
          status: 'FAILED',
          error: `Tool not found: ${request.toolName}`,
          executionTime: Date.now() - startTime,
          timestamp: new Date()
        };
      }

      // Validate parameters
      const paramValidation = this.validateParameters(request.parameters, toolDef.parameters);
      if (!paramValidation.valid) {
        return {
          executionId: `exec_${Date.now()}`,
          status: 'FAILED',
          error: `Invalid parameters: ${paramValidation.errors.join(', ')}`,
          executionTime: Date.now() - startTime,
          timestamp: new Date()
        };
      }

      // Check governance
      const governor = await getGovernanceValidator();
      const governanceContext: GovernanceContext = {
        userId: request.userId,
        agentId: request.agentId,
        sessionId: request.sessionId,
        operationType:
          request.toolName === 'write-file'
            ? 'WRITE'
            : request.toolName === 'execute-command'
              ? 'EXECUTE'
              : 'READ',
        targetResource: request.parameters.path || request.toolName,
        riskLevel: toolDef.riskLevel,
        description: `Tool execution: ${request.toolName}`
      };

      const compliance = await governor.validateOperation(governanceContext);

      if (!compliance.approved) {
        return {
          executionId: `exec_${Date.now()}`,
          status: 'PENDING_APPROVAL',
          error: `Governance check failed: ${compliance.policyViolations.join(', ')}`,
          executionTime: Date.now() - startTime,
          timestamp: new Date()
        };
      }

      if (toolDef.requiresConfirmation && request.parameters.confirmed !== true) {
        return {
          executionId: `exec_${Date.now()}`,
          status: 'PENDING_APPROVAL',
          error: `Confirmation required for tool: ${request.toolName}`,
          executionTime: Date.now() - startTime,
          timestamp: new Date()
        };
      }

      // Execute tool
      const result = await this.executeToolLogic(request.toolName, request.parameters);

      const db = getDbClient();
      const toolDefForDb = this.registeredTools.get(request.toolName);
      if (!toolDefForDb) {
        return {
          executionId: `exec_${Date.now()}`,
          status: 'FAILED',
          error: `Tool not registered: ${request.toolName}`,
          executionTime: Date.now() - startTime,
          timestamp: new Date()
        };
      }

      // Ensure the Tool row exists. Use toolId (unique) to avoid duplicate-key failures
      // when the DB already contains the same toolId with a different name.
      const tool = await db.tool.upsert({
        where: { toolId: request.toolName },
        update: {
          name: request.toolName,
          description: toolDefForDb.description,
          riskLevel: toolDefForDb.riskLevel,
          requiresConfirmation: toolDefForDb.requiresConfirmation,
          enabled: true,
          schema: JSON.stringify({ type: 'object', properties: toolDefForDb.parameters })
        },
        create: {
          toolId: request.toolName,
          name: request.toolName,
          description: toolDefForDb.description,
          riskLevel: toolDefForDb.riskLevel,
          requiresConfirmation: toolDefForDb.requiresConfirmation,
          enabled: true,
          schema: JSON.stringify({ type: 'object', properties: toolDefForDb.parameters })
        },
        select: { id: true }
      });

      const execution = await db.toolExecution.create({
        data: {
          toolId: tool.id,
          userId: request.userId,
          status: 'success',
          input: JSON.stringify(request.parameters),
          output: result,
          ethicsPassed: true,
          riskScore: 0,
          executionTime: Date.now() - startTime
        }
      });

      return {
        executionId: execution.id,
        status: 'SUCCESS',
        output: result,
        executionTime: Date.now() - startTime,
        timestamp: new Date()
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      try {
        const db = getDbClient();
        const tool = await db.tool.findFirst({
          where: { name: request.toolName },
          select: { id: true }
        });

        if (tool) {
          await db.toolExecution.create({
            data: {
              toolId: tool.id,
              userId: request.userId,
              status: 'error',
              input: JSON.stringify(request.parameters),
              output: null,
              errorMessage,
              ethicsPassed: false,
              riskScore: 0,
              executionTime: Date.now() - startTime
            }
          });
        }
      } catch {
        // best-effort persistence
      }

      return {
        executionId: `exec_${Date.now()}`,
        status: 'FAILED',
        error: errorMessage,
        executionTime: Date.now() - startTime,
        timestamp: new Date()
      };
    }
  }

  /**
   * Execute actual tool logic
   */
  private async executeToolLogic(toolName: string, parameters: Record<string, any>): Promise<string> {
    switch (toolName) {
      case 'read-file':
        return await this.toolReadFile(parameters.path);

      case 'write-file':
        return await this.toolWriteFile(parameters.path, parameters.content, {
          overwrite: Boolean(parameters.overwrite),
        });

      case 'search-files':
        return await this.toolSearchFiles(parameters.pattern, parameters.directory, {
          maxDepth: typeof parameters.maxDepth === 'number' ? parameters.maxDepth : 6,
        });

      case 'execute-command':
        return await this.toolExecuteCommand(parameters.command, {
          cwd: typeof parameters.cwd === 'string' ? parameters.cwd : undefined,
          timeoutMs: typeof parameters.timeoutMs === 'number' ? parameters.timeoutMs : undefined,
        });

      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }

  /**
   * Read file tool
   */
  private async toolReadFile(path: string): Promise<string> {
    const resolved = this.resolveSafePath(path);
    const stat = await fs.stat(resolved);
    if (!stat.isFile()) {
      throw new Error('Path is not a file');
    }
    if (stat.size > this.maxFileReadBytes) {
      throw new Error(`File too large to read (${stat.size} bytes)`);
    }
    const buf = await fs.readFile(resolved);
    return buf.toString('utf8');
  }

  /**
   * Write file tool
   */
  private async toolWriteFile(
    filePath: string,
    content: string,
    options: { overwrite: boolean }
  ): Promise<string> {
    const resolved = this.resolveSafePath(filePath);
    await fs.mkdir(path.dirname(resolved), { recursive: true });

    if (!options.overwrite) {
      await fs.writeFile(resolved, content, { flag: 'wx' });
      return `Wrote ${content.length} bytes to ${resolved}`;
    }

    const existing = await fs.stat(resolved).catch(() => null);
    if (!existing || !existing.isFile()) {
      await fs.writeFile(resolved, content, { flag: 'wx' });
      return `Wrote ${content.length} bytes to ${resolved}`;
    }

    await fs.writeFile(resolved, content, { flag: 'w' });
    return `Overwrote ${content.length} bytes to ${resolved}`;
  }

  /**
   * Search files tool
   */
  private async toolSearchFiles(
    pattern: string,
    directory: string,
    options: { maxDepth: number }
  ): Promise<string> {
    const root = this.resolveSafePath(directory);
    const results: string[] = [];
    const needle = pattern.toLowerCase();

    const walk = async (dir: string, depth: number) => {
      if (results.length >= this.maxSearchResults) return;
      if (depth > options.maxDepth) return;

      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const e of entries) {
        if (results.length >= this.maxSearchResults) return;
        if (e.name === 'node_modules' || e.name === '.git' || e.name === '.next') continue;

        const full = path.join(dir, e.name);
        if (e.isDirectory()) {
          await walk(full, depth + 1);
        } else if (e.isFile()) {
          const rel = path.relative(process.cwd(), full);
          if (rel.toLowerCase().includes(needle) || e.name.toLowerCase().includes(needle)) {
            results.push(rel);
          }
        }
      }
    };

    await walk(root, 0);
    return JSON.stringify({ pattern, directory: root, results, truncated: results.length >= this.maxSearchResults });
  }

  /**
   * Execute command tool
   */
  private async toolExecuteCommand(
    command: string,
    options?: { cwd?: string; timeoutMs?: number }
  ): Promise<string> {
    const timeoutMs = options?.timeoutMs ?? this.commandTimeoutMs;
    const cwd = options?.cwd ? this.resolveSafePath(options.cwd) : process.cwd();

    const trimmed = String(command || '').trim();
    if (!trimmed) throw new Error('Command cannot be empty');
    if (trimmed.includes('\n') || trimmed.includes('\r')) {
      throw new Error('Multi-line commands are not allowed');
    }

    const [bin, ...args] = this.splitCommand(trimmed);

    return await new Promise((resolve, reject) => {
      const child = spawn(bin, args, { cwd, shell: false });
      let out = '';
      let err = '';
      let done = false;

      const killTimer = setTimeout(() => {
        if (done) return;
        child.kill('SIGKILL');
      }, timeoutMs);

      const append = (chunk: Buffer, target: 'out' | 'err') => {
        const text = chunk.toString('utf8');
        if (target === 'out') out += text;
        else err += text;
        if (out.length + err.length > this.maxCommandOutputBytes) {
          child.kill('SIGKILL');
        }
      };

      child.stdout.on('data', (c) => append(c, 'out'));
      child.stderr.on('data', (c) => append(c, 'err'));

      child.on('error', (e) => {
        clearTimeout(killTimer);
        reject(e);
      });

      child.on('close', (code, signal) => {
        done = true;
        clearTimeout(killTimer);
        resolve(
          JSON.stringify({
            command: trimmed,
            cwd,
            exitCode: code,
            signal,
            stdout: out,
            stderr: err,
          })
        );
      });
    });
  }

  private resolveSafePath(p: string): string {
    const resolved = path.resolve(process.cwd(), p);
    const root = path.resolve(process.cwd());
    if (!resolved.startsWith(root + path.sep) && resolved !== root) {
      throw new Error('Path escapes workspace root');
    }
    return resolved;
  }

  private splitCommand(cmd: string): string[] {
    const parts: string[] = [];
    let current = '';
    let quote: '"' | "'" | null = null;

    for (let i = 0; i < cmd.length; i++) {
      const ch = cmd[i];
      if (quote) {
        if (ch === quote) {
          quote = null;
        } else {
          current += ch;
        }
        continue;
      }

      if (ch === '"' || ch === "'") {
        quote = ch as '"' | "'";
        continue;
      }

      if (ch === ' ') {
        if (current) {
          parts.push(current);
          current = '';
        }
        continue;
      }

      current += ch;
    }

    if (current) parts.push(current);
    if (parts.length === 0) throw new Error('Invalid command');
    return parts;
  }

  /**
   * Validate parameters
   */
  private validateParameters(
    parameters: Record<string, any>,
    schema: Record<string, any>
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const [key, paramSchema] of Object.entries(schema)) {
      const ps = paramSchema as any;
      const isRequired = ps?.required === true;
      if (isRequired && !(key in parameters)) errors.push(`Missing required parameter: ${key}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get available tools for user
   */
  async getAvailableTools(userId: string): Promise<ToolDefinition[]> {
    const db = getDbClient();
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });
    if (!user) return [];

    const permissions = await db.toolPermission.findMany({
      where: {
        role: user.role,
        allowed: true
      },
      include: {
        tool: true
      }
    });

    return permissions
      .map(p => this.registeredTools.get(p.tool.name))
      .filter((t): t is ToolDefinition => t !== undefined);
  }

  /**
   * Get tool statistics
   */
  async getToolStats(toolId: string): Promise<Record<string, any>> {
    const db = getDbClient();
    const executions = await db.toolExecution.findMany({
      where: { toolId }
    });

    const totalExecutions = executions.length;
    const successfulExecutions = executions.filter(e => e.status === 'success').length;
    const failedExecutions = executions.filter(e => e.status === 'error').length;
    const averageExecutionTime =
      executions.length > 0
        ? executions.reduce((sum, e) => sum + (e.executionTime || 0), 0) / executions.length
        : 0;

    return {
      toolId,
      totalExecutions,
      successfulExecutions,
      failedExecutions,
      successRate: totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0,
      averageExecutionTime
    };
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let executorInstance: ToolExecutor | null = null;

export function getToolExecutor(): ToolExecutor {
  if (!executorInstance) {
    executorInstance = new ToolExecutor();
  }
  return executorInstance;
}
