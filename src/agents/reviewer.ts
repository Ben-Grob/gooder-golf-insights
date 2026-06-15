import reviewerSystem from "../../prompts/reviewer-prompt.md?raw";
import reviewerRubric from "../../prompts/reviewer-rubric.md?raw";
import { callGeminiAgent, parseJsonLoose } from "./common";

export type ReviewResult = {
  approved: boolean;
  feedback: string;
};

export async function runReviewer(
  plan: string,
  systemPromptOverride?: string
): Promise<ReviewResult> {
  const system = systemPromptOverride ?? `${reviewerSystem}\n\n${reviewerRubric}`;
  const user = `Review this practice plan:\n${plan}`;
  const text = await callGeminiAgent(system, user);
  return parseJsonLoose<ReviewResult>(text);
}
