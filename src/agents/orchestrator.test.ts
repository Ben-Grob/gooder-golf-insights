import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("./common", async () => {
  const actual = await vi.importActual<typeof import("./common")>("./common");
  return {
    ...actual,
    callGeminiTool: vi.fn(),
  };
});

vi.mock("./stat-interpreter", () => ({
  runStatInterpreter: vi.fn().mockResolvedValue({
    diagnosis: "Putting issue",
    keyMetric: "Putts",
    recommendation: "Lag putting",
  }),
}));

vi.mock("./mental-game-analyzer", () => ({
  runMentalGameAnalyzer: vi.fn().mockResolvedValue({
    mentalPattern: "Result focus",
    description: "Score watching",
    coachingNote: "Stay present",
  }),
}));

vi.mock("./course-context", () => ({
  runCourseContext: vi.fn().mockResolvedValue({
    courseProfile: "Moderate course",
    strategicFocus: "Fairway targets",
  }),
}));

vi.mock("./practice-plan-generator", () => ({
  runPracticePlanGenerator: vi.fn().mockResolvedValue("# Practice Plan\n\nDrill 1"),
}));

vi.mock("./reviewer", () => ({
  runReviewer: vi.fn().mockResolvedValue({ approved: true, feedback: "Looks good" }),
}));

vi.mock("../lib/pipeline-log", () => ({
  logPipelineEvent: vi.fn().mockResolvedValue(undefined),
}));

import { callGeminiTool } from "./common";
import { runGooderGolfPipeline } from "./orchestrator";

describe("runGooderGolfPipeline", () => {
  beforeEach(() => {
    vi.mocked(callGeminiTool)
      .mockResolvedValueOnce({
        name: "run_stat_interpreter",
        arguments: { input: {} },
        tool_call_id: "call_1",
        rawAssistantMessage: {
          role: "assistant",
          content: null,
          tool_calls: [
            {
              id: "call_1",
              type: "function",
              function: { name: "run_stat_interpreter", arguments: "{}" },
            },
          ],
        },
      })
      .mockResolvedValueOnce({
        name: "run_mental_game_analyzer",
        arguments: { input: {} },
        tool_call_id: "call_2",
        rawAssistantMessage: {
          role: "assistant",
          content: null,
          tool_calls: [
            {
              id: "call_2",
              type: "function",
              function: { name: "run_mental_game_analyzer", arguments: "{}" },
            },
          ],
        },
      })
      .mockResolvedValueOnce({
        name: "run_course_context",
        arguments: { courseName: "Test Course" },
        tool_call_id: "call_3",
        rawAssistantMessage: {
          role: "assistant",
          content: null,
          tool_calls: [
            {
              id: "call_3",
              type: "function",
              function: { name: "run_course_context", arguments: "{}" },
            },
          ],
        },
      })
      .mockResolvedValueOnce({
        name: "run_practice_plan_generator",
        arguments: {},
        tool_call_id: "call_4",
        rawAssistantMessage: {
          role: "assistant",
          content: null,
          tool_calls: [
            {
              id: "call_4",
              type: "function",
              function: { name: "run_practice_plan_generator", arguments: "{}" },
            },
          ],
        },
      })
      .mockResolvedValueOnce({
        name: "run_reviewer",
        arguments: { plan: "# Practice Plan" },
        tool_call_id: "call_5",
        rawAssistantMessage: {
          role: "assistant",
          content: null,
          tool_calls: [
            {
              id: "call_5",
              type: "function",
              function: { name: "run_reviewer", arguments: "{}" },
            },
          ],
        },
      })
      .mockResolvedValueOnce({
        name: "finish",
        arguments: {},
        tool_call_id: "call_6",
        rawAssistantMessage: {
          role: "assistant",
          content: null,
          tool_calls: [
            {
              id: "call_6",
              type: "function",
              function: { name: "finish", arguments: "{}" },
            },
          ],
        },
      });
  });

  it("runs tool-calling loop and returns generated plan", async () => {
    const plan = await runGooderGolfPipeline({ courseName: "Test Course" });
    expect(plan).toContain("Practice Plan");
    expect(callGeminiTool).toHaveBeenCalled();
  });
});
