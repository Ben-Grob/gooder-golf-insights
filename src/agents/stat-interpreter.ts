import statInterpreterSystem from "../../prompts/stat-interpreter-prompt.md?raw";
import { callAnthropicAgent, parseJsonLoose } from "./common";
import { getSpecialistModel } from "../lib/provider-config";

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
  const text = await callAnthropicAgent(system, user, { model: getSpecialistModel() });
  return parseJsonLoose<StatInterpreterOutput>(text);
}
