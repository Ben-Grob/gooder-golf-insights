export type AnthropicTextMessage = {
  role: "system" | "user";
  content: string;
};

export type AnthropicToolCall = {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
};

export type AnthropicAssistantMessage = {
  role: "assistant";
  content: string | null;
  tool_calls?: AnthropicToolCall[];
};

export type AnthropicToolResultMessage = {
  role: "tool";
  tool_call_id: string;
  content: string;
};

export type AnthropicMessage =
  | AnthropicTextMessage
  | AnthropicAssistantMessage
  | AnthropicToolResultMessage;

export type AnthropicToolDefinition = {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
};

export type AnthropicCompletionMessage = {
  role: string;
  content?: string | null;
  tool_calls?: AnthropicToolCall[];
};

export type AnthropicOptions = {
  model?: string;
  maxRetries?: number;
  tools?: AnthropicToolDefinition[];
  toolChoice?: "auto" | "none" | "required";
};