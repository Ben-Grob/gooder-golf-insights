import courseContextSystem from "../../prompts/course-context-prompt.md?raw";
import { lookupGolfCourse } from "../../mcp/course-lookup-handler";
import { callAnthropicAgent, parseJsonLoose } from "./common";
import { getSpecialistModel } from "../lib/provider-config";

type CourseLookupSource = "rapidapi" | "fallback";

export type CourseContextOutput = {
  courseProfile: string;
  strategicFocus: string;
  courseFound: boolean;
  source: CourseLookupSource;
  courseName: string;
};

type CourseContextAgentOutput = {
  courseProfile: string;
  strategicFocus: string;
};

const FALLBACK_CONTEXT: CourseContextAgentOutput = {
  courseProfile:
    "Course data was unavailable. Use universal course management: pick sensible targets, commit to the shot, and stay patient when conditions are unfamiliar.",
  strategicFocus:
    "Keep the plan simple and adaptable. Trust your routine, choose conservative targets, and avoid relying on course-specific assumptions.",
};

export async function runCourseContext(
  courseName: string,
  systemPromptOverride?: string
): Promise<CourseContextOutput> {
  const lookup = await lookupGolfCourse(courseName);
  if (lookup.source === "fallback") {
    return {
      ...FALLBACK_CONTEXT,
      courseFound: false,
      source: lookup.source,
      courseName: lookup.courseName,
    };
  }

  const system = systemPromptOverride ?? courseContextSystem;
  const user = `Course lookup payload:\n${JSON.stringify(lookup, null, 2)}`;
  const text = await callAnthropicAgent(system, user, { model: getSpecialistModel() });
  const parsed = parseJsonLoose<CourseContextAgentOutput>(text);

  return {
    ...parsed,
    courseFound: true,
    source: lookup.source,
    courseName: lookup.courseName,
  };
}
