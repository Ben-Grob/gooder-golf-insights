import golfKnowledgeBase from "../../docs/golf-knowledge-base.md?raw";
import practicePlanGeneratorSystem from "../../prompts/practice-plan-generator-prompt.md?raw";
import { callGeminiAgent } from "./common";
import { getSpecialistModel } from "../lib/provider-config";

export async function runPracticePlanGenerator(
  input: Record<string, unknown>,
  systemPromptOverride?: string
): Promise<string> {
  const system =
    systemPromptOverride ??
    `${practicePlanGeneratorSystem}\n\n## Grounding — Golf Knowledge Base\n\n${golfKnowledgeBase}`;

  let user = `Build the practice plan from this input:\n${JSON.stringify(input, null, 2)}`;
  const course = input.course as { source?: string; courseFound?: boolean; courseName?: string } | undefined;
  if (course?.source === "fallback" || course?.courseFound === false) {
    user +=
      "\n\nIMPORTANT: The course lookup failed. Do not mention the course name, slope, rating, par, tee boxes, or any course-specific hazards. Keep the plan based on the golfer's round and universal course management only.";
  }
  if (input.reviewFeedback) {
    user += `\n\nIMPORTANT: The reviewer rejected the previous draft. Address this feedback:\n${input.reviewFeedback}`;
  }

  return callGeminiAgent(system, user, { model: getSpecialistModel() });
}
