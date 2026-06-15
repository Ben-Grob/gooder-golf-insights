import statInterpreterSystem from "../../prompts/stat-interpreter-prompt.md?raw";
import { callGeminiAgent, parseJsonLoose } from "./common";

export type StatInterpreterOutput = {
  diagnosis: string;
  keyMetric: string;
  recommendation: string;
};

export async function runStatInterpreter(
  input: Record<string, unknown>,
  systemPromptOverride?: string
): Promise<StatInterpreterOutput> {
  const system = systemPromptOverride ?? statInterpreterSystem;
  const user = `Round stats:\n${JSON.stringify(input, null, 2)}`;
  const text = await callGeminiAgent(system, user);
  return parseJsonLoose<StatInterpreterOutput>(text);
}
