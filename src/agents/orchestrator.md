# Orchestrator

**Role:** LLM coordinator and quality gatekeeper.

**Implementation:** `src/agents/orchestrator.ts` — `runGooderGolfPipeline()`

**Prompt:** `prompts/orchestrator-prompt.md`

## Mandate

- Receive debrief form input from the API route
- Run an Anthropic tool-calling loop (max 10 iterations)
- Dispatch to worker agents via tools; never write plan content directly
- Nudge one revision when reviewer rejects a draft
- Return final markdown practice plan when `finish` is called or loop ends

## Tools exposed to the LLM

- `run_stat_interpreter`
- `run_mental_game_analyzer`
- `run_course_context`
- `run_practice_plan_generator`
- `run_reviewer`
- `finish`

## Inputs

Full debrief object: stats, mental reflections, `courseName`.

## Outputs

Markdown practice plan string (same contract as `POST /api/plan`).

## Constraints

- One tool call per orchestrator turn
- Max 1 plan revision after reviewer rejection
- Does not call course lookup APIs directly — delegates to course context agent
