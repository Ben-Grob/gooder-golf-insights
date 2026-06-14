# Gooder Golf — Architecture

This document describes the target architecture for Gooder Golf Insights.
Current state notes are included where the implementation is not yet complete.
Copilot should build toward this architecture, not extend the current single-agent implementation.

---

## System Overview

```
User (browser)
    │
    ▼
Debrief Form (React)
  - Structured stat input (score, fairways, GIR, putts)
  - Mental reflection questions (4 questions)
  - Course name input (passed to MCP tool)
    │
    ▼
POST /api/plan
    │
    ▼
Pipeline Orchestrator (src/lib/pipeline.ts)
    │
    ├──────────────────────────────────┐
    ▼                                  ▼
Agent 2: Stat Interpreter       Agent 3: Mental Game Analyzer
(src/lib/agents.ts)             (src/lib/agents.ts)
Gemini API call                 Gemini API call
prompts/stat-interpreter-       prompts/mental-game-analyzer-
prompt.md                       prompt.md
    │                                  │
    └──────────┬───────────────────────┘
               │
               ▼
         Agent 4: Course Context
         (src/lib/agents.ts)
         Calls MCP tool → mcp/course-lookup-server.ts
         Returns: course rating, slope, par, difficulty context
               │
               ▼
         Agent 5: Practice Plan Generator
         (src/lib/agents.ts)
         Input: stat diagnosis + mental pattern + course context
         prompts/practice-plan-generator-prompt.md
         Output: draft practice plan (markdown)
               │
               ▼
         Agent 6: Reviewer
         (src/lib/agents.ts)
         Evaluates against prompts/reviewer-rubric.md
         Returns: { approved: boolean, feedback: string }
               │
         ┌─────┴──────┐
         │            │
    approved      rejected (max 2 iterations)
         │            │
         │            └──→ back to Agent 5 with feedback
         ▼
    Final Practice Plan
         │
         ▼
    API Response → React frontend → rendered markdown output
```

---

## Agent Definitions

Each agent is defined as a markdown file in `agents/` and called as a Gemini API request
in `src/lib/agents.ts`. Prompts live separately in `prompts/`.

### Orchestrator (`agents/orchestrator.md`)
- **Role:** Coordinator and quality gatekeeper
- **Does:** Accepts round input, calls agents 2-4, passes outputs to agent 5, runs review loop
- **Does not:** Make Gemini API calls directly or write any practice plan content
- **Implemented in:** `src/lib/pipeline.ts` as the `runGooderGolfPipeline()` function

### Agent 2 — Stat Interpreter (`agents/stat-interpreter.md`)
- **Input:** Raw round stats (score, fairways hit, GIR, putts, course par)
- **Output:** Structured diagnosis — what the numbers say about this round
- **Prompt:** `prompts/stat-interpreter-prompt.md`

### Agent 3 — Mental Game Analyzer (`agents/mental-game-analyzer.md`)
- **Input:** User's answers to the 4 mental reflection questions
- **Output:** Named psychological pattern — what was happening in the golfer's head
- **Prompt:** `prompts/mental-game-analyzer-prompt.md`
- **Grounding:** Loads `docs/rotella-principles.md` as context

### Agent 4 — Course Context (`agents/course-context.md`)
- **Input:** Course name string from user
- **Output:** Course rating, slope, par, and a brief difficulty/context note
- **Method:** Calls MCP tool in `mcp/course-lookup-server.ts`
- **Prompt:** `prompts/course-context-prompt.md`
- **Note:** If course lookup fails, agent returns a neutral fallback context

### Agent 5 — Practice Plan Generator (`agents/practice-plan-generator.md`)
- **Input:** Outputs from agents 2, 3, and 4
- **Output:** A 3-part markdown practice plan:
  1. Mental Pattern Identified
  2. Physical Focus (one thing only)
  3. This Week's Practice Plan (3 specific drills)
- **Prompt:** `prompts/practice-plan-generator-prompt.md`
- **Grounding:** Rotella philosophy injected via `docs/golf-knowledge-base.md`

### Agent 6 — Reviewer (`agents/reviewer.md`)
- **Input:** Draft practice plan from Agent 5
- **Output:** `{ approved: boolean, feedback: string }`
- **Evaluates against:** `prompts/reviewer-rubric.md`
- **Approval criteria:**
  - References something specific the user said
  - Identifies a mental pattern, not just physical advice
  - Contains at least one concrete, actionable drill
  - Recommends no more than one swing fix
  - Tone matches Rotella philosophy
- **Max iterations:** 2 — after 2 rejections, return the best available plan

---

## MCP Tool — Course Lookup

**Purpose:** Gives the pipeline real course context instead of making the model guess.

**Location:** `mcp/`

| File | Purpose |
|---|---|
| `course-lookup-server.ts` | MCP server definition, exposes the tool |
| `course-lookup-tool.ts` | Tool definition: name, description, input schema |
| `course-lookup-handler.ts` | Executes the lookup, returns structured course data |

**Tool definition:**
```typescript
{
  name: "lookup_golf_course",
  description: "Looks up a golf course by name and returns its course rating, slope, par, and a brief difficulty context note.",
  inputSchema: {
    type: "object",
    properties: {
      courseName: {
        type: "string",
        description: "The name of the golf course"
      }
    },
    required: ["courseName"]
  }
}
```

**Returns:**
```typescript
{
  courseName: string,
  courseRating: number,
  slope: number,
  par: number,
  difficultyNote: string  // e.g. "Above average difficulty. Missing fairways here is more penalizing than most courses."
}
```

---

## Data Flow (text summary)

1. User fills out the debrief form — stats + mental questions + course name
2. Form submits to `POST /api/plan`
3. Route handler calls `runGooderGolfPipeline(input)` in `src/lib/pipeline.ts`
4. Orchestrator fires agents 2, 3, and 4 (stat interpreter, mental analyzer, course context)
5. Agent 4 calls the MCP course lookup tool
6. Outputs from 2, 3, 4 are passed to agent 5 (plan generator)
7. Agent 5 produces a draft plan
8. Agent 6 (reviewer) evaluates the draft against the rubric
9. If rejected, agent 5 is called again with the reviewer's feedback (max 2 times)
10. Approved plan is returned to the route handler
11. Route handler returns the plan as a string to the frontend
12. Frontend renders the plan as markdown

---

## Current State vs Target

| Component | Current State | Target State |
|---|---|---|
| API route `plan.ts` | Single Gemini call with one system prompt | Calls `pipeline.ts` orchestrator |
| Pipeline | Does not exist | `src/lib/pipeline.ts` |
| Agents | Does not exist | `src/lib/agents.ts` with 5 agent functions |
| Prompts | Embedded in `plan.ts` | Isolated in `prompts/*.md` |
| MCP tool | Does not exist | `mcp/` folder with course lookup |
| Course context | Not used | Injected into plan generator via agent 4 |
| Review loop | Does not exist | Agent 6 evaluates and loops back to agent 5 |
| Grounding | In `src/lib/golf-knowledge-base.ts` | Loaded from `docs/` by relevant agents |

---

## File Map

```
src/
  lib/
    pipeline.ts       ← orchestrator function (BUILD THIS FIRST)
    agents.ts         ← one function per agent
    gemini.ts         ← Gemini API utility (extract from plan.ts)
    golf-knowledge-base.ts
    utils.ts
  routes/
    api/
      plan.ts         ← refactor to call pipeline.ts
      mcp-course.ts   ← exposes MCP tool as API route

agents/               ← role definitions (markdown)
prompts/              ← all LLM prompts (markdown)
mcp/                  ← MCP server and tool
docs/                 ← grounding documents
memory/               ← feedback log and dev checklist
evaluations/          ← eval run results
test-scenarios/       ← round scenarios for testing
```

---

## Build Order

Build in this sequence to avoid blocking dependencies:

1. `src/lib/gemini.ts` — extract and isolate the Gemini API call utility
2. `prompts/` — write all six prompt files before any agent code
3. `src/lib/agents.ts` — one function per agent, each calling gemini.ts
4. `mcp/` — course lookup tool and server
5. `src/lib/pipeline.ts` — orchestrator that wires agents together
6. Refactor `src/routes/api/plan.ts` — replace direct Gemini call with pipeline call
7. Test end to end with `test-scenarios/round-scenarios.md`
