# Evaluation 3 — Agentic Pipeline (P3)

**Date:** 2026-06-14  
**Scope:** LLM orchestrator + RapidAPI MCP + multi-agent pipeline

## Automated tests

Run: `npm test`

- [x] `mcp/course-lookup-handler.test.ts` — fallback + API mapping
- [x] `src/agents/common.test.ts` — JSON parsing
- [x] `src/agents/orchestrator.test.ts` — tool loop with mocks

## Manual E2E (requires API keys)

Set `GEMINI_API_KEY` and optionally `RAPIDAPI_KEY`, then:

1. `npm run dev`
2. Submit debrief from `test-scenarios/round-scenarios.md` (pick 3 scenarios)
3. `POST /api/mcp-course` with `{ "courseName": "Pebble Beach" }` — verify `source: "rapidapi"` when key present

## Criteria

| Check | Pass |
|-------|------|
| Plan references user mental input | |
| Plan names a mental pattern | |
| Exactly 3 drills | |
| Course context uses real rating when API key set | |
| Reviewer loop triggers at most one revision | |

## Notes

_Record scenario results and scores here after manual runs._
