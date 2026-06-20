// Gemini API utility — chat completions + tool-calling via Lovable AI gateway

export type GeminiTextMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type GeminiToolCall = {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
};

export type GeminiAssistantMessage = {
  role: "assistant";
  content: string | null;
  tool_calls?: GeminiToolCall[];
};

export type GeminiToolResultMessage = {
  role: "tool";
  tool_call_id: string;
  content: string;
};

export type GeminiMessage =
  | GeminiTextMessage
  | GeminiAssistantMessage
  | GeminiToolResultMessage;

export type GeminiToolDefinition = {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
};

export type GeminiCompletionMessage = {
  role: string;
  content?: string | null;
  tool_calls?: GeminiToolCall[];
};

export type GeminiCompletionChoice = {
  message?: GeminiCompletionMessage;
};

export type GeminiCompletionResponse = {
  choices?: GeminiCompletionChoice[];
};

export type GeminiOptions = {
  model?: string;
  maxRetries?: number;
  tools?: GeminiToolDefinition[];
  toolChoice?: "auto" | "none" | "required";
};

async function fetchCompletion(
  messages: GeminiMessage[],
  options?: GeminiOptions
): Promise<GeminiCompletionResponse> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");

  const model = options?.model ?? "google/gemini-3-flash-preview";
  const maxRetries = options?.maxRetries ?? 1;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const body: Record<string, unknown> = { model, messages };
      if (options?.tools?.length) {
        body.tools = options.tools;
        body.tool_choice = options.toolChoice ?? "auto";
      }

      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Lovable-API-Key": key,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const text = await res.text();
        lastError = new Error(`Gemini API error: ${res.status} ${text}`);
        if (attempt < maxRetries) continue;
        throw lastError;
      }

      return (await res.json()) as GeminiCompletionResponse;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 100));
        continue;
      }
    }
  }

  throw lastError ?? new Error("Unknown error calling Gemini");
}

/**
 * Call Gemini and return the first choice message content as text.
 */
export async function callGemini(
  messages: GeminiMessage[],
  options?: GeminiOptions
): Promise<string> {
  const data = await fetchCompletion(messages, options);
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("No content in Gemini response");
  return content;
}

/**
 * Call Gemini and return the full assistant message (supports tool_calls).
 */
export async function callGeminiCompletion(
  messages: GeminiMessage[],
  options?: GeminiOptions
): Promise<GeminiCompletionMessage> {
  const data = await fetchCompletion(messages, options);
  const message = data.choices?.[0]?.message;
  if (!message) throw new Error("No message in Gemini response");
  return message;
}
