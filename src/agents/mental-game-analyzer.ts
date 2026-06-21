import rotellaPrinciples from "../../docs/rotella-principles.md?raw";
import mentalGameAnalyzerSystem from "../../prompts/mental-game-analyzer-prompt.md?raw";
import { callAnthropicAgent, parseJsonLoose } from "./common";
import { getSpecialistModel } from "../lib/provider-config";

export type MentalGameAnalyzerOutput = {
  mentalPattern: string;
  description: string;
  coachingNote: string;
};

export async function runMentalGameAnalyzer(
  input: Record<string, unknown>,
  systemPromptOverride?: string
): Promise<MentalGameAnalyzerOutput> {
  const system =
    systemPromptOverride ??
    `${mentalGameAnalyzerSystem}\n\n## Grounding — Rotella Principles\n\n${rotellaPrinciples}`;
  const user = `Mental debrief:\n${JSON.stringify(input, null, 2)}`;
  const text = await callAnthropicAgent(system, user, { model: getSpecialistModel() });
  return parseJsonLoose<MentalGameAnalyzerOutput>(text);
}
