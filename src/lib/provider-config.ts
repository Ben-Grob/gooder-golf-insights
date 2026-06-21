export const DEFAULT_ORCHESTRATOR_MODEL = "claude-sonnet-4-6";
export const DEFAULT_SPECIALIST_MODEL = "claude-haiku-4-5-20251001";

export function getOrchestratorModel(): string {
  return DEFAULT_ORCHESTRATOR_MODEL;
}

export function getSpecialistModel(): string {
  return DEFAULT_SPECIALIST_MODEL;
}

export function getAnthropicApiKey(): string {
  const raw = process.env.ANTHROPIC_API_KEY;
  if (!raw) {
    throw new Error("Missing ANTHROPIC_API_KEY");
  }

  const key = raw.trim();
  if (!key) {
    throw new Error("ANTHROPIC_API_KEY is empty");
  }

  if (!key.startsWith("sk-ant-")) {
    throw new Error("ANTHROPIC_API_KEY looks invalid. Anthropic keys should start with sk-ant-");
  }

  if (/\s/.test(key)) {
    throw new Error("ANTHROPIC_API_KEY contains whitespace or line breaks");
  }

  return key;
}

export function getDailyCapSettings(): {
  enabled: boolean;
  requestLimit: number;
} {
  return {
    enabled: false,
    requestLimit: 0,
  };
}