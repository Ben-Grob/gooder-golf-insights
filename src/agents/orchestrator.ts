import orchestratorSystem from "../../prompts/orchestrator-prompt.md?raw";
import type { CourseContextOutput } from "./course-context";
import { runCourseContext } from "./course-context";
import { callGeminiTool, type GeminiToolCallResult } from "./common";
import type { MentalGameAnalyzerOutput } from "./mental-game-analyzer";
import { runMentalGameAnalyzer } from "./mental-game-analyzer";
import { runPracticePlanGenerator } from "./practice-plan-generator";
import type { ReviewResult } from "./reviewer";
import { runReviewer } from "./reviewer";
import type { StatInterpreterOutput } from "./stat-interpreter";
import { runStatInterpreter } from "./stat-interpreter";
import type { GeminiMessage, GeminiToolDefinition } from "../lib/gemini";
import { logPipelineEvent } from "../lib/pipeline-log";

const tools: GeminiToolDefinition[] = [
  {
    type: "function",
    function: {
      name: "run_stat_interpreter",
      description: "Analyze round statistics and return a structured diagnosis.",
      parameters: {
        type: "object",
        properties: {
          input: { type: "object", description: "Full debrief form payload" },
        },
        required: ["input"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "run_mental_game_analyzer",
      description: "Analyze mental reflection answers and return a psychological pattern.",
      parameters: {
        type: "object",
        properties: {
          input: { type: "object", description: "Full debrief form payload" },
        },
        required: ["input"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "run_course_context",
      description: "Look up course rating, slope, par, and strategic context.",
      parameters: {
        type: "object",
        properties: {
          courseName: { type: "string", description: "Golf course name" },
        },
        required: ["courseName"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "run_practice_plan_generator",
      description: "Generate a markdown practice plan from diagnostic outputs.",
      parameters: {
        type: "object",
        properties: {
          input: { type: "object" },
          stat: { type: "object" },
          mental: { type: "object" },
          course: { type: "object" },
          reviewFeedback: { type: "string" },
        },
        required: ["input", "stat", "mental", "course"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "run_reviewer",
      description: "Review a draft practice plan against the quality rubric.",
      parameters: {
        type: "object",
        properties: {
          plan: { type: "string", description: "Draft practice plan markdown" },
        },
        required: ["plan"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "finish",
      description: "Mark the pipeline complete and return the final plan.",
      parameters: {
        type: "object",
        properties: {
          note: { type: "string" },
        },
      },
    },
  },
];

export type PipelineStatus =
  | "orchestrator"
  | "stat-interpreter"
  | "mental-game-analyzer"
  | "course-context"
  | "practice-plan-generator"
  | "reviewer";

export type SetPipelineStatus = (
  agent: PipelineStatus,
  state: "running" | "done"
) => void;

const TOOL_STATUS: Partial<Record<string, PipelineStatus>> = {
  run_stat_interpreter: "stat-interpreter",
  run_mental_game_analyzer: "mental-game-analyzer",
  run_course_context: "course-context",
  run_practice_plan_generator: "practice-plan-generator",
  run_reviewer: "reviewer",
};

export async function runGooderGolfPipeline(
  input: Record<string, unknown>,
  setStatus?: SetPipelineStatus
): Promise<string> {
  const courseName = (input.courseName as string) || "Unknown";

  const messages: GeminiMessage[] = [
    { role: "system", content: orchestratorSystem },
    {
      role: "user",
      content: `Start the Gooder Golf pipeline for this debrief:\n${JSON.stringify(input, null, 2)}\n\nUse the available tools to decide which agent to invoke next. Return only a single tool call at a time.`,
    },
  ];

  let stat: StatInterpreterOutput | null = null;
  let mental: MentalGameAnalyzerOutput | null = null;
  let course: CourseContextOutput | null = null;
  let draft = "";
  let review: ReviewResult | null = null;
  let revisionCount = 0;

  setStatus?.("orchestrator", "running");
  await logPipelineEvent("orchestrator_start", { courseName });

  for (let loop = 0; loop < 10; loop++) {
    const toolCall = await callGeminiTool(messages, tools);
    if (!toolCall?.name) break;

    await logPipelineEvent("orchestrator_tool_call", {
      tool: toolCall.name,
      loop,
    });

    if (toolCall.name === "finish") {
      break;
    }

    messages.push(toolCall.rawAssistantMessage);

    const statusKey = TOOL_STATUS[toolCall.name];
    if (statusKey) setStatus?.(statusKey, "running");

    let toolResult: unknown;
    try {
      toolResult = await dispatchTool(toolCall, {
        input,
        courseName,
        stat,
        mental,
        course,
        draft,
      });
    } catch (err) {
      toolResult = {
        error: err instanceof Error ? err.message : "Tool execution failed",
      };
    }

    if (toolCall.name === "run_stat_interpreter") {
      stat = toolResult as StatInterpreterOutput;
    } else if (toolCall.name === "run_mental_game_analyzer") {
      mental = toolResult as MentalGameAnalyzerOutput;
    } else if (toolCall.name === "run_course_context") {
      course = toolResult as CourseContextOutput;
    } else if (toolCall.name === "run_practice_plan_generator") {
      draft = toolResult as string;
    } else if (toolCall.name === "run_reviewer") {
      review = toolResult as ReviewResult;
    }

    if (statusKey) setStatus?.(statusKey, "done");

    messages.push({
      role: "tool",
      tool_call_id: toolCall.tool_call_id,
      content:
        typeof toolResult === "string" ? toolResult : JSON.stringify(toolResult),
    });

    if (toolCall.name === "run_reviewer" && review && !review.approved && review.feedback) {
      if (revisionCount < 1) {
        revisionCount += 1;
        messages.push({
          role: "user",
          content: `The reviewer rejected the draft. Feedback: ${review.feedback}. Please invoke run_practice_plan_generator next with reviewFeedback set to this feedback, using the existing stat, mental, and course outputs.`,
        });
      }
    }
  }

  setStatus?.("orchestrator", "done");
  await logPipelineEvent("orchestrator_finish", {
    hasDraft: Boolean(draft),
    approved: review?.approved ?? null,
  });

  if (!draft) {
    throw new Error("Pipeline completed without generating a practice plan");
  }

  return draft;
}

async function dispatchTool(
  toolCall: GeminiToolCallResult,
  ctx: {
    input: Record<string, unknown>;
    courseName: string;
    stat: StatInterpreterOutput | null;
    mental: MentalGameAnalyzerOutput | null;
    course: CourseContextOutput | null;
    draft: string;
  }
): Promise<unknown> {
  const args = toolCall.arguments;

  switch (toolCall.name) {
    case "run_stat_interpreter":
      return runStatInterpreter(
        (args.input as Record<string, unknown>) ?? ctx.input
      );
    case "run_mental_game_analyzer":
      return runMentalGameAnalyzer(
        (args.input as Record<string, unknown>) ?? ctx.input
      );
    case "run_course_context":
      return runCourseContext(
        (args.courseName as string) ?? ctx.courseName
      );
    case "run_practice_plan_generator": {
      const payload: Record<string, unknown> = {
        input: args.input ?? ctx.input,
        stat: args.stat ?? ctx.stat,
        mental: args.mental ?? ctx.mental,
        course: args.course ?? ctx.course,
      };
      if (args.reviewFeedback) payload.reviewFeedback = args.reviewFeedback;
      return runPracticePlanGenerator(payload);
    }
    case "run_reviewer":
      return runReviewer((args.plan as string) ?? ctx.draft);
    default:
      throw new Error(`Unknown orchestrator tool: ${toolCall.name}`);
  }
}
