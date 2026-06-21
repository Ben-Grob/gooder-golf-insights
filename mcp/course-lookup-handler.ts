export type CourseLookupResult = {
  courseName: string;
  courseRating: number;
  slope: number;
  par: number;
  difficultyNote: string;
  source: "rapidapi" | "fallback";
};

const API_BASE = "https://golf-course-api.p.rapidapi.com";
const API_HOST = "golf-course-api.p.rapidapi.com";

function fallbackCourse(courseName: string): CourseLookupResult {
  return {
    courseName,
    courseRating: 72.0,
    slope: 128,
    par: 72,
    difficultyNote: "Fallback: average difficulty. Course data unavailable.",
    source: "fallback",
  };
}

function difficultyNoteFromSlope(slope: number, par: number): string {
  if (slope >= 135) {
    return `High difficulty (slope ${slope}, par ${par}). Mistakes are heavily penalized; conservative targets and acceptance are essential.`;
  }
  if (slope >= 125) {
    return `Above average difficulty (slope ${slope}, par ${par}). Missing fairways and greens costs more than on typical courses.`;
  }
  if (slope <= 115) {
    return `Moderate difficulty (slope ${slope}, par ${par}). Scoring opportunities exist but routine and patience still matter.`;
  }
  return `Average difficulty (slope ${slope}, par ${par}). Standard course management applies.`;
}

type TeeBox = {
  tee?: string;
  slope?: number;
  handicap?: number;
};

type ScorecardHole = {
  Hole?: number;
  Par?: number;
};

type CourseResult = {
  _id?: string;
  name?: string;
  teeBoxes?: TeeBox[];
  scorecard?: ScorecardHole[];
};

function calcPar(scorecard: ScorecardHole[] | undefined): number {
  if (!scorecard?.length) return 72;
  return scorecard.reduce((sum, hole) => sum + (hole.Par ?? 0), 0);
}

async function apiFetch(path: string, apiKey: string): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    return await fetch(`${API_BASE}${path}`, {
      headers: {
        "Content-Type": "application/json",
        "x-rapidapi-host": API_HOST,
        "x-rapidapi-key": apiKey,
      },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function lookupGolfCourse(courseName: string): Promise<CourseLookupResult> {
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey?.trim()) {
    return fallbackCourse(courseName);
  }

  try {
    const searchRes = await apiFetch(`/search?name=${encodeURIComponent(courseName)}`, apiKey);
    if (!searchRes.ok) return fallbackCourse(courseName);

    const results = (await searchRes.json()) as CourseResult[];
    const match =
      results.find((course) => course.name?.toLowerCase() === courseName.toLowerCase()) ??
      results.find((course) => course.name?.toLowerCase().includes(courseName.toLowerCase())) ??
      results[0];
    if (!match) return fallbackCourse(courseName);

    const tee = match.teeBoxes?.[0];
    const resolvedName = match.name ?? courseName;
    const rating = tee?.handicap ?? 72;
    const slope = tee?.slope ?? 128;
    const par = calcPar(match.scorecard);

    return {
      courseName: resolvedName,
      courseRating: rating,
      slope,
      par,
      difficultyNote: difficultyNoteFromSlope(slope, par),
      source: "rapidapi",
    };
  } catch {
    return fallbackCourse(courseName);
  }
}
