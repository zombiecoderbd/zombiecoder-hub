import { AgentCore } from '../agent/core';

/**
 * Singleton instance of AgentCore
 * Ensures only one agent instance runs across the application
 */

let agentCoreInstance: AgentCore | null = null;

export function getAgentCore(): AgentCore {
  if (!agentCoreInstance) {
    agentCoreInstance = new AgentCore();
  }
  return agentCoreInstance;
}

export function resetAgentCore(): void {
  agentCoreInstance = null;
}
