import type { CourseLookupResult } from "./course-lookup-handler";

export const lookupGolfCourseTool = {
  name: "lookup_golf_course",
  description:
    "Looks up a golf course by name and returns its course rating, slope, par, and a brief difficulty context note.",
  inputSchema: {
    type: "object",
    properties: {
      courseName: {
        type: "string",
        description: "The name of the golf course",
      },
    },
    required: ["courseName"],
  },
};

export type { CourseLookupResult };
