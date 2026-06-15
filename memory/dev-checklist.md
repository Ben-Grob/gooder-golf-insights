# Dev Checklist — Gooder Golf Pipeline Revamp

This checklist maps tasks needed to move from the current single-call implementation to the multi-agent pipeline described in `architecture.md`. Tasks are grouped by the build order in `architecture.md`. Items marked ✅ are already present in the repo.

---

## Build Order — Step 1: `src/lib/gemini.ts` (Gemini API utility)

- [ ] Create `src/lib/gemini.ts` — extract and isolate the Gemini/AI API call into a single utility used by all agents.
- [ ] Extract the current Gemini call and headers from `src/routes/api/plan.ts` into `gemini.ts`.
- [ ] Add typed request/response wrappers, retries, and error handling.

## Step 2: `prompts/` (write all prompt files)

- [x] Create `prompts/` directory.
- [x] Add `prompts/orchestrator-prompt.md` (orchestrator guidance and constraints).
- [x] Add `prompts/stat-interpreter-prompt.md`.
- [x] Add `prompts/mental-game-analyzer-prompt.md`.
- [x] Add `prompts/course-context-prompt.md`.
- [x] Add `prompts/practice-plan-generator-prompt.md` (ground with `docs/golf-knowledge-base.md`).
- [x] Add `prompts/reviewer-prompt.md` and `prompts/reviewer-rubric.md`.

## Step 3: `src/lib/agents.ts` (one function per agent)

- [ ] Create `/src/agents/` directory with role-definition markdown files:
  - `agents/orchestrator.md` (spec)
  - `agents/stat-interpreter.md`
  - `agents/mental-game-analyzer.md`
  - `agents/course-context.md`
  - `agents/practice-plan-generator.md`
  - `agents/reviewer.md`

- [ ] Implement `src/lib/agents.ts` with exported functions:
  - `runStatInterpreter(input)`
  - `runMentalGameAnalyzer(input)`
  - `runCourseContext(input)`
  - `runPracticePlanGenerator(input)`
  - `runReviewer(input)`

- [ ] Each agent function should call `gemini.ts` and accept an optional `systemPrompt` override.

## Step 4: `mcp/` (course lookup tool)

- [ ] Implement `mcp/course-lookup-tool.ts` (tool definition schema for MCP).
- [ ] Implement `mcp/course-lookup-handler.ts` (actual lookup logic; fallback when lookup fails).
- [ ] Implement `mcp/course-lookup-server.ts` (expose the MCP tool/server).
- [ ] Add route `src/routes/api/mcp-course.ts` to expose the tool via an internal API (optional for local testing).

## Step 5: `src/lib/pipeline.ts` (orchestrator)

- [ ] Create `src/lib/pipeline.ts` — `runGooderGolfPipeline(input)` orchestrator.
- [ ] Orchestrator should call the three parallel agents (stat interpreter, mental analyzer, course context), await results, then call the plan generator.
- [ ] Implement the reviewer loop (max 2 iterations). If reviewer rejects, call plan generator with reviewer feedback.
- [ ] Ensure pipeline logs each prompt + response to `memory/feedback-log.md`.

## Step 6: Refactor `src/routes/api/plan.ts`

- [ ] Refactor `src/routes/api/plan.ts` to call `runGooderGolfPipeline()` instead of making a direct Gemini call.
- [x] `src/routes/api/plan.ts` exists in the repo (current single-call implementation). ✅

## Step 7: Test and Validate

- [ ] Create a test harness and mock Gemini responses for reliable E2E tests.
- [ ] Run end-to-end tests using `test-scenarios/round-scenarios.md`.
- [x] `test-scenarios/round-scenarios.md` exists. ✅

---

## Infrastructure / Supporting Items (create as part of the build)

- [ ] Create `memory/` directory.
- [ ] Add `memory/feedback-log.md` — append-only log of prompts/responses for persistence.
- [x] Create `memory/dev-checklist.md` (this file). In-progress. ✅
- [x] `docs/golf-knowledge-base.md` exists and will be used to ground recommendations. ✅
- [x] `architecture.md` exists and guides the implementation. ✅
- [x] `copilot-instructions.md` exists and must be respected. ✅
- [x] `src/lib/golf-knowledge-base.ts` exists. ✅
- [x] `src/lib/utils.ts` exists. ✅

---

## Notes & Next Steps

1. I created this checklist and tracked it in the repo at `memory/dev-checklist.md`.
2. I also registered the same tasks in the workspace TODO tracker so we can mark progress and update statuses as we implement each item.

Would you like me to start implementing Step 1 (`src/lib/gemini.ts`) now? If yes, I will extract the current Gemini call from `src/routes/api/plan.ts` and draft `src/lib/gemini.ts` with types and error handling.