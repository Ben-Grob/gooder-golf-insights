# Reviewer

**Role:** Final quality gate on draft practice plans.

**Implementation:** `src/agents/reviewer.ts` — `runReviewer()`

**Prompt:** `prompts/reviewer-prompt.md` + `prompts/reviewer-rubric.md`

## Input

Draft practice plan (markdown string).

## Output

```json
{
  "approved": true,
  "feedback": "string"
}
```

## Pass criteria

- References specific user input
- Names a mental pattern
- Exactly one physical focus and three drills
- Rotella tone; at most one swing fix
