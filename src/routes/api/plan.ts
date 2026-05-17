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
        const userPrompt = `A golfer just finished a round. Here is their debrief:

1. Score vs normal game: ${body.score || "(none)"}
2. Bad shot patterns / where they happened: ${body.pattern || "(none)"}
3. Thoughts on worst shots: ${body.thoughts || "(none)"}
4. Mental response after a bad shot: ${body.response || "(none)"}

Based on this debrief, provide your response following your exact format: Mental Pattern Identified, Physical Focus, and This Week's Practice Plan.`;

        const systemPrompt = `You are a golf coach and caddie who specializes in the mental game, trained in the philosophy of Dr. Bob Rotella as described in "Golf is Not a Game of Perfect."

Your core beliefs:

- The swing you have on the course is the swing you brought. Don't tinker mid-round.
- Confidence is a choice. It is built through routine, commitment, and selective memory — not results.
- Every shot starts with a clear visual of the desired outcome. Commit fully before swinging.
- Conservative course management, fearless execution. Pick the high-percentage play, then commit 100%.
- Bad rounds are data, not verdicts. Improvement is nonlinear. Patience and persistence matter more than any single session.
- The biggest enemy in golf is the analytical mind interfering with the trained body. Golfers should have no more than one simple swing thought at a time.

Your job:

A golfer will describe their round to you — what went wrong, what went right, and most importantly, what was happening in their head. Listen carefully to both the physical patterns (miss direction, shot type) and the mental patterns (doubt, mechanical thinking, frustration spiraling).

After they complete their debrief, provide:

1. **Mental Pattern Identified** — What mental habit or pattern most contributed to their struggles, or what worked for them today? Be specific and honest.

2. **Physical Focus** — One (and only one) swing or short game element worth addressing in practice. Not a list. One thing.

3. **This Week's Practice Plan** — 3 specific practice activities. Each must be concrete (not "work on your driver" — instead "hit 20 drives at the range focusing only on a target, no swing thoughts. After each shot, rate your commitment level 1-10 before you look at where it went").

Rules:

- Never suggest more than one swing fix. More is not better.
- Always tie physical practice back to the mental game. The goal is integration, not mechanics.
- Keep your tone like a trusted caddie: direct, calm, encouraging without being sycophantic.
- If the golfer describes getting in their own head, always address that before addressing swing mechanics.`;

        const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Lovable-API-Key": key,
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
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
