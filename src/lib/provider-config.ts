export const DEFAULT_ORCHESTRATOR_MODEL = "claude-sonnet-4-6";
export const DEFAULT_SPECIALIST_MODEL = "claude-haiku-4-5-20251001";

function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (value == null) return defaultValue;
  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return defaultValue;
}

function parseNumber(value: string | undefined, defaultValue: number): number {
  if (value == null || value.trim() === "") return defaultValue;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : defaultValue;
}

export function getOrchestratorModel(): string {
  return process.env.ANTHROPIC_MODEL_ORCHESTRATOR ?? DEFAULT_ORCHESTRATOR_MODEL;
}

export function getSpecialistModel(): string {
  return process.env.ANTHROPIC_MODEL_SPECIALIST ?? DEFAULT_SPECIALIST_MODEL;
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
    enabled: parseBoolean(process.env.DAILY_CAP_ENABLED, false),
    requestLimit: Math.max(0, parseNumber(process.env.DAILY_CAP_REQUEST_LIMIT, 0)),
  };
}