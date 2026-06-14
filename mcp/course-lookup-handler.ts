// MCP course lookup handler stub
export async function lookupGolfCourse(courseName: string) {
  // TODO: implement real lookup (external API, DB, or static list)
  return {
    courseName,
    courseRating: 72.0,
    slope: 128,
    par: 72,
    difficultyNote: "Fallback: average difficulty."
  };
}
