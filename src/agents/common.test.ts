import { beforeEach, describe, expect, it, vi } from "vitest";

const { callAnthropicMock, callAnthropicCompletionMock } = vi.hoisted(() => ({
  callAnthropicMock: vi.fn(),
  callAnthropicCompletionMock: vi.fn(),
}));

vi.mock("../lib/anthropic", () => ({
  callAnthropic: callAnthropicMock,
  callAnthropicCompletion: callAnthropicCompletionMock,
}));

vi.mock("../lib/provider-config", () => ({
  getOrchestratorModel: () => "claude-sonnet-test",
  getSpecialistModel: () => "claude-haiku-test",
}));

import { callGeminiAgent, callGeminiTool, parseJsonLoose } from "./common";

describe("parseJsonLoose", () => {
  it("parses raw JSON", () => {
    expect(parseJsonLoose('{"approved": true}')).toEqual({ approved: true });
  });

  it("strips markdown fences", () => {
    expect(parseJsonLoose('```json\n{"a": 1}\n```')).toEqual({ a: 1 });
  });

  it("extracts JSON from surrounding text", () => {
    const result = parseJsonLoose('Here is the result: {"mentalPattern": "Rushing"}');
    expect(result).toEqual({ mentalPattern: "Rushing" });
  });
});

describe("provider routing in common adapter", () => {
  beforeEach(() => {
    callAnthropicMock.mockReset();
    callAnthropicCompletionMock.mockReset();
  });

  it("uses specialist model for agent text calls", async () => {
    callAnthropicMock.mockResolvedValueOnce('{"ok":true}');

    await callGeminiAgent("system", "user");

    expect(callAnthropicMock).toHaveBeenCalledWith(
      [
        { role: "system", content: "system" },
        { role: "user", content: "user" },
      ],
      expect.objectContaining({ model: "claude-haiku-test" })
    );
  });

  it("uses orchestrator model for tool calls", async () => {
    callAnthropicCompletionMock.mockResolvedValueOnce({
      role: "assistant",
      content: null,
      tool_calls: [
        {
          id: "tool_1",
          type: "function",
          function: {
            name: "run_stat_interpreter",
            arguments: "{}",
          },
        },
      ],
    });

    await callGeminiTool(
      [{ role: "user", content: "run" }],
      [
        {
          type: "function",
          function: {
            name: "run_stat_interpreter",
            description: "run stats",
            parameters: { type: "object", properties: {} },
          },
        },
      ]
    );

    expect(callAnthropicCompletionMock).toHaveBeenCalledWith(
      [{ role: "user", content: "run" }],
      expect.objectContaining({ model: "claude-sonnet-test", toolChoice: "required" })
    );
  });
});
