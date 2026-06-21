// @ts-nocheck
import type {
  AnthropicCompletionMessage,
  AnthropicMessage,
  AnthropicOptions,
  AnthropicToolCall,
  AnthropicToolDefinition,
} from "./anthropic-types";
import { getAnthropicApiKey } from "./provider-config";

type AnthropicTextBlock = {
  type: "text";
  text: string;
};

type AnthropicToolUseBlock = {
  type: "tool_use";
  id: string;
  name: string;
  input: Record<string, unknown>;
};

type AnthropicToolResultBlock = {
  type: "tool_result";
  tool_use_id: string;
  content: string;
};

type AnthropicMessageBlock =
  | AnthropicTextBlock
  | AnthropicToolUseBlock
  | AnthropicToolResultBlock;

type AnthropicApiMessage = {
  role: "user" | "assistant";
  content: string | AnthropicMessageBlock[];
};

type AnthropicResponse = {
  content?: AnthropicMessageBlock[];
};

function parseToolArguments(raw: string): Record<string, unknown> {
  try {
    return JSON.parse(raw || "{}") as Record<string, unknown>;
  } catch {
    return {};
  }
}

function toAnthropicMessages(messages: AnthropicMessage[]): {
  system: string;
  messages: AnthropicApiMessage[];
} {
  const systemParts: string[] = [];
  const anthropicMessages: AnthropicApiMessage[] = [];
  const normalizedMessages = messages as Array<{
    role: string;
    content?: string | null;
    tool_calls?: Array<{
      id: string;
      function: { name: string; arguments: string };
    }>;
    tool_call_id?: string;
  }>;

  for (const rawMessage of normalizedMessages) {
    const message = rawMessage as any;

    if (message.role === "system") {
      systemParts.push(message.content);
      continue;
    }

    if (message.role === "user") {
      anthropicMessages.push({ role: "user", content: message.content });
      continue;
    }

    if (message.role === "assistant") {
      const blocks: AnthropicMessageBlock[] = [];

      if (typeof message.content === "string" && message.content.trim()) {
        blocks.push({ type: "text", text: message.content });
      }

      const assistantToolCalls = message.tool_calls ?? [];
      for (const toolCall of assistantToolCalls) {
        blocks.push({
          type: "tool_use",
          id: toolCall.id,
          name: toolCall.function.name,
          input: parseToolArguments(toolCall.function.arguments),
        });
      }

      anthropicMessages.push({
        role: "assistant",
        content: blocks.length ? blocks : "",
      });
      continue;
    }

    if (message.role === "tool") {
      const toolUseId = message.tool_call_id ?? "unknown_tool_call";
      const toolContent = message.content ?? "";
      anthropicMessages.push({
        role: "user",
        content: [
          {
            type: "tool_result",
            tool_use_id: toolUseId,
            content: toolContent,
          },
        ],
      });
    }
  }

  return {
    system: systemParts.join("\n\n").trim(),
    messages: anthropicMessages,
  };
}

function mapToolChoice(value: AnthropicOptions["toolChoice"]): { type: "auto" | "any" } | undefined {
  if (value === "required") return { type: "any" };
  if (value === "none") return undefined;
  return { type: "auto" };
}

function fromAnthropicResponse(data: AnthropicResponse): AnthropicCompletionMessage {
  const content = data.content ?? [];
  const textParts: string[] = [];
  const toolCalls: AnthropicToolCall[] = [];

  for (const block of content) {
    if (block.type === "text") {
      textParts.push(block.text);
      continue;
    }
    if (block.type === "tool_use") {
      toolCalls.push({
        id: block.id,
        type: "function",
        function: {
          name: block.name,
          arguments: JSON.stringify(block.input ?? {}),
        },
      });
    }
  }

  return {
    role: "assistant",
    content: textParts.length ? textParts.join("\n") : null,
    tool_calls: toolCalls.length ? toolCalls : undefined,
  };
}

async function fetchAnthropicCompletion(
  messages: AnthropicMessage[],
  options?: AnthropicOptions
): Promise<AnthropicCompletionMessage> {
  const key = getAnthropicApiKey();

  const model = options?.model;
  if (!model) throw new Error("Missing Anthropic model");

  const maxRetries = options?.maxRetries ?? 1;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const converted = toAnthropicMessages(messages);
      const body: Record<string, unknown> = {
        model,
        max_tokens: 1200,
        messages: converted.messages,
      };

      if (converted.system) {
        body.system = converted.system;
      }

      const activeTools: AnthropicToolDefinition[] = options?.toolChoice === "none" ? [] : options?.tools ?? [];
      if (activeTools.length) {
        body.tools = activeTools.map((tool) => ({
          name: tool.function.name,
          description: tool.function.description,
          input_schema: tool.function.parameters,
        }));
        const toolChoice = mapToolChoice(options?.toolChoice);
        if (toolChoice) body.tool_choice = toolChoice;
      }

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": key,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const text = await response.text();
        if (response.status === 401) {
          lastError = new Error(
            `Anthropic authentication failed. Check ANTHROPIC_API_KEY for typos, revoked keys, and copy/paste errors. Raw response: ${text}`
          );
        } else {
          lastError = new Error(`Anthropic API error: ${response.status} ${text}`);
        }
        if (attempt < maxRetries) continue;
        throw lastError;
      }

      const data = (await response.json()) as AnthropicResponse;
      return fromAnthropicResponse(data);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 100));
        continue;
      }
    }
  }

  throw lastError ?? new Error("Unknown error calling Anthropic");
}

export async function callAnthropic(
  messages: AnthropicMessage[],
  options?: AnthropicOptions
): Promise<string> {
  const message = await fetchAnthropicCompletion(messages, options);
  const content = message.content;
  if (!content || typeof content !== "string") {
    throw new Error("No content in Anthropic response");
  }
  return content;
}

export async function callAnthropicCompletion(
  messages: AnthropicMessage[],
  options?: AnthropicOptions
): Promise<AnthropicCompletionMessage> {
  return fetchAnthropicCompletion(messages, options);
}