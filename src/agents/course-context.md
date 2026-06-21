# Course Context

**Role:** Turn MCP course lookup data into strategic context for the plan generator.

**Implementation:** `src/agents/course-context.ts` — `runCourseContext()`

**Prompt:** `prompts/course-context-prompt.md`

**MCP:** `mcp/course-lookup-handler.ts` → RapidAPI golf course lookup

## Input

Course name string.

## Output

```json
{
  "courseProfile": "string",
  "strategicFocus": "string",
  "courseFound": true,
  "source": "rapidapi | fallback",
  "courseName": "string"
}
```

## Fallback

When lookup returns `source: "fallback"`, produce adaptable universal course management guidance and avoid any course-specific references.
