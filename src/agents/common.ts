import { callGemini } from "../lib/gemini";

export async function callGeminiAgent(
  systemPrompt: string,
  userPrompt: string,
  options?: { model?: string; maxRetries?: number }
): Promise<string> {
  return callGemini(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    options
  );
}

export function parseJsonLoose<T = unknown>(text: string): T {
  let s = text.replace(/```json|```/gi, "").trim();
  const start = s.search(/[\{\[]/);
  if (start === -1) throw new Error("No JSON found in response");
  s = s.slice(start);
  try {
    return JSON.parse(s) as T;
  } catch {
    // continue to repair truncated JSON
  }

  let repaired = s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "");
  let inStr = false;
  let esc = false;
  const stack: string[] = [];
  for (let i = 0; i < repaired.length; i++) {
    const c = repaired[i];
    if (inStr) {
      if (esc) {
        esc = false;
        continue;
      }
      if (c === "\\") {
        esc = true;
        continue;
      }
      if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') inStr = true;
    else if (c === "{" || c === "[") stack.push(c);
    else if (c === "}" || c === "]") stack.pop();
  }
  if (inStr) repaired += '"';
  repaired = repaired.replace(/,\s*$/, "").replace(/:\s*$/, ": null");
  while (stack.length) {
    const open = stack.pop();
    repaired += open === "{" ? "}" : "]";
  }
  repaired = repaired.replace(/,(\s*[}\]])/g, "$1");
  return JSON.parse(repaired) as T;
}
