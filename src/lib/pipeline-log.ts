export async function logPipelineEvent(
  event: string,
  data: Record<string, unknown>
): Promise<void> {
  const timestamp = new Date().toISOString();
  try {
    const { appendFile } = await import("fs/promises");
    const logPath = new URL("../../memory/feedback-log.md", import.meta.url);
    const entry = `\n## ${timestamp} — ${event}\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\`\n`;
    await appendFile(logPath, entry, "utf-8");
  } catch {
    // Logging must not break the pipeline (e.g. in Worker runtime)
    console.info(`[pipeline] ${event}`, data);
  }
}
