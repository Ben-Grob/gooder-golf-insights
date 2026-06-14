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

const REFLECTIONS: { key: "score" | "pattern" | "thoughts" | "response"; label: string; placeholder: string }[] = [
  {
    key: "score",
    label: "How did the round feel? Did you play better or worse than the score shows?",
    placeholder: "e.g. I struck the ball well but three-putted four times. The 88 felt like a 78 that got away from me.",
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

type FormState = {
  courseName: string;
  totalScore: string;
  coursePar: string;
  handicap: string;
  fairwaysHit: string;
  fairwaysAvailable: string;
  greensInRegulation: string;
  totalPutts: string;
  score: string;
  pattern: string;
  thoughts: string;
  response: string;
};

const INITIAL_FORM: FormState = {
  courseName: "",
  totalScore: "",
  coursePar: "72",
  handicap: "",
  fairwaysHit: "",
  fairwaysAvailable: "",
  greensInRegulation: "",
  totalPutts: "",
  score: "",
  pattern: "",
  thoughts: "",
  response: "",
};

function Index() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [plan, setPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState({ usefulness: 0, willUse: null as boolean | null });
  const [evaluationSubmitted, setEvaluationSubmitted] = useState(false);

  const updateField = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

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
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const submitEvaluation = () => {
    console.log("Evaluation submitted:", {
      usefulness: evaluation.usefulness,
      willUse: evaluation.willUse,
      timestamp: new Date().toISOString(),
    });

    setEvaluationSubmitted(true);
    setTimeout(() => setEvaluationSubmitted(false), 3000);
  };

  const reset = () => {
    setPlan(null);
    setForm(INITIAL_FORM);
    setEvaluation({ usefulness: 0, willUse: null });
    setEvaluationSubmitted(false);
  };

  const statInputClass =
    "w-full rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20";

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
            You just walked off the 18th. Before the round fades, log the stats and reflect honestly —
            and get a practice plan built for the game you actually played today.
          </p>
        </header>

        {!plan && (
          <form onSubmit={submit} className="space-y-10">
            {/* Section 1 — Round Stats */}
            <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-6 text-lg font-semibold text-card-foreground">Round Stats</h2>
              <div className="space-y-5">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
                    Course name
                  </label>
                  <input
                    type="text"
                    required
                    value={form.courseName}
                    onChange={(e) => updateField("courseName", e.target.value)}
                    placeholder="e.g. Pebble Beach Golf Links"
                    className={statInputClass}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
                      Total score
                    </label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={form.totalScore}
                      onChange={(e) => updateField("totalScore", e.target.value)}
                      placeholder="88"
                      className={statInputClass}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
                      Course par
                    </label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={form.coursePar}
                      onChange={(e) => updateField("coursePar", e.target.value)}
                      placeholder="72"
                      className={statInputClass}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
                      Handicap
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={0.1}
                      value={form.handicap}
                      onChange={(e) => updateField("handicap", e.target.value)}
                      placeholder="12.4"
                      className={statInputClass}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
                      Greens in regulation
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={18}
                      required
                      value={form.greensInRegulation}
                      onChange={(e) => updateField("greensInRegulation", e.target.value)}
                      placeholder="8"
                      className={statInputClass}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
                      Fairways hit
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        required
                        value={form.fairwaysHit}
                        onChange={(e) => updateField("fairwaysHit", e.target.value)}
                        placeholder="7"
                        className={statInputClass}
                      />
                      <span className="text-sm text-muted-foreground">/</span>
                      <input
                        type="number"
                        min={1}
                        required
                        value={form.fairwaysAvailable}
                        onChange={(e) => updateField("fairwaysAvailable", e.target.value)}
                        placeholder="14"
                        className={statInputClass}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
                      Total putts
                    </label>
                    <input
                      type="number"
                      min={0}
                      required
                      value={form.totalPutts}
                      onChange={(e) => updateField("totalPutts", e.target.value)}
                      placeholder="34"
                      className={statInputClass}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2 — Mental Reflection */}
            <section className="space-y-6">
              <h2 className="text-lg font-semibold text-foreground">Mental Reflection</h2>
              {REFLECTIONS.map((q, i) => (
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
                    onChange={(e) => updateField(q.key, e.target.value)}
                    placeholder={q.placeholder}
                    className="mt-4 w-full resize-none rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                  />
                </div>
              ))}
            </section>

            {error && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full overflow-hidden rounded-xl bg-primary px-6 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:shadow-xl hover:shadow-primary/30 disabled:opacity-75"
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

            {/* Evaluation Form */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h3 className="mb-6 text-base font-semibold text-card-foreground">
                How useful was this plan?
              </h3>

              {/* Rating 1-5 */}
              <div className="mb-8">
                <label className="mb-3 block text-sm font-medium text-muted-foreground">
                  Rate the usefulness (1 = not useful, 5 = very useful)
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setEvaluation({ ...evaluation, usefulness: rating })}
                      className={`h-11 w-11 rounded-lg font-semibold transition ${
                        evaluation.usefulness === rating
                          ? "bg-primary text-primary-foreground shadow-lg"
                          : "border border-border bg-background text-muted-foreground hover:bg-secondary"
                      }`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
              </div>

              {/* Will You Use It? */}
              <div className="mb-8">
                <label className="mb-3 block text-sm font-medium text-muted-foreground">
                  Will you use this advice in your next practice session?
                </label>
                <div className="flex gap-3">
                  {[
                    { value: true, label: "Yes" },
                    { value: false, label: "No" },
                  ].map(({ value, label }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setEvaluation({ ...evaluation, willUse: value })}
                      className={`flex-1 rounded-lg border px-4 py-3 font-medium transition ${
                        evaluation.willUse === value
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-foreground hover:bg-secondary"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Evaluation */}
              <button
                type="button"
                onClick={submitEvaluation}
                disabled={evaluation.usefulness === 0 || evaluation.willUse === null}
                className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground transition hover:shadow-lg disabled:opacity-50"
              >
                Submit Feedback
              </button>

              {evaluationSubmitted && (
                <p className="mt-3 text-center text-sm text-green-600">
                  Feedback Submitted
                </p>
              )}
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
