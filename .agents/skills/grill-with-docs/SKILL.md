---
name: grill-with-docs
description: "Interview the user about a plan or decision while recording agreed domain terms and significant decisions in project docs. Use for /grill-with-docs or a grilling session with glossary and ADR updates."
---

# grill-with-docs

Read `.agents/jstack/rules.md` first and apply it.

Read the sibling `grill/SKILL.md` and apply its interview steps. Apply the rules
below before the first round and throughout the interview. This invocation
requests local documentation edits as choices are settled, not implementation.

1. **Discover the document layout.** Read project guidance, domain-doc instructions
   such as `docs/agents/domain.md`, glossary/context maps, relevant `GLOSSARY.md`
   or `CONTEXT.md` files and existing decision records. Follow the owning package's
   conventions. Keep existing names and paths; do not rename legacy context files.
   No setup command or issue tracker is required. If no convention exists, state
   the defaults: root `GLOSSARY.md` and `docs/adr/`. Ask only if ownership or a
   conflicting layout makes the destination unclear. Create files only when an
   agreed term or decision gives them useful content.
2. **Resolve language in the interview.** Flag overloaded terms and differences
   between the user's words, existing definitions and code. Propose precise terms
   and test their boundaries with concrete examples. Let the user settle the
   meaning; do not silently replace an established definition.
3. **Record agreed terms as they settle.** Add a short definition and useful
   distinctions to the applicable glossary. Keep implementation choices and task
   status out of it. Preserve unrelated content and link related terms when useful.
   Leave disputed definitions as open questions in chat, not accepted glossary text.
4. **Record consequential choices selectively.** Write an ADR when a settled
   choice has meaningful reversal cost, real alternatives and a rationale that a
   future reader would otherwise miss. Follow existing format and numbering;
   otherwise use a unique numbered title with status, context, decision,
   alternatives and consequences. Record the tradeoff, not a conversation transcript.
   Do not overwrite or mark an existing accepted ADR superseded without the user's
   agreement. Unresolved proposals must not be presented as accepted decisions.
5. **Keep the record usable.** Read back each scoped edit and check it against
   the user's answer and existing links. At closure, report changed paths, agreed
   choices and unresolved questions, and ask for confirmation of shared understanding.
   Do not create a second task tracker, change agent guidance, configure accounts
   or publish documents as part of this workflow.

Adapted from Matt Pocock's grilling, domain-modeling and setup workflows (MIT);
see [LICENSE](LICENSE).
