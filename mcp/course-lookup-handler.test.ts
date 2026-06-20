import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { lookupGolfCourse } from "./course-lookup-handler";

describe("lookupGolfCourse", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    delete process.env.GOLFCOURSE_API_KEY;
  });

  it("returns fallback when API key is missing", async () => {
    const result = await lookupGolfCourse("Pebble Beach");
    expect(result.source).toBe("fallback");
    expect(result.courseName).toBe("Pebble Beach");
  });

  it("returns fallback when search returns no courses", async () => {
    process.env.GOLFCOURSE_API_KEY = "test-key";
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ courses: [] }),
    } as Response);

    const result = await lookupGolfCourse("Unknown Course XYZ");
    expect(result.source).toBe("fallback");
  });

  it("maps GolfCourseAPI response to structured result", async () => {
    process.env.GOLFCOURSE_API_KEY = "test-key";
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ courses: [{ id: 42, course_name: "Test Links" }] }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          course_name: "Test Links",
          tees: {
            male: [
              {
                tee_name: "Blue",
                course_rating: 74.2,
                slope_rating: 132,
                par_total: 72,
                total_yards: 6800,
              },
            ],
          },
        }),
      } as Response);

    const result = await lookupGolfCourse("Test Links");
    expect(result.source).toBe("golfcourseapi");
    expect(result.courseRating).toBe(74.2);
    expect(result.slope).toBe(132);
    expect(result.par).toBe(72);
    expect(result.difficultyNote).toContain("132");
  });

  it("returns fallback on API error", async () => {
    process.env.GOLFCOURSE_API_KEY = "test-key";
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    } as Response);

    const result = await lookupGolfCourse("Fail Course");
    expect(result.source).toBe("fallback");
  });
});
