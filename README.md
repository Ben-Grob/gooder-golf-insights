# Gooder Golf

## What it does
Gooder golf debriefs the round of a golfer by interviewing the physical and mental troubles and sucesses to help them improve their score.
This includes mental thoughts and a practice plan.

## Why I built it
Golf is addicting, but imporvement is non-linear. With professional instruction being expensive, this aims to give golfers an easy way of improving that is specific to thier game.

## How it works
  - Tool chain (Lovable → Gemini 3 Flash via Lovable AI Gateway)
  - User Questions: The user is prompted four questions about their round to give the model context
## Prompt Design Decisions
  - The system prompt aims to shape the voice to reflect the ideas of Bob Rotella, the author of "Golf Is Not A Game Of Perfect". The behavior of the prompt should be to reply with a practice plan and summary.
  - Advice is making too many generalizations that give misleading information.
  - I will look to change the prompt to focus on what it knows, give some ideas, and act more as a suggestive caddie rather than a confident amature.
## Grounding Strategy
  - I've read Bob Rotellas book multiple times and find it very benefitial. I think this should be the root to realistic improvement with this app because it does not preach perfection.
## Evaluation
  - Good for this project will give users a relevant and feasible practice plan that doesn't look to reinvent the wheel.
  - Scores can be given by users on a scale from 1-5, and reply with wheather or not they will use the feedback.
## Known Limitations
- This app will have limits, the app cannot see the swing of the golfer, so it is relying on the players honesty and making assumptions about how well they can hit the ball.
## What's next
- Refine prompts and output.
## Tools used to build it
- Lovable (for website building)
- Claude (for prompt building and planning)
- Gemeni (for general torubleshooting information)
