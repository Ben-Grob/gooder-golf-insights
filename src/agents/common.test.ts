import { describe, expect, it } from "vitest";
import { parseJsonLoose } from "./common";

describe("parseJsonLoose", () => {
  it("parses raw JSON", () => {
    expect(parseJsonLoose('{"approved": true}')).toEqual({ approved: true });
  });

  it("strips markdown fences", () => {
    expect(parseJsonLoose('```json\n{"a": 1}\n```')).toEqual({ a: 1 });
  });

  it("extracts JSON from surrounding text", () => {
    const result = parseJsonLoose('Here is the result: {"mentalPattern": "Rushing"}');
    expect(result).toEqual({ mentalPattern: "Rushing" });
  });
});
