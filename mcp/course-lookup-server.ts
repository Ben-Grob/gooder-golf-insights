// MCP server stub for course lookup tool
import { lookupGolfCourse } from "./course-lookup-handler";

export function registerCourseLookupTool(server: any) {
  // TODO: register the MCP tool with the server/runtime
  server.registerTool?.("lookup_golf_course", async (input: any) => {
    return lookupGolfCourse(input.courseName);
  });
}
