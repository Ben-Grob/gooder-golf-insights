// Gemini API utility — direct Google Gemini API with text + tool-calling support

export type GeminiTextMessage = {
  role: "system" | "user";
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

type GoogleGeminiPart =
  | { text: string }
  | {
      functionCall: {
        name: string;
        args?: Record<string, unknown>;
      };
    }
  | {
      functionResponse: {
        name: string;
        response: Record<string, unknown>;
      };
    };

type GoogleGeminiContent = {
  role: "user" | "model";
  parts: GoogleGeminiPart[];
};

type GoogleGeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: GoogleGeminiPart[];
    };
  }>;
};

function parseToolMessageContent(content: string): Record<string, unknown> {
  try {
    return JSON.parse(content) as Record<string, unknown>;
  } catch {
    return { content };
  }
}

function toGoogleGeminiPayload(messages: GeminiMessage[], options?: GeminiOptions): Record<string, unknown> {
  const systemTexts = messages
    .filter((m): m is GeminiTextMessage => "content" in m && m.role === "system")
    .map((m) => m.content);

  const toolCallNameById = new Map<string, string>();
  const contents: GoogleGeminiContent[] = [];

  for (const message of messages) {
    if (message.role === "system") {
      continue;
    }

    if (message.role === "user") {
      contents.push({ role: "user", parts: [{ text: message.content }] });
      continue;
    }

    if ((message as { role: string }).role === "assistant") {
      const assistantMessage = message as GeminiAssistantMessage;
      const parts: GoogleGeminiPart[] = [];

      if (
        typeof assistantMessage.content === "string" &&
        assistantMessage.content.trim()
      ) {
        parts.push({ text: assistantMessage.content });
      }

      const assistantToolCalls = assistantMessage.tool_calls ?? [];
      if (assistantToolCalls.length) {
        for (const toolCall of assistantToolCalls) {
          toolCallNameById.set(toolCall.id, toolCall.function.name);
          let args: Record<string, unknown> = {};
          try {
            args = JSON.parse(toolCall.function.arguments || "{}") as Record<string, unknown>;
          } catch {
            args = {};
          }
          parts.push({
            functionCall: {
              name: toolCall.function.name,
              args,
            },
          });
        }
      }

      if (parts.length) {
        contents.push({ role: "model", parts });
      }
      continue;
    }

    if (message.role === "tool") {
      const functionName = toolCallNameById.get(message.tool_call_id) ?? "unknown_tool";
      const parsedResponse = parseToolMessageContent(message.content);
      contents.push({
        role: "user",
        parts: [
          {
            functionResponse: {
              name: functionName,
              response: parsedResponse,
            },
          },
        ],
      });
    }
  }

  const payload: Record<string, unknown> = {
    contents,
  };

  if (systemTexts.length) {
    payload.systemInstruction = {
      parts: [{ text: systemTexts.join("\n\n") }],
    };
  }

  if (options?.tools?.length) {
    payload.tools = [
      {
        functionDeclarations: options.tools.map((tool) => ({
          name: tool.function.name,
          description: tool.function.description,
          parameters: tool.function.parameters,
        })),
      },
    ];

    const mode =
      options.toolChoice === "required"
        ? "ANY"
        : options.toolChoice === "none"
          ? "NONE"
          : "AUTO";
    payload.toolConfig = {
      functionCallingConfig: {
        mode,
      },
    };
  }

  return payload;
}

function fromGoogleGeminiResponse(data: GoogleGeminiResponse): GeminiCompletionResponse {
  const parts = data.candidates?.[0]?.content?.parts ?? [];
  const textParts: string[] = [];
  const toolCalls: GeminiToolCall[] = [];

  for (const part of parts) {
    if ("text" in part && typeof part.text === "string") {
      textParts.push(part.text);
    } else if ("functionCall" in part) {
      toolCalls.push({
        id: `tool_${toolCalls.length}_${Date.now()}`,
        type: "function",
        function: {
          name: part.functionCall.name,
          arguments: JSON.stringify(part.functionCall.args ?? {}),
        },
      });
    }
  }

  return {
    choices: [
      {
        message: {
          role: "assistant",
          content: textParts.length ? textParts.join("\n") : null,
          tool_calls: toolCalls.length ? toolCalls : undefined,
        },
      },
    ],
  };
}

async function fetchCompletion(
  messages: GeminiMessage[],
  options?: GeminiOptions
): Promise<GeminiCompletionResponse> {
  const key = process.env.GEMINI_API_KEY ?? process.env.GEMENI_API_KEY;
  if (!key) throw new Error("Missing GEMINI_API_KEY");

  const model = options?.model ?? "gemini-2.5-flash";
  const maxRetries = options?.maxRetries ?? 1;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const body = toGoogleGeminiPayload(messages, options);

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`,
        {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        lastError = new Error(`Gemini API error: ${res.status} ${text}`);
        if (attempt < maxRetries) continue;
        throw lastError;
      }

      const data = (await res.json()) as GoogleGeminiResponse;
      return fromGoogleGeminiResponse(data);
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
