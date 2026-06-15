// Agent call stubs. Each function should call `callGemini()` in `gemini.ts` with the appropriate prompt.
// TODO: Implement remaining prompt files and add more robust output validation.

import { readFile } from "fs/promises";
import { callGemini } from "./gemini";

const promptsRoot = new URL("../../prompts/", import.meta.url);

async function loadPrompt(fileName: string) {
  return readFile(new URL(fileName, promptsRoot), "utf-8");
}

function parseJson<T>(response: string): T {
  const start = response.indexOf("{");
  const end = response.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Unable to parse JSON from Gemini response");
  }
  const jsonText = response.slice(start, end + 1);
  return JSON.parse(jsonText) as T;
}

export async function runStatInterpreter(input: any): Promise<{ diagnosis: string; keyMetric: string; recommendation: string }> {
  const systemPrompt = await loadPrompt("stat-interpreter-prompt.md");
  const response = await callGemini([
    { role: "system", content: systemPrompt },
    { role: "user", content: `Round stats:\n${JSON.stringify(input, null, 2)}` },
  ]);

  const parsed = parseJson<{ diagnosis: string; keyMetric: string; recommendation: string }>(response);
  return {
    diagnosis: parsed.diagnosis,
    keyMetric: parsed.keyMetric,
    recommendation: parsed.recommendation,
  };
}

export async function runMentalGameAnalyzer(input: any): Promise<{ mentalPattern: string; description: string; coachingNote: string }> {
  const systemPrompt = await loadPrompt("mental-game-analyzer-prompt.md");
  const response = await callGemini([
    { role: "system", content: systemPrompt },
    { role: "user", content: `Mental debrief:\n${JSON.stringify(input, null, 2)}` },
  ]);

  const parsed = parseJson<{ mentalPattern: string; description: string; coachingNote: string }>(response);
  return {
    mentalPattern: parsed.mentalPattern,
    description: parsed.description,
    coachingNote: parsed.coachingNote,
  };
}

export async function runCourseContext(courseName: string): Promise<{ courseContext: string }> {
  // TODO: implement course context via the MCP tool.
  const response = await callGemini([
    { role: "user", content: `Provide context for course: ${courseName}` },
  ]);
  return { courseContext: response };
}

export async function runPracticePlanGenerator(input: any): Promise<string> {
  // TODO: load prompts/practice-plan-generator-prompt.md and call callGemini
  const response = await callGemini([
    { role: "user", content: `Generate plan from: ${JSON.stringify(input)}` },
  ]);
  return response;
}

export async function runReviewer(plan: string): Promise<{ approved: boolean; feedback: string }> {
  // TODO: load prompts/reviewer-prompt.md and prompts/reviewer-rubric.md and call callGemini
  const response = await callGemini([
    { role: "user", content: `Review this plan: ${plan}` },
  ]);
  return { approved: true, feedback: response };
}
