# Gooder Golf

## TLDR for P3 (6/14)
- This is an extension of my project for P1
- Improvements planned to be made from P1 include addition of agentic pipeline, MCP tool, and greater UX designed for first time users.
- Currently have progress toward agentic pipeline and greater UX, missing MCP
- Planned MCP will allow for information look up on either a golf course or swing fixes/drills to reccomend

## What it does
Gooder golf debriefs the round of a golfer by interviewing the physical and mental troubles and sucesses to help them improve their score.
This includes mental thoughts and a practice plan.

## Why I built it
Golf is addicting, but imporvement is non-linear. With professional instruction being expensive, this aims to give golfers an easy way of improving that is specific to thier game.

## How it works
  - Tool chain (Lovable → Gemini 3 Flash via Lovable AI Gateway) <-- I may want to change this to use an anthorpic api
  - User Questions: The user is prompted to enter round stats and answer four questions about their roundto give the model context
    
## Prompt Design Decisions
  - The system prompt aims to shape the voice to reflect the ideas of Bob Rotella, the author of "Golf Is Not A Game Of Perfect". The behavior of the prompt should be to reply with a practice plan and summary.
  - The prompt is good at targetting what the golfer is having trouble with, is generally correct information, but has a limited catalog of drills and fixes.

## Grounding Strategy
  - I've read Bob Rotellas book multiple times and find it very benefitial. I think this should be the root to realistic improvement with this app because it does not preach perfection. Numerous quotes and main points from the book are included in a knowledge base typescript file.

## Evaluation
  - Good for this project will give users a relevant and feasible practice plan that doesn't look to reinvent the wheel. Users should also be able to use the app effectively their first time trying it.
  - Scores can be given by users on a scale from 1-5, and reply with wheather or not they will use the feedback. Currently the feeddback is not stored anywhere beyond the loaded page.
  - Second round of evaluations avereaged a score of 3.6 for responses, with all of them having at least one point to take away that would be helpful to keep in mind. 
        *Evaluations can be viewed in the evaluations folder.*
  - ^^All above evaluations are from P1. P3 Evals need to be addressed^^

## Iterations
There have been three major versions of the system prompt. The initial prompt was created by an ai prompt that had onlyy a couple of sentences for inspiration.

This was then replaced by roughly 5 main ideas from the Rotella book and a summary of what the tone should feel like.

Version three then included quotes, main ideas, a couple of inspired drills, and other generated information that fell in line with the ideaology of the book. This volume of grounding knowledge was important to not get repetitive responses.

For P3, prompts look different with the introduction of sub agents. This will allow things to be more specific.

## Known Limitations
- This app will have limits, the app cannot see the swing of the golfer, so it is relying on the players honesty and making assumptions about how well they can hit the ball. This is outside of the project scope regardless of timeline.
- Technical fixes are often too risky to suggest with a written description alone
- Responses depend on good descriptive answers from the user. Inputs are from open questions, so honesty, accuracy, and detail can tarnish the quality if left behind.  <-- This is a target of P3
- No MCP implementation yet. 

## What's next
- Allow for follow up questions to ensure a quality response. whether or not follow up questions are asked can be decided by orchestrator.
- Add an MCP that searches a knowledge base for drills/suggestions and or searches for information on a given golf course.
  
## Tools used to build it
- Lovable (for website building)
- Copilot (for specific changes and iteration)
- Claude (for prompt building and planning)
- Gemeni (for general torubleshooting information)


## Prompt design decisions and general extended Build log
This section will include chats with claude and loveable prompts

### P3 build log
Cursor was used for general questions and initial planning, coding was done by copilot and cursor.

**Claude Prompt**
"...Right now there is only one system prompt/agent. In my second project, I implemented a structure that had an orchestrator that then called separate agents gathered and put and decided where to go..."

**Result**
Here's how I'd map the agents to jobs that Gooder Golf genuinely needs:
Orchestrator — receives the structured round input, decides the order of operations, passes outputs between agents, makes the refinement loop decision
Agent 1: Stat Interpreter — takes raw stats (fairways, GIR, putts, score vs handicap) and produces a structured diagnosis of what the numbers say. No advice yet, just pattern recognition.
Agent 2: Mental Game Analyzer — takes the user's answers to the mental questions and identifies the psychological pattern at play. Draws on the Rotella grounding doc.
Agent 3: Course Context Agent — this is your MCP tool. Takes the course name, fetches rating/slope/par, and contextualizes the stat interpretation. Did they miss 8 fairways on a tight tree-lined course vs an open resort course? Different diagnosis.
Agent 4: Practice Plan Generator — receives the outputs from agents 1, 2, and 3 and writes the actual practice plan. This agent has the clearest, most specific input of any in the chain because the prior agents have already done the diagnostic work.
Agent 5: Reviewer/Refiner — evaluates the practice plan against a rubric (is it specific, is it Rotella-aligned, does it address what the stats actually showed, is it actionable) and either approves it or sends it back to Agent 4 with specific feedback. This is your refinement loop.



**Cursor prompt**
implement the agentic pipeline structure from @/Users/bengrob/GenerativeAiCourse/prospect-pal-gr into @/Users/bengrob/gooder-golf-insights . The biggest thing I notice is the lack of an agents folder with all of the typescript files for each agent. Use the agents that are already in @/Users/bengrob/gooder-golf-insights, with the methods used in @/Users/bengrob/GenerativeAiCourse/prospect-pal-gr .

**Result**
Added agent scripts, informed me of innaccuracy in architecture document that was holding back all of my other instructions from creating a truly agentic pipeline. Was able to follow up and fix this.



### P1 build log
After first draft Copilot was used to navigate and understand the codebase and find where to make changes. Changes were then often made by using copilot to create a base, and then manually refine the details. Manual changes included a minor style change, removing poor ideas and drills from the knowledge base, adding quotes to the knowledge base, and other refinements that addressed problems found in evaluation.


**Loveable Prompt**
Build a simple single-page web app called Gooder Golf. The user is a golfer who just finished a round. The app asks them 4 questions about their round: (1) How did you score relative to your normal game? (2) What did your bad shots look like — any pattern? (3) What were you thinking about on your worst shots? (4) How did you respond mentally after a bad shot? There is a submit button. After submitting, the app shows a practice plan generated by AI. No login, no database, no history — just the form and the result.


### misc claude prompts

*Is there a way to [call an ai api] without the claude api? In other words, could I have a version of this that is free for me?*

Yes — a few options, but there are real tradeoffs to understand.

**Option 1: Use Lovable's built-in AI integration (recommended)**
Lovable has a native "add AI features" option that can use OpenAI or other providers. However, all API calls cost money somewhere — you'd just be choosing *which* provider's free tier to use.

**Option 2: Groq (best free option)**
Groq offers a genuinely free tier with fast inference on open-source models like Llama 3. No credit card required, generous limits. You'd tell Lovable to call Groq's API instead of Anthropic's. The output quality is slightly lower than Claude but very usable for this use case.

**Option 3: Google Gemini API**
Google gives $0/month free tier with Gemini 1.5 Flash — quite capable, free up to a generous limit. Easy to swap in.

**Option 4: OpenAI free trial credit**
New OpenAI accounts get a small amount of free credit. Enough to demo the project but it expires.

---

**My honest recommendation:**

The Anthropic API is genuinely cheap for a class project at this scale. A full session of 4 questions + a practice plan output costs roughly **$0.002 — less than a penny**. Even 500 test runs would cost about a dollar.

If cost is the concern, **load $5 of Anthropic credit** and it will last you through the entire semester across all three projects.

If you want truly free with no card required, go with **Groq**. Want me to adjust the roadmap for Groq instead?



How should the rotella-grounding doc be formatted?

10:38 AM
Short answer: plain markdown, structured by principle, designed to be pasted directly into a system prompt.

Here's why that format matters — the grounding doc has two jobs. First, it lives in your GitHub repo as an artifact the professor can read. Second, you paste its contents into your Lovable system prompt so the model actually uses it. If it's formatted cleanly in markdown, it does both jobs without reformatting.

Structure it like this:

## Rotella Grounding — Golf is Not a Game of Perfect

### Core Principles

#### Train it and trust it
[2-3 sentences in your own words capturing the principle, plus one specific quote or paraphrase from the book if you remember one]

#### Stay out of your own way
[same format]

... and so on for each principle

...

Add a short "voice and tone" section at the bottom. Something like: "Rotella writes like a calm, confident mentor — never mechanical, never negative, focused on what the golfer can control." This is what actually shapes the model's output voice.







