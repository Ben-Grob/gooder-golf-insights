import { z } from "zod";

export const debriefSchema = z.object({
  courseName: z.string().optional(),
  totalScore: z.string().optional(),
  coursePar: z.string().optional(),
  handicap: z.string().optional(),
  fairwaysHit: z.string().optional(),
  fairwaysAvailable: z.string().optional(),
  greensInRegulation: z.string().optional(),
  totalPutts: z.string().optional(),
  score: z.string().optional(),
  pattern: z.string().optional(),
  thoughts: z.string().optional(),
  response: z.string().optional(),
});

export type DebriefInput = z.infer<typeof debriefSchema>;
