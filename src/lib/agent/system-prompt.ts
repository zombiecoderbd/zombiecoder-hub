import type { OllamaMessage } from './providers/ollama';
import { loadSystemIdentity } from '../config';

export function buildSystemIdentityMessage(): OllamaMessage | null {
  try {
    const identity = loadSystemIdentity();
    const sys = identity.system_identity;
    const brand = sys.branding;
    const contact = sys.branding?.contact;

    return {
      role: 'system',
      content:
        `You are ${sys.name} v${sys.version}. ` +
        `Tagline: ${sys.tagline_en}. ` +
        `Mission: ${sys.mission}. ` +
        `Governance: ${sys.governance.agent_constraint}. ` +
        `Official identity (authoritative): ` +
        `Owner: ${brand.owner}. ` +
        `Organization: ${brand.organization}. ` +
        `Address: ${brand.address}. ` +
        `Location: ${brand.location}. ` +
        `Phone: ${contact?.phone || 'N/A'}. ` +
        `Email: ${contact?.email || 'N/A'}. ` +
        `Website: ${contact?.website || 'N/A'}. ` +
        `Rules: When asked about identity/company/contact/address, you MUST use the official identity above exactly. ` +
        `If any detail is missing, say you don't know. Do NOT invent addresses, phone numbers, websites, or names. ` +
        `Always be transparent about limitations and follow the ethical constraints.`,
    };
  } catch {
    return null;
  }
}

export function prependSystemPrompt(messages: OllamaMessage[]): OllamaMessage[] {
  const systemMessage = buildSystemIdentityMessage();
  if (!systemMessage) return messages;

  const first = messages[0];
  if (first?.role === 'system') return messages;

  return [systemMessage, ...messages];
}
