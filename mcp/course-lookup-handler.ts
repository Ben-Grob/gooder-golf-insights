export type CourseLookupResult = {
  courseName: string;
  courseRating: number;
  slope: number;
  par: number;
  difficultyNote: string;
  source: "golfcourseapi" | "fallback";
};

const API_BASE = "https://api.golfcourseapi.com/v1";

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

type SearchCourse = {
  id?: number;
  course_name?: string;
  club_name?: string;
};

type SearchResponse = {
  courses?: SearchCourse[];
};

type TeeBox = {
  tee_name?: string;
  course_rating?: number;
  slope_rating?: number;
  par_total?: number;
  total_yards?: number;
};

type CourseDetail = {
  course_name?: string;
  club_name?: string;
  tees?: {
    male?: TeeBox[];
    female?: TeeBox[];
  };
};

function pickTee(tees: TeeBox[] | undefined): TeeBox | undefined {
  if (!tees?.length) return undefined;
  return [...tees].sort((a, b) => (b.total_yards ?? 0) - (a.total_yards ?? 0))[0];
}

async function apiFetch(path: string, apiKey: string): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    return await fetch(`${API_BASE}${path}`, {
      headers: { Authorization: `Key ${apiKey}` },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function lookupGolfCourse(courseName: string): Promise<CourseLookupResult> {
  const apiKey = process.env.GOLFCOURSE_API_KEY;
  if (!apiKey?.trim()) {
    return fallbackCourse(courseName);
  }

  try {
    const searchRes = await apiFetch(
      `/search?search_query=${encodeURIComponent(courseName)}`,
      apiKey
    );
    if (!searchRes.ok) return fallbackCourse(courseName);

    const searchData = (await searchRes.json()) as SearchResponse;
    const match = searchData.courses?.[0];
    if (!match?.id) return fallbackCourse(courseName);

    const detailRes = await apiFetch(`/courses/${match.id}`, apiKey);
    if (!detailRes.ok) return fallbackCourse(courseName);

    const detail = (await detailRes.json()) as CourseDetail;
    const tee = pickTee(detail.tees?.male) ?? pickTee(detail.tees?.female);
    const resolvedName =
      detail.course_name ?? match.course_name ?? match.club_name ?? courseName;
    const rating = tee?.course_rating ?? 72;
    const slope = tee?.slope_rating ?? 128;
    const par = tee?.par_total ?? 72;

    return {
      courseName: resolvedName,
      courseRating: rating,
      slope,
      par,
      difficultyNote: difficultyNoteFromSlope(slope, par),
      source: "golfcourseapi",
    };
  } catch {
    return fallbackCourse(courseName);
  }
}
