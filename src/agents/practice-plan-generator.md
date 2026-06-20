# Practice Plan Generator

**Role:** Synthesize diagnostic outputs into a personalized markdown practice plan.

**Implementation:** `src/agents/practice-plan-generator.ts` — `runPracticePlanGenerator()`

**Prompt:** `prompts/practice-plan-generator-prompt.md`

**Grounding:** `docs/golf-knowledge-base.md`

## Input

```json
{
  "input": { "..." },
  "stat": { "..." },
  "mental": { "..." },
  "course": { "..." },
  "reviewFeedback": "optional string from reviewer"
}
```

## Output

Markdown with three sections:

1. Mental Pattern Identified
2. Physical Focus (one thing only)
3. This Week's Practice Plan (exactly 3 drills)

## Constraints

- Honor `reviewFeedback` when present
- Rotella tone; one swing fix maximum
