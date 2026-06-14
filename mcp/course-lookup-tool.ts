// MCP tool definition stub
export const lookupGolfCourseTool = {
  name: "lookup_golf_course",
  description: "Looks up a golf course by name and returns rating/slope/par and a brief difficulty note.",
  inputSchema: {
    type: "object",
    properties: {
      courseName: { type: "string", description: "The name of the golf course" },
    },
    required: ["courseName"],
  },
};
