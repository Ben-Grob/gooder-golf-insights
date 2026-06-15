import { readFile } from "fs/promises";
import { callGemini } from "./gemini";

const promptsRoot = new URL("../../prompts/", import.meta.url);

async function loadPrompt(promptFile: string): Promise<string> {
  return readFile(new URL(promptFile, promptsRoot), "utf-8");
}

function parseJson<T>(response: string): T {
  const start = response.indexOf("{");
  const end = response.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error(`Unable to parse JSON from Gemini response: ${response}`);
  }

  const jsonText = response.slice(start, end + 1);
  return JSON.parse(jsonText) as T;
}

async function runPrompt<T>(
  promptFile: string,
  userContent: string,
  systemPromptOverride?: string
): Promise<T> {
  const systemPrompt =
    systemPromptOverride ?? (await loadPrompt(promptFile));

  const response = await callGemini([
    { role: "system", content: systemPrompt },
    { role: "user", content: userContent },
  ]);

  return parseJson<T>(response);
}

export type StatInterpreterOutput = {
  diagnosis: string;
  keyMetric: string;
  recommendation: string;
};

export type MentalGameAnalyzerOutput = {
  mentalPattern: string;
  description: string;
  coachingNote: string;
};

export type CourseContextOutput = {
  courseProfile: string;
  strategicFocus: string;
};

export type ReviewResult = {
  approved: boolean;
  feedback: string;
};

export async function runStatInterpreter(
  input: Record<string, unknown>,
  systemPromptOverride?: string
): Promise<StatInterpreterOutput> {
  return runPrompt<StatInterpreterOutput>(
    "stat-interpreter-prompt.md",
    `Round stats:\n${JSON.stringify(input, null, 2)}`,
    systemPromptOverride
  );
}

export async function runMentalGameAnalyzer(
  input: Record<string, unknown>,
  systemPromptOverride?: string
): Promise<MentalGameAnalyzerOutput> {
  return runPrompt<MentalGameAnalyzerOutput>(
    "mental-game-analyzer-prompt.md",
    `Mental debrief:\n${JSON.stringify(input, null, 2)}`,
    systemPromptOverride
  );
}

export async function runCourseContext(
  courseName: string,
  systemPromptOverride?: string
): Promise<CourseContextOutput> {
  return runPrompt<CourseContextOutput>(
    "course-context-prompt.md",
    `Course lookup payload:\n${JSON.stringify({ courseName }, null, 2)}`,
    systemPromptOverride
  );
}

export async function runPracticePlanGenerator(
  input: Record<string, unknown>,
  systemPromptOverride?: string
): Promise<string> {
  const systemPrompt =
    systemPromptOverride ??
    (await loadPrompt("practice-plan-generator-prompt.md"));

  const response = await callGemini([
    { role: "system", content: systemPrompt },
    { role: "user", content: `Build the practice plan from this input:\n${JSON.stringify(input, null, 2)}` },
  ]);

  return response;
}

export async function runReviewer(
  plan: string,
  systemPromptOverride?: string
): Promise<ReviewResult> {
  return runPrompt<ReviewResult>(
    "reviewer-prompt.md",
    `Review this practice plan:\n${plan}`,
    systemPromptOverride
  );
}