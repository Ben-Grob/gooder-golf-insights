// Pipeline orchestrator — implements the high-level flow described in architecture.md
import { runStatInterpreter, runMentalGameAnalyzer, runCourseContext, runPracticePlanGenerator, runReviewer } from "./agents";

export async function runGooderGolfPipeline(input: any): Promise<string> {
  // TODO: parallelize agents 2,3,4 when callGemini supports concurrent calls
  const stat = await runStatInterpreter(input);
  const mental = await runMentalGameAnalyzer(input);
  const course = await runCourseContext(input.courseName || "Unknown");

  // Pass combined context to practice plan generator
  let draft = await runPracticePlanGenerator({ input, stat, mental, course });

  // Reviewer loop: max 2 iterations
  let review = await runReviewer(draft);
  if (!review.approved && review.feedback) {
    // Retry once with feedback
    draft = await runPracticePlanGenerator({ input, stat, mental, course, reviewFeedback: review.feedback });
    review = await runReviewer(draft);
  }

  return draft;
}
