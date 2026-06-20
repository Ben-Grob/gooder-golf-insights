import { appendFile } from "fs/promises";

const logPath = new URL("../../memory/feedback-log.md", import.meta.url);

export async function logPipelineEvent(
  event: string,
  data: Record<string, unknown>
): Promise<void> {
  const timestamp = new Date().toISOString();
  const entry = `\n## ${timestamp} — ${event}\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\`\n`;

  try {
    await appendFile(logPath, entry, "utf-8");
  } catch {
    // Logging must not break the pipeline
    console.info(`[pipeline] ${event}`, data);
  }
}
