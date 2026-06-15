import { createFileRoute } from "@tanstack/react-router";
import { lookupGolfCourse } from "../../../mcp/course-lookup-handler";

export const Route = createFileRoute("/api/mcp-course")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const body = await request.json();
        const courseName = body.courseName;
        if (!courseName) return new Response("Missing courseName", { status: 400 });
        const data = await lookupGolfCourse(courseName);
        return new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } });
      }
    }
  }
});
