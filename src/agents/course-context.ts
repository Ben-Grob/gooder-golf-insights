import courseContextSystem from "../../prompts/course-context-prompt.md?raw";
import { lookupGolfCourse } from "../../mcp/course-lookup-handler";
import { callGeminiAgent, parseJsonLoose } from "./common";

export type CourseContextOutput = {
  courseProfile: string;
  strategicFocus: string;
};

export async function runCourseContext(
  courseName: string,
  systemPromptOverride?: string
): Promise<CourseContextOutput> {
  const lookup = await lookupGolfCourse(courseName);
  const system = systemPromptOverride ?? courseContextSystem;
  const user = `Course lookup payload:\n${JSON.stringify(lookup, null, 2)}`;
  const text = await callGeminiAgent(system, user);
  return parseJsonLoose<CourseContextOutput>(text);
}
