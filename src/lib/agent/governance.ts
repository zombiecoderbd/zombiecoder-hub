/**
 * GOVERNANCE VALIDATOR
 * Ensures all agent operations comply with ethical constraints and safety rules
 * Implements decision validation, risk assessment, and compliance checking
 * 
 * Core Principles:
 * - No destructive operations without explicit user confirmation
 * - No unauthorized access to system resources
 * - Complete transparency about limitations and failures
 * - Immutable audit trail of all decisions
 */

import { GovernancePolicy, TaskStatus } from '@prisma/client';
import { getDbClient } from '../db/client';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface GovernanceContext {
  userId: string;
  agentId: string;
  sessionId: string;
  operationType: 'READ' | 'WRITE' | 'DELETE' | 'EXECUTE' | 'ADMIN';
  targetResource: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
}

export interface ComplianceResult {
  approved: boolean;
  riskScore: number;
  requiresConfirmation: boolean;
  warnings: string[];
  policyViolations: string[];
  recommendedActions: string[];
}

export interface DecisionRecord {
  id: string;
  timestamp: Date;
  context: GovernanceContext;
  decision: 'APPROVED' | 'REJECTED' | 'PENDING_CONFIRMATION';
  complianceResult: ComplianceResult;
  executedAt?: Date;
  outcome?: string;
}

// ============================================================================
// GOVERNANCE VALIDATOR CLASS
// ============================================================================

export class GovernanceValidator {
  private policies: GovernancePolicy[] = [];
  private decisionHistory: Map<string, DecisionRecord> = new Map();

  /**
   * Initialize governance validator with active policies
   */
  async initialize(): Promise<void> {
    try {
      const db = getDbClient();
      this.policies = await db.governancePolicy.findMany({
        where: { enabled: true }
      });
      console.log(`[v0] Governance initialized with ${this.policies.length} policies`);
    } catch (error) {
      console.error('[v0] Failed to initialize governance:', error);
      throw new Error('Governance initialization failed');
    }
  }

  /**
   * Validate operation against governance policies
   */
  async validateOperation(context: GovernanceContext): Promise<ComplianceResult> {
    const warnings: string[] = [];
    const violations: string[] = [];
    let riskScore = 0;
    let requiresConfirmation = false;

    // Check destructive operations
    if (context.operationType === 'DELETE') {
      violations.push('Destructive operations require explicit user confirmation');
      requiresConfirmation = true;
      riskScore += 50;
    }

    // Check high-risk operations
    if (context.riskLevel === 'CRITICAL') {
      violations.push('Critical-risk operation requires governance approval');
      requiresConfirmation = true;
      riskScore += 60;
    } else if (context.riskLevel === 'HIGH') {
      warnings.push('High-risk operation detected');
      riskScore += 40;
    }

    // Check policy violations
    for (const policy of this.policies) {
      const policyResult = this.evaluatePolicy(policy, context);
      if (policyResult.violated) {
        violations.push(policyResult.message);
        riskScore += policyResult.riskWeight;
      } else if (policyResult.warning) {
        warnings.push(policyResult.message);
      }
    }

    // Determine if operation is approved
    const approved = violations.length === 0 && riskScore < 100;

    return {
      approved,
      riskScore: Math.min(riskScore, 100),
      requiresConfirmation,
      warnings,
      policyViolations: violations,
      recommendedActions: this.getRecommendedActions(context, riskScore)
    };
  }

  /**
   * Evaluate a single policy against context
   */
  private evaluatePolicy(
    policy: GovernancePolicy,
    context: GovernanceContext
  ): { violated: boolean; warning: boolean; message: string; riskWeight: number } {
    const rules = JSON.parse(policy.ruleJson || '{}');

    // Check restricted operations
    if (rules.restrictedOperations?.includes(context.operationType)) {
      return {
        violated: true,
        warning: false,
        message: `Operation type ${context.operationType} is restricted by policy: ${policy.name}`,
        riskWeight: 30
      };
    }

    // Check restricted resources
    if (rules.restrictedResources) {
      const resourcePattern = new RegExp(rules.restrictedResources);
      if (resourcePattern.test(context.targetResource)) {
        return {
          violated: true,
          warning: false,
          message: `Access to resource ${context.targetResource} is restricted by policy: ${policy.name}`,
          riskWeight: 40
        };
      }
    }

    // Check warnings
    if (rules.warningOperations?.includes(context.operationType)) {
      return {
        violated: false,
        warning: true,
        message: `Operation type ${context.operationType} should be reviewed before execution`,
        riskWeight: 10
      };
    }

    return { violated: false, warning: false, message: '', riskWeight: 0 };
  }

  /**
   * Get recommended actions based on risk assessment
   */
  private getRecommendedActions(context: GovernanceContext, riskScore: number): string[] {
    const actions: string[] = [];

    if (riskScore > 80) {
      actions.push('Request additional approval from administrator');
      actions.push('Enable detailed logging for this operation');
    }

    if (riskScore > 50) {
      actions.push('Log operation with detailed context');
      actions.push('Notify user of operation details');
    }

    if (context.operationType === 'DELETE') {
      actions.push('Create backup before deletion');
      actions.push('Request explicit user confirmation');
    }

    if (context.operationType === 'ADMIN') {
      actions.push('Verify administrator authentication');
      actions.push('Log with administrative context');
    }

    return actions;
  }

  /**
   * Record a decision for audit trail
   */
  async recordDecision(
    context: GovernanceContext,
    complianceResult: ComplianceResult,
    decision: 'APPROVED' | 'REJECTED' | 'PENDING_CONFIRMATION'
  ): Promise<DecisionRecord> {
    const record: DecisionRecord = {
      id: `dec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      context,
      decision,
      complianceResult
    };

    this.decisionHistory.set(record.id, record);

    // Log to audit trail
    try {
      const db = getDbClient();
      await db.auditLog.create({
        data: {
          user: { connect: { id: context.userId } },
          action: `GOVERNANCE_${decision}`,
          resource: context.targetResource,
          details: JSON.stringify({
            operationType: context.operationType,
            riskScore: complianceResult.riskScore,
            violations: complianceResult.policyViolations
          }),
          ipAddress: 'internal',
          userAgent: 'governance-validator'
        }
      });
    } catch (error) {
      console.error('[v0] Failed to log governance decision:', error);
    }

    return record;
  }

  /**
   * Get decision history for a session
   */
  getSessionDecisionHistory(sessionId: string): DecisionRecord[] {
    return Array.from(this.decisionHistory.values()).filter(
      record => record.context.sessionId === sessionId
    );
  }

  /**
   * Verify operation can be executed
   */
  async canExecute(context: GovernanceContext): Promise<boolean> {
    const result = await this.validateOperation(context);
    return result.approved && !result.requiresConfirmation;
  }

  /**
   * Check if operation requires user confirmation
   */
  async requiresUserConfirmation(context: GovernanceContext): Promise<boolean> {
    const result = await this.validateOperation(context);
    return result.requiresConfirmation;
  }

  /**
   * Get compliance report for display to user
   */
  async getComplianceReport(context: GovernanceContext): Promise<string> {
    const result = await this.validateOperation(context);
    
    let report = `GOVERNANCE COMPLIANCE REPORT\n`;
    report += `===========================\n\n`;
    report += `Operation: ${context.operationType} on ${context.targetResource}\n`;
    report += `Risk Level: ${context.riskLevel}\n`;
    report += `Risk Score: ${result.riskScore}/100\n\n`;

    if (result.policyViolations.length > 0) {
      report += `VIOLATIONS:\n`;
      result.policyViolations.forEach(v => {
        report += `  - ${v}\n`;
      });
      report += `\n`;
    }

    if (result.warnings.length > 0) {
      report += `WARNINGS:\n`;
      result.warnings.forEach(w => {
        report += `  - ${w}\n`;
      });
      report += `\n`;
    }

    if (result.recommendedActions.length > 0) {
      report += `RECOMMENDED ACTIONS:\n`;
      result.recommendedActions.forEach(a => {
        report += `  - ${a}\n`;
      });
    }

    report += `\nStatus: ${result.approved ? 'APPROVED' : 'PENDING_REVIEW'}\n`;

    return report;
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let validatorInstance: GovernanceValidator | null = null;

export async function getGovernanceValidator(): Promise<GovernanceValidator> {
  if (!validatorInstance) {
    validatorInstance = new GovernanceValidator();
    await validatorInstance.initialize();
  }
  return validatorInstance;
}

export function getGovernanceValidatorSync(): GovernanceValidator {
  if (!validatorInstance) {
    throw new Error('Governance validator not initialized. Call getGovernanceValidator() first.');
  }
  return validatorInstance;
}
