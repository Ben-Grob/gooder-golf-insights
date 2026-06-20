# Gooder Golf — Architecture

This document describes the architecture for Gooder Golf Insights: a multi-agent pipeline
with an LLM orchestrator that routes work to specialist agents via Gemini tool-calling.

---

## System Overview

```
User (browser)
    │
    ▼
Debrief Form (React)
  - Structured stat input (score, fairways, GIR, putts)
  - Mental reflection questions (4 questions)
  - Course name input
    │
    ▼
POST /api/plan
    │
    ▼
Orchestrator Agent (src/agents/orchestrator.ts)
Gemini tool-calling loop
prompts/orchestrator-prompt.md
    │
    ├── tool: run_stat_interpreter ──► Agent 2 (Gemini)
    ├── tool: run_mental_game_analyzer ──► Agent 3 (Gemini)
    ├── tool: run_course_context ──► Agent 4 (Gemini + MCP lookup)
    ├── tool: run_practice_plan_generator ──► Agent 5 (Gemini)
    ├── tool: run_reviewer ──► Agent 6 (Gemini)
    └── tool: finish
    │
    ▼
Final Practice Plan (markdown)
    │
    ▼
API Response → React frontend → rendered markdown output
```

The orchestrator LLM decides which tool to invoke next based on prior tool results.
A hard-coded nudge after reviewer rejection ensures at most one revision pass.

---

## Agent Definitions

Each worker agent has a role spec in `src/agents/*.md`, a runtime prompt in `prompts/`,
and an implementation in `src/agents/*.ts`.

### Orchestrator (`src/agents/orchestrator.md`)
- **Role:** LLM coordinator and quality gatekeeper
- **Does:** Runs a Gemini tool-calling loop; dispatches to agents 2–6; manages review revision nudge; returns final plan
- **Does not:** Write practice plan content directly
- **Prompt:** `prompts/orchestrator-prompt.md`
- **Implemented in:** `src/agents/orchestrator.ts` as `runGooderGolfPipeline()`
- **Re-exported from:** `src/lib/pipeline.ts`

### Agent 2 — Stat Interpreter (`src/agents/stat-interpreter.md`)
- **Input:** Raw round stats from debrief form
- **Output:** `{ diagnosis, keyMetric, recommendation }`
- **Prompt:** `prompts/stat-interpreter-prompt.md`

### Agent 3 — Mental Game Analyzer (`src/agents/mental-game-analyzer.md`)
- **Input:** Mental reflection answers
- **Output:** `{ mentalPattern, description, coachingNote }`
- **Prompt:** `prompts/mental-game-analyzer-prompt.md`
- **Grounding:** `docs/rotella-principles.md`

### Agent 4 — Course Context (`src/agents/course-context.md`)
- **Input:** Course name string
- **Output:** `{ courseProfile, strategicFocus }`
- **Method:** Calls `lookupGolfCourse()` in `mcp/course-lookup-handler.ts` (GolfCourseAPI)
- **Prompt:** `prompts/course-context-prompt.md`
- **Note:** Handler never throws; returns fallback on API failure

### Agent 5 — Practice Plan Generator (`src/agents/practice-plan-generator.md`)
- **Input:** `{ input, stat, mental, course [, reviewFeedback] }`
- **Output:** 3-part markdown practice plan
- **Prompt:** `prompts/practice-plan-generator-prompt.md`
- **Grounding:** `docs/golf-knowledge-base.md`

### Agent 6 — Reviewer (`src/agents/reviewer.md`)
- **Input:** Draft plan markdown
- **Output:** `{ approved: boolean, feedback: string }`
- **Evaluates against:** `prompts/reviewer-rubric.md` (loaded with system prompt)
- **Max revisions:** 1 (orchestrator nudge after first rejection)

---

## MCP Tool — Course Lookup

**Purpose:** Real course rating, slope, and par from GolfCourseAPI instead of model guesswork.

**Location:** `mcp/`

| File | Purpose |
|---|---|
| `course-lookup-handler.ts` | Search + details via GolfCourseAPI; fallback on error |
| `course-lookup-tool.ts` | Tool schema for MCP registration |
| `course-lookup-server.ts` | Registers tool with MCP runtime |

**Environment:** `GOLFCOURSE_API_KEY` (header: `Authorization: Key …`)

**Returns:**
```typescript
{
  courseName: string;
  courseRating: number;
  slope: number;
  par: number;
  difficultyNote: string;
  source: "golfcourseapi" | "fallback";
}
```

Course context agent calls the handler directly at runtime. `POST /api/mcp-course` exposes the same handler for testing.

---

## Data Flow

1. User submits debrief form → `POST /api/plan`
2. Route validates body (Zod) and calls `runGooderGolfPipeline(input)`
3. Orchestrator LLM receives debrief JSON and available tools
4. LLM invokes worker tools in sequence (typically stat → mental → course → plan → review)
5. Agent 4 handler calls GolfCourseAPI search + course details
6. On reviewer rejection, orchestrator nudges LLM to regenerate plan with `reviewFeedback`
7. LLM calls `finish`; orchestrator returns stored draft plan
8. Frontend renders markdown

---

## Current State vs Target

| Component | Status |
|---|---|
| API route `plan.ts` | Done — calls pipeline |
| LLM orchestrator | Done — tool-calling loop in `src/agents/orchestrator.ts` |
| Worker agents | Done — `src/agents/*.ts` |
| Prompts | Done — `prompts/*.md` |
| MCP course lookup | Done — GolfCourseAPI + fallback |
| Grounding docs | Done — injected in mental + plan agents |
| Review loop | Done — max 1 revision via orchestrator nudge |
| Feedback log | Done — `memory/feedback-log.md` + server logging |
| Tests | Done — vitest unit tests + manual E2E scenarios |

---

## File Map

```
src/
  agents/
    common.ts              ← callGeminiAgent, callGeminiTool, parseJsonLoose
    orchestrator.ts        ← LLM tool-calling orchestrator
    stat-interpreter.ts
    mental-game-analyzer.ts
    course-context.ts
    practice-plan-generator.ts
    reviewer.ts
    *.md                   ← role definitions (design specs)
  lib/
    pipeline.ts            ← re-exports runGooderGolfPipeline
    gemini.ts              ← Gemini API + tool-calling
    pipeline-log.ts        ← server-side feedback logging
    debrief-schema.ts      ← Zod schema for API input
  routes/
    api/
      plan.ts
      mcp-course.ts

prompts/                   ← LLM prompts
mcp/                       ← course lookup handler + MCP stubs
docs/                      ← grounding documents
memory/                    ← feedback log + dev checklist
evaluations/
test-scenarios/
```

---

## Build Order

1. `src/lib/gemini.ts` — Gemini utility + tool-calling support
2. `src/agents/common.ts` — agent helpers + `callGeminiTool`
3. Worker agents in `src/agents/*.ts`
4. `mcp/course-lookup-handler.ts` — GolfCourseAPI integration
5. `src/agents/orchestrator.ts` — LLM orchestrator
6. Grounding injection, Zod validation, logging, tests
