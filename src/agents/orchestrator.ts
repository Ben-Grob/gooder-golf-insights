import { runCourseContext } from "./course-context";
import { runMentalGameAnalyzer } from "./mental-game-analyzer";
import { runPracticePlanGenerator } from "./practice-plan-generator";
import { runReviewer } from "./reviewer";
import { runStatInterpreter } from "./stat-interpreter";

export type PipelineStatus =
  | "stat-interpreter"
  | "mental-game-analyzer"
  | "course-context"
  | "practice-plan-generator"
  | "reviewer";

export type SetPipelineStatus = (
  agent: PipelineStatus,
  state: "running" | "done"
) => void;

export async function runGooderGolfPipeline(
  input: Record<string, unknown>,
  setStatus?: SetPipelineStatus
): Promise<string> {
  const courseName = (input.courseName as string) || "Unknown";

  setStatus?.("stat-interpreter", "running");
  setStatus?.("mental-game-analyzer", "running");
  setStatus?.("course-context", "running");

  const [stat, mental, course] = await Promise.all([
    runStatInterpreter(input),
    runMentalGameAnalyzer(input),
    runCourseContext(courseName),
  ]);

  setStatus?.("stat-interpreter", "done");
  setStatus?.("mental-game-analyzer", "done");
  setStatus?.("course-context", "done");

  setStatus?.("practice-plan-generator", "running");
  let draft = await runPracticePlanGenerator({ input, stat, mental, course });
  setStatus?.("practice-plan-generator", "done");

  setStatus?.("reviewer", "running");
  let review = await runReviewer(draft);
  if (!review.approved && review.feedback) {
    setStatus?.("reviewer", "done");
    setStatus?.("practice-plan-generator", "running");
    draft = await runPracticePlanGenerator({
      input,
      stat,
      mental,
      course,
      reviewFeedback: review.feedback,
    });
    setStatus?.("practice-plan-generator", "done");
    setStatus?.("reviewer", "running");
    review = await runReviewer(draft);
  }
  setStatus?.("reviewer", "done");

  return draft;
}
