import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import { debriefSchema } from "../../lib/debrief-schema";
import { runGooderGolfPipeline } from "../../lib/pipeline";
import { consumeDailyCap } from "../../lib/daily-cap";
import { logPipelineEvent } from "../../lib/pipeline-log";

export const Route = createFileRoute("/api/plan")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const raw = await request.json();
          const parsed = debriefSchema.safeParse(raw);
          if (!parsed.success) {
            return new Response(
              JSON.stringify({ error: parsed.error.flatten().fieldErrors }),
              { status: 400, headers: { "Content-Type": "application/json" } }
            );
          }

          const cap = consumeDailyCap("plan_requests", 1);
          if (cap.wouldBlock) {
            await logPipelineEvent("daily_cap_threshold_reached", {
              ...cap,
              mode: cap.enabled ? "enforce" : "monitor",
            });
          }
          if (cap.blocked) {
            return new Response(
              JSON.stringify({
                error: "Daily request cap reached. Please try again tomorrow.",
              }),
              {
                status: 429,
                headers: { "Content-Type": "application/json" },
              }
            );
          }

          const result = await runGooderGolfPipeline(parsed.data);
          return new Response(JSON.stringify(result), {
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
