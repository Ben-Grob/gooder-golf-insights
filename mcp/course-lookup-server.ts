import { lookupGolfCourse, type CourseLookupResult } from "./course-lookup-handler";
import { lookupGolfCourseTool } from "./course-lookup-tool";

type McpServer = {
  registerTool?: (
    name: string,
    handler: (input: { courseName: string }) => Promise<CourseLookupResult>
  ) => void;
};

export function registerCourseLookupTool(server: McpServer): void {
  server.registerTool?.(lookupGolfCourseTool.name, async (input) => {
    return lookupGolfCourse(input.courseName);
  });
}

export { lookupGolfCourseTool };
