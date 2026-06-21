# Gooder Golf — Proposed Project Structure (V2)

Based on the Ledger build principles: isolated prompt library, agent-per-role architecture,
shared context files, skills as recipes, and a feedback log for persistent memory.

---

## Top-level

- .env
- .gitignore
- .lovable
- .prettierignore
- .prettierrc
- bun.lock
- bunfig.toml
- components.json
- eslint.config.js
- package.json
- vite.config.ts
- wrangler.jsonc
- README.md                        ← build log lives here
- architecture.md                  ← NEW: system architecture overview every agent reads
- claude.md                        ← NEW: master rules for Claude models (tech stack, code style, UX primitives)
- copilot-instructions.md          ← NEW: master rules for Copilot models (same content, different caller)

---

## agents/                         ← NEW: one markdown file per agent, defines role + mandate

- orchestrator.md                  ← receives round input, delegates, manages review loop
- stat-interpreter.md              ← reads raw stats, returns structured diagnosis
- mental-game-analyzer.md          ← reads mental questions, returns psychological pattern
- course-context.md                ← calls MCP tool, returns course rating/slope/context
- practice-plan-generator.md       ← receives outputs from agents 1-3, writes the plan
- reviewer.md                      ← evaluates plan against rubric, returns approved or feedback

---

## prompts/                        ← NEW: isolated prompt library, every LLM call lives here

- orchestrator-prompt.md
- stat-interpreter-prompt.md
- mental-game-analyzer-prompt.md
- course-context-prompt.md
- practice-plan-generator-prompt.md
- reviewer-prompt.md
- reviewer-rubric.md               ← what "good" looks like, used by reviewer agent

---

## mcp/                            ← NEW: MCP tool definition and server

- course-lookup-server.ts          ← MCP server exposing the course info tool
- course-lookup-tool.ts            ← tool definition: name, description, input schema
- course-lookup-handler.ts         ← executes the lookup, returns rating/slope/par

---

## docs/                           ← existing, expanded

- golf-knowledge-base.md           ← existing Rotella grounding doc
- rotella-principles.md            ← NEW: expanded Rotella quotes and voice guidance
- domain-primer.md                 ← NEW: golf stat definitions, handicap math, common miss patterns

---

## src/

- components/
- hooks/
- integrations/
- lib/
- router.tsx
- routes/
- routeTree.gen.ts
- server.ts
- start.ts
- styles.css

### src/lib/                       ← existing, expanded

- pipeline.ts                      ← NEW: orchestrator function + agent runner loop
- agents.ts                        ← NEW: individual agent call functions
- anthropic.ts                     ← NEW: Anthropic API utility
- anthropic-types.ts               ← NEW: shared message/tool types used by the Anthropic adapter
- golf-knowledge-base.ts           ← existing
- error-capture.ts                 ← existing
- error-page.ts                    ← existing
- utils.ts                         ← existing

### src/routes/api/                ← existing, refactored

- plan.ts                          ← refactored to call pipeline.ts instead of a direct provider call
- mcp-course.ts                    ← NEW: API route that exposes the MCP course lookup tool

---

## memory/                         ← NEW: persistent feedback log (Ledger principle)

- feedback-log.md                  ← every prompt you send gets logged here for long-term context
- dev-checklist.md                 ← what's done, what's next, updated as you build

---

## evaluations/                    ← existing, expanded

- eval1.md                         ← existing
- eval2.md                         ← existing
- eval3.md                         ← NEW: post-pipeline evaluation run
- eval-rubric.md                   ← NEW: scoring criteria extracted into standalone file

---

## test-scenarios/                 ← existing

- round-scenarios.md               ← existing test cases

---

## supabase/                       ← existing (keep as is for now)

- config.toml

---

## public/

- favicon.ico

---

## Key Changes from V1 and Why

| What changed | Why |
|---|---|
| Added `agents/` folder | Each agent is a markdown file with a role, mindset, and mandate. Prevents the AI from reinventing agent behavior each session. |
| Added `prompts/` folder | Ledger principle: isolate the prompt library so a human can audit every prompt the LLM sees. Currently your prompts are buried in code. |
| Added `mcp/` folder | Separates the MCP tool definition, server, and handler cleanly. Makes the tool easy to find and audit. |
| Added `claude.md` and `copilot-instructions.md` | Shared context every model reads regardless of which tool calls it. Prevents agents from doing unaligned things. |
| Added `architecture.md` | Every agent and every new Copilot session can orient itself without reading the whole codebase. |
| Added `memory/feedback-log.md` | AI workspace memory is transient. Logging prompts and feedback to disk gives the system persistent memory across sessions. |
| Refactored `src/lib/` | Extracts the pipeline logic and Anthropic API call into their own files. `plan.ts` currently does too much. |
| Expanded `docs/` | Separates Rotella grounding into a domain primer the agents can load on demand. |

---

## What to Leave Alone

- `src/components/ui/` — Lovable-generated UI components, don't touch unless you need to
- `supabase/` — keep for now, may be useful if round history is added later
- `public/` — nothing to change here
