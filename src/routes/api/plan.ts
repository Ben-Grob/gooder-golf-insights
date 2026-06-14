import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import { runGooderGolfPipeline } from "../../lib/pipeline";

type Body = {
  score?: string;
  pattern?: string;
  thoughts?: string;
  response?: string;
  courseName?: string;
};

export const Route = createFileRoute("/api/plan")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const body = (await request.json()) as Body;
          const result = await runGooderGolfPipeline(body);
          return new Response(JSON.stringify({ plan: result }), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Unknown error";
          return new Response(JSON.stringify({ error: message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
