// Gemini API utility — extracted from src/routes/api/plan.ts

export type GeminiMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type GeminiResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

export type GeminiOptions = {
  model?: string;
  maxRetries?: number;
};

/**
 * Call the Gemini API via Lovable AI gateway.
 * @param messages - Array of { role, content } pairs
 * @param options - Optional model and retry settings
 * @returns The first choice's message content, or throws on error
 */
export async function callGemini(
  messages: GeminiMessage[],
  options?: GeminiOptions
): Promise<string> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");

  const model = options?.model ?? "google/gemini-3-flash-preview";
  const maxRetries = options?.maxRetries ?? 1;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Lovable-API-Key": key,
        },
        body: JSON.stringify({
          model,
          messages,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        lastError = new Error(`Gemini API error: ${res.status} ${text}`);
        if (attempt < maxRetries) continue;
        throw lastError;
      }

      const data = (await res.json()) as GeminiResponse;
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error("No content in Gemini response");
      return content;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < maxRetries) {
        // Exponential backoff: 100ms, 200ms, etc.
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 100));
        continue;
      }
    }
  }

  throw lastError ?? new Error("Unknown error calling Gemini");
}
