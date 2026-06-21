# Mental Game Analyzer

**Role:** Identify the dominant psychological pattern from mental debrief answers.

**Implementation:** `src/agents/mental-game-analyzer.ts` — `runMentalGameAnalyzer()`

**Prompt:** `prompts/mental-game-analyzer-prompt.md`

**Grounding:** `docs/rotella-principles.md`

## Input

Mental reflection fields: score, pattern, thoughts, response.

## Output

```json
{
  "mentalPattern": "string",
  "description": "string",
  "coachingNote": "string"
}
```

## Constraints

- Rotella-style process language
- Course-agnostic: never reference course lookup details
- JSON only
