# Copilot Instructions — Gooder Golf Insights

Read this file before every session. These are the master rules for this repository.
Every suggestion, refactor, and new file must respect what is written here.

---

## What This App Does

Gooder Golf is a post-round golf debrief assistant. A golfer submits structured stats and
mental reflections from their round. The app runs those inputs through a multi-agent AI
pipeline powered by the Gemini API and returns a personalized practice plan grounded in
Dr. Bob Rotella's mental game philosophy from *Golf is Not a Game of Perfect*.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | TypeScript (strict) |
| UI Framework | React 19 |
| Framework | @tanstack/react-start |
| Routing | @tanstack/react-router |
| Data fetching | @tanstack/react-query |
| Bundler | Vite |
| Runtime / Package Manager | Bun |
| Deployment | Cloudflare Workers via wrangler.jsonc |
| Styling | Tailwind CSS v4 |
| Forms | react-hook-form + zod |
| UI Primitives | Radix UI |
| AI Provider | Google Gemini API (gemini-1.5-flash) |
| Database | Supabase (present but not yet primary storage) |
| Markdown rendering | react-markdown |

---

## Code Style

- TypeScript strict mode. No `any`. Type everything explicitly.
- Functional React components only. No class components.
- Zod for all input validation — never trust raw user input.
- File names: `kebab-case.ts` for utilities and lib files, `PascalCase.tsx` for components.
- All Tailwind classes via `clsx` and `tailwind-merge` through the `cn()` utility in `src/lib/utils.ts`.
- No inline styles. No raw `style={{}}` props.
- Keep components small and single-purpose. If a component exceeds ~100 lines, split it.
- Prefer named exports over default exports except for route components.
- Backend logic lives in `src/lib/`. Route handlers in `src/routes/api/` should be thin — they call lib functions, not implement logic.

---

## Architecture Overview

The core of the app is a multi-agent pipeline. See `architecture.md` for the full diagram.
The pipeline lives in `src/lib/pipeline.ts`. The API route `src/routes/api/plan.ts` calls
the pipeline and returns the result. Do not add business logic to route handlers.

Agent prompts live in `prompts/`. Agent role definitions live in `agents/`.
Never hardcode a prompt string inside a `.ts` file — prompts belong in `prompts/`.

The MCP course lookup tool lives in `mcp/`. It is called by the course-context agent
during the pipeline run. The MCP server is defined in `mcp/course-lookup-server.ts`.

---

## Agent Architecture (summary)

There are six agents. The orchestrator manages the flow. The five sub-agents each do one job.

1. **Orchestrator** — delegates to sub-agents, manages the review loop, surfaces final output
2. **Stat Interpreter** — reads raw round stats, returns structured diagnosis
3. **Mental Game Analyzer** — reads mental reflection questions, returns psychological pattern
4. **Course Context** — calls MCP tool with course name, returns rating/slope/context
5. **Practice Plan Generator** — receives outputs from agents 2-4, writes the practice plan
6. **Reviewer** — evaluates the plan against `prompts/reviewer-rubric.md`, returns approved or feedback with reasons

The review loop: Orchestrator → Agents 2+3+4 (parallel) → Agent 5 → Agent 6 → if rejected, back to Agent 5 with feedback. Max 2 iterations.

---

## UX Primitives

The app has two primary views:
- **Debrief Form** — structured stat and mental question input
- **Practice Plan Output** — rendered markdown plan returned from the pipeline

Every user interaction should be: input → submit → result. No multi-page flows unless
explicitly planned. Keep it fast and focused.

---

## What Not to Do

- Do not write prompts inside TypeScript files. Put them in `prompts/`.
- Do not add dependencies without checking if something in the existing stack already handles it.
- Do not refactor working Lovable-generated UI components unless directly asked.
- Do not add logging that exposes the Gemini API key or user input to the client.
- Do not create new routes without a corresponding entry in the router.
- Do not let the orchestrator write code or make Gemini API calls directly — it delegates only.
- Do not exceed 2 review loop iterations in the pipeline.

---

## Where Things Live

| What | Where |
|---|---|
| Pipeline orchestrator | `src/lib/pipeline.ts` |
| Individual agent functions | `src/lib/agents.ts` |
| Gemini API utility | `src/lib/gemini.ts` |
| Agent role definitions | `agents/*.md` |
| Agent prompts | `prompts/*.md` |
| Reviewer rubric | `prompts/reviewer-rubric.md` |
| MCP tool | `mcp/` |
| Golf domain knowledge | `docs/golf-knowledge-base.md` |
| Rotella grounding | `docs/rotella-principles.md` |
| Feedback log | `memory/feedback-log.md` |
| Dev checklist | `memory/dev-checklist.md` |
| Evaluation results | `evaluations/` |
| Test scenarios | `test-scenarios/round-scenarios.md` |

---

## Shared Context Note

This file is read by GitHub Copilot models. If you are a Claude model being called
from within Copilot, also read `architecture.md` and the relevant agent file in `agents/`
before proceeding. Do not read `claude.md` — it does not exist in this repo.
