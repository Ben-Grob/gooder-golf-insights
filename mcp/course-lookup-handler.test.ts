import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { lookupGolfCourse } from "./course-lookup-handler";

describe("lookupGolfCourse", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    delete process.env.RAPIDAPI_KEY;
    delete process.env.GOLFCOURSE_API_KEY;
  });

  it("returns fallback when API key is missing", async () => {
    const result = await lookupGolfCourse("Pebble Beach");
    expect(result.source).toBe("fallback");
    expect(result.courseName).toBe("Pebble Beach");
  });

  it("returns fallback when search returns no courses", async () => {
    process.env.RAPIDAPI_KEY = "test-key";
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ([]),
    } as Response);

    const result = await lookupGolfCourse("Unknown Course XYZ");
    expect(result.source).toBe("fallback");
  });

  it("maps RapidAPI response to structured result", async () => {
    process.env.RAPIDAPI_KEY = "test-key";
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ([
          {
            name: "Test Links",
            teeBoxes: [{ tee: "Members", slope: 132, handicap: 74.2 }],
            scorecard: [
              { Hole: 1, Par: 4 },
              { Hole: 2, Par: 5 },
              { Hole: 3, Par: 4 },
              { Hole: 4, Par: 3 },
              { Hole: 5, Par: 4 },
              { Hole: 6, Par: 3 },
              { Hole: 7, Par: 4 },
              { Hole: 8, Par: 5 },
              { Hole: 9, Par: 4 },
              { Hole: 10, Par: 4 },
              { Hole: 11, Par: 4 },
              { Hole: 12, Par: 3 },
              { Hole: 13, Par: 5 },
              { Hole: 14, Par: 4 },
              { Hole: 15, Par: 5 },
              { Hole: 16, Par: 3 },
              { Hole: 17, Par: 4 },
              { Hole: 18, Par: 4 },
            ],
          },
        ]),
      } as Response);

    const result = await lookupGolfCourse("Test Links");
    expect(result.source).toBe("rapidapi");
    expect(result.courseRating).toBe(74.2);
    expect(result.slope).toBe(132);
    expect(result.par).toBe(72);
    expect(result.difficultyNote).toContain("132");
  });

  it("returns fallback on API error", async () => {
    process.env.RAPIDAPI_KEY = "test-key";
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    } as Response);

    const result = await lookupGolfCourse("Fail Course");
    expect(result.source).toBe("fallback");
  });
});
