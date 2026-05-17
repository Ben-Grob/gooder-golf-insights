import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";

type Body = {
  score?: string;
  pattern?: string;
  thoughts?: string;
  response?: string;
};

export const Route = createFileRoute("/api/plan")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const body = (await request.json()) as Body;
        const prompt = `A golfer just finished a round. Build them a focused, practical practice plan based on these reflections.

1. Score vs normal game: ${body.score || "(none)"}
2. Bad shot patterns / where they happened: ${body.pattern || "(none)"}
3. Thoughts on worst shots: ${body.thoughts || "(none)"}
4. Mental response after a bad shot: ${body.response || "(none)"}

Write the plan in clean markdown. Include:
- A 1-2 sentence diagnosis of the likely root cause (technical AND mental).
- A "This Week's Practice" section with 3-5 specific drills (name, what to do, sets/reps, why it targets the issue).
- A "Course Management Tweaks" section: 2-3 concrete on-course decisions to try next round.
- A "Mental Reset Routine" section: a short, repeatable routine for after a bad shot.
Be direct, specific, and motivating. No filler.`;

        const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Lovable-API-Key": key,
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              { role: "system", content: "You are a sharp, encouraging golf coach who blends swing mechanics, course management, and sports psychology. Keep advice concrete and actionable." },
              { role: "user", content: prompt },
            ],
          }),
        });

        if (!res.ok) {
          const text = await res.text();
          return new Response(text || "AI request failed", { status: res.status });
        }
        const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
        const content = data.choices?.[0]?.message?.content ?? "No plan generated.";
        return new Response(JSON.stringify({ plan: content }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
