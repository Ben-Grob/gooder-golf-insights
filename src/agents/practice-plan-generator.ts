import practicePlanGeneratorSystem from "../../prompts/practice-plan-generator-prompt.md?raw";
import { callGeminiAgent } from "./common";

export async function runPracticePlanGenerator(
  input: Record<string, unknown>,
  systemPromptOverride?: string
): Promise<string> {
  const system = systemPromptOverride ?? practicePlanGeneratorSystem;
  const user = `Build the practice plan from this input:\n${JSON.stringify(input, null, 2)}`;
  return callGeminiAgent(system, user);
}
