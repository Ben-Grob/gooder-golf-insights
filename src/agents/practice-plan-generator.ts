import golfKnowledgeBase from "../../docs/golf-knowledge-base.md?raw";
import practicePlanGeneratorSystem from "../../prompts/practice-plan-generator-prompt.md?raw";
import { callGeminiAgent } from "./common";

export async function runPracticePlanGenerator(
  input: Record<string, unknown>,
  systemPromptOverride?: string
): Promise<string> {
  const system =
    systemPromptOverride ??
    `${practicePlanGeneratorSystem}\n\n## Grounding — Golf Knowledge Base\n\n${golfKnowledgeBase}`;

  let user = `Build the practice plan from this input:\n${JSON.stringify(input, null, 2)}`;
  if (input.reviewFeedback) {
    user += `\n\nIMPORTANT: The reviewer rejected the previous draft. Address this feedback:\n${input.reviewFeedback}`;
  }

  return callGeminiAgent(system, user);
}
