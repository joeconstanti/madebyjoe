---
name: grill
description: "Interview the user to test a plan, idea or decision, resolve assumptions and reach shared understanding. Use for /grill, grill me or stress-test my thinking; no implementation or document edits."
---

# grill

Read `.agents/jstack/rules.md` first and apply it.

1. **Read before asking.** Establish the idea and intended outcome from the
   conversation and relevant project files. Find facts in the available sources;
   reserve questions for user choices, missing context and conflicting evidence.
   This is a decision interview, not kickoff scaffolding or artifact review.
2. **Map the decisions.** Track settled choices, open choices and dependencies.
   Start with the goal, audience, success criteria and boundaries where unclear.
   Ask downstream questions only after their prerequisite choices are settled.
3. **Ask a short round.** Select up to three independent, high-impact questions
   whose prerequisites are known. Number them and give a recommended answer
   with its reason and meaningful alternatives. Use the harness's question tool
   when available; otherwise ask in chat. Wait for answers before continuing
   dependent work. Do not treat silence as agreement.
4. **Test the answers.** Use concrete cases, failure paths and counterexamples
   to expose contradictions, vague terms and costly assumptions. Compare claims
   with source evidence; distinguish current behavior from desired behavior.
   Respect deliberate constraints. Do not repeat a resolved question unless new
   evidence changes it. Update the decision map after each answer.
5. **Close or pause honestly.** Continue until the material branches are settled,
   the user stops, or unavailable evidence blocks progress. Summarize the agreed
   outcome, constraints, decisions and remaining questions. Ask whether this
   matches the user's understanding; do not claim agreement before the answer.
   A paused interview keeps its unanswered questions open. Implementation needs
   a separate request. Keep the interview in chat unless documentation is requested.

For the version that records terms and decisions during the interview, use
`grill-with-docs`. The documentation skill applies these interview steps with
its own recording rules.

Adapted from Matt Pocock's grilling workflow (MIT); see [LICENSE](LICENSE).
