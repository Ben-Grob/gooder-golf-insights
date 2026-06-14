// Agent call stubs. Each function should call `callGemini()` in `gemini.ts` with the appropriate prompt.
// TODO: Implement each agent with real prompts from prompts/ folder

import { callGemini } from "./gemini";

export async function runStatInterpreter(input: any): Promise<{ diagnosis: string }> {
  // TODO: load prompts/stat-interpreter-prompt.md and call callGemini
  const response = await callGemini([
    { role: "user", content: `Analyze these stats: ${JSON.stringify(input)}` },
  ]);
  return { diagnosis: response };
}

export async function runMentalGameAnalyzer(input: any): Promise<{ mentalPattern: string }> {
  // TODO: load prompts/mental-game-analyzer-prompt.md and call callGemini
  const response = await callGemini([
    { role: "user", content: `Analyze mental pattern: ${JSON.stringify(input)}` },
  ]);
  return { mentalPattern: response };
}

export async function runCourseContext(courseName: string): Promise<{ courseContext: string }> {
  // TODO: call mcp/course-lookup-handler.ts and/or callGemini with course context
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
