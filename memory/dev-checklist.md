# Dev Checklist — Agentic Pipeline (Gooder Golf)

Phased checklist for the LLM orchestrator pipeline + RapidAPI MCP integration.
See [architecture.md](../architecture.md) for the target design.

---

## Phase 1 — Foundation and docs alignment

- [x] Rewrite `architecture.md` (LLM orchestrator, tool-calling, file map)
- [x] Update `copilot-instructions.md` (paths, orchestrator rules)
- [x] Complete `prompts/orchestrator-prompt.md`
- [x] Fill role specs in `src/agents/*.md`
- [x] Replace this checklist

## Phase 2 — Anthropic tool-calling infrastructure

- [x] Extend `src/lib/anthropic-types.ts` — multi-turn messages, `tools`, `callAnthropicCompletion`
- [x] Add `callAnthropicTool()` to `src/agents/common.ts`


## Phase 3 — LLM orchestrator

- [x] Load orchestrator prompt via `?raw`
- [x] Define inline tool schemas in `src/agents/orchestrator.ts`
- [x] Implement tool-calling loop (max 10 iterations)
- [x] Reviewer rejection nudge (max 1 revision)
- [x] `setStatus` callback for UI
- [x] `src/lib/pipeline.ts` re-exports orchestrator

## Phase 4 — RapidAPI MCP course lookup

- [x] `RAPIDAPI_KEY` documented in README
- [x] Typed `CourseLookupResult` in `mcp/course-lookup-handler.ts`
- [x] Search via RapidAPI course endpoint
- [x] Rule-based `difficultyNote` from slope
- [x] Fallback on error (never throws)
- [x] Finalize `mcp/course-lookup-tool.ts` and `course-lookup-server.ts`
- [x] `POST /api/mcp-course` for manual testing

## Phase 5 — Worker agent polish

- [x] Mental analyzer — inject `docs/rotella-principles.md`
- [x] Plan generator — inject `docs/golf-knowledge-base.md`
- [x] Plan generator — honor `reviewFeedback`
- [x] Zod validation in `src/routes/api/plan.ts` (`src/lib/debrief-schema.ts`)

## Phase 6 — Observability and UX

- [x] `memory/feedback-log.md` template
- [x] Server logging via `src/lib/pipeline-log.ts`
- [x] UI pipeline stage indicator during loading (`src/routes/index.tsx`)

## Phase 7 — Test and validate

- [x] Unit tests — `lookupGolfCourse`, `parseJsonLoose`, orchestrator dispatch
- [ ] Manual E2E — run `test-scenarios/round-scenarios.md` (requires `ANTHROPIC_API_KEY`)
- [ ] MCP smoke test — `POST /api/mcp-course` with real `RAPIDAPI_KEY`
- [x] Evaluation template — `evaluations/eval3-agentic-pipeline.md`

---

## Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `ANTHROPIC_API_KEY` | Yes | Direct Anthropic API |
| `RAPIDAPI_KEY` | No | RapidAPI course lookup; omit for fallback data |

---

## Out of scope (deferred)

- Standalone MCP server deployment for external clients
- Drills/knowledge-base MCP
- Supabase persistence
- Parallel diagnostic batching inside orchestrator loop
