import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import { runGooderGolfPipeline } from "../../lib/pipeline";

type Body = {
  courseName?: string;
  totalScore?: string;
  coursePar?: string;
  handicap?: string;
  fairwaysHit?: string;
  fairwaysAvailable?: string;
  greensInRegulation?: string;
  totalPutts?: string;
  score?: string;
  pattern?: string;
  thoughts?: string;
  response?: string;
};

export const Route = createFileRoute("/api/plan")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const body = (await request.json()) as Body;
          const plan = await runGooderGolfPipeline(body);
          return new Response(JSON.stringify({ plan }), {
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
