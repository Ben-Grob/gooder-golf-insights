# Stat Interpreter

**Role:** Parse raw round stats and produce a structured diagnosis.

**Implementation:** `src/agents/stat-interpreter.ts` — `runStatInterpreter()`

**Prompt:** `prompts/stat-interpreter-prompt.md`

## Input

Debrief stats: score, par, fairways, GIR, putts, handicap, course name.

## Output

```json
{
  "diagnosis": "string",
  "keyMetric": "string",
  "recommendation": "string"
}
```

## Constraints

- One highest-leverage recommendation only
- JSON only, no markdown wrapper
