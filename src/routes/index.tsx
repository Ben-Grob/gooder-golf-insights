import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Gooder Golf — Turn Your Last Round Into Your Next Breakthrough" },
      {
        name: "description",
        content:
          "Reflect on your round in 4 questions. Get an AI-built practice plan tailored to what actually went wrong today.",
      },
    ],
  }),
});

const QUESTIONS: { key: "score" | "pattern" | "thoughts" | "response"; label: string; placeholder: string }[] = [
  {
    key: "score",
    label: "How did you score relative to your normal game?",
    placeholder: "e.g. Shot 88, usually around 82. Front nine was solid, back nine fell apart.",
  },
  {
    key: "pattern",
    label: "What did your bad shots look like — and where did they happen?",
    placeholder: "e.g. Big block right with driver on tight tee shots. Chunked wedges inside 100.",
  },
  {
    key: "thoughts",
    label: "What were you thinking about on your worst shots?",
    placeholder: "e.g. Don't hit it in the water. Trying not to embarrass myself in front of the group.",
  },
  {
    key: "response",
    label: "How did you respond mentally after a bad shot?",
    placeholder: "e.g. Got frustrated, rushed the next swing, spiraled for 2–3 holes.",
  },
];

function Index() {
  const [form, setForm] = useState({ score: "", pattern: "", thoughts: "", response: "" });
  const [plan, setPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPlan(null);
    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(
          res.status === 429
            ? "Rate limited — try again in a moment."
            : res.status === 402
              ? "AI credits exhausted. Add credits in Settings → Workspace → Usage."
              : t || "Something went wrong.",
        );
      }
      const data = (await res.json()) as { plan: string };
      setPlan(data.plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setPlan(null);
    setForm({ score: "", pattern: "", thoughts: "", response: "" });
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-6 py-12 sm:py-20">
        <header className="mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium uppercase tracking-widest text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Post-Round Debrief
          </div>
          <h1 className="mt-5 font-serif text-5xl font-bold tracking-tight text-primary sm:text-6xl">
            Gooder Golf
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
            You just walked off the 18th. Before the round fades, answer four honest questions —
            and get a practice plan built for the game you actually played today.
          </p>
        </header>

        {!plan && (
          <form onSubmit={submit} className="space-y-8">
            {QUESTIONS.map((q, i) => (
              <div key={q.key} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <label className="flex items-start gap-3 text-base font-semibold text-card-foreground">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  <span className="pt-0.5">{q.label}</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={form[q.key]}
                  onChange={(e) => setForm({ ...form, [q.key]: e.target.value })}
                  placeholder={q.placeholder}
                  className="mt-4 w-full resize-none rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            ))}

            {error && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full overflow-hidden rounded-xl bg-primary px-6 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:shadow-xl hover:shadow-primary/30 disabled:opacity-60"
            >
              {loading ? "Building your plan…" : "Get My Practice Plan →"}
            </button>
          </form>
        )}

        {plan && (
          <section className="space-y-6">
            <div className="rounded-2xl border border-accent/30 bg-card p-8 shadow-lg">
              <div className="mb-4 text-xs font-medium uppercase tracking-widest text-accent-foreground/70">
                Your Practice Plan
              </div>
              <article className="plan-content space-y-4 text-foreground">
                <ReactMarkdown>{plan}</ReactMarkdown>
              </article>
            </div>
            <button
              onClick={reset}
              className="w-full rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-secondary"
            >
              Debrief another round
            </button>
          </section>
        )}

        <footer className="mt-16 text-center text-xs text-muted-foreground">
          Honesty in → better golf out.
        </footer>
      </div>
    </main>
  );
}
