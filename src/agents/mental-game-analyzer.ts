import mentalGameAnalyzerSystem from "../../prompts/mental-game-analyzer-prompt.md?raw";
import { callGeminiAgent, parseJsonLoose } from "./common";

export type MentalGameAnalyzerOutput = {
  mentalPattern: string;
  description: string;
  coachingNote: string;
};

export async function runMentalGameAnalyzer(
  input: Record<string, unknown>,
  systemPromptOverride?: string
): Promise<MentalGameAnalyzerOutput> {
  const system = systemPromptOverride ?? mentalGameAnalyzerSystem;
  const user = `Mental debrief:\n${JSON.stringify(input, null, 2)}`;
  const text = await callGeminiAgent(system, user);
  return parseJsonLoose<MentalGameAnalyzerOutput>(text);
}
