## What it does

`grill` stress-tests a plan, a decision or an idea before anyone acts on it, and writes down what it settles. It maps the subject as a **design tree**, where every decision branches into the decisions that hang off it, and interviews you branch by branch until nothing is left silently assumed.

It doesn't ask one question at a time, and it doesn't ask everything at once. Each **round** asks the whole **frontier**: every decision whose prerequisites are already settled, and nothing else. Your answers settle decisions, the frontier moves outward, and the next round asks what that unblocked. Thirteen questions typically land in about three rounds.

It is **stateful**. A term lands in `CONTEXT.md` the moment it resolves, and a hard-to-reverse decision lands as an ADR under `docs/adr/`, so the session leaves files behind rather than living only in your head.

## When to reach for it

Type `/grill`, or the agent reaches for it when you ask to be grilled or to stress-test a plan. Other skills run it too: [wayfinder](../engineering/wayfinder.md) for decision tickets, [triage](../engineering/triage.md) for vague reports, [improve-codebase-architecture](../engineering/improve-codebase-architecture.md) once you pick a candidate.

| What you have | Reach for |
| --- | --- |
| A plan or change you can settle in one session | `grill` |
| An effort too big to hold in one session | [wayfinder](../engineering/wayfinder.md), which runs `grill` inside each decision ticket |
| A question talking can't settle, like how something should look or feel | [prototype](../engineering/prototype.md) |
| A decision blocked on knowledge in someone else's head | [to-questionnaire](to-questionnaire.md) |

## Rounds, and who decides

Every question arrives numbered and titled behind a `❓`, with the agent's recommended answer alone on a `➡️` line. That makes a round answerable by number: "1 yes, 2 the second option, 3 no, here's why", or just "agree all".

Facts are the agent's job; decisions are yours. When a question needs something the codebase or the environment can answer, it looks it up itself, inline, instead of asking you. The session ends when the frontier is empty, and it won't act on what you agreed until you confirm the understanding is shared.

Say "go with your recs" and it runs the whole session on its own recommendations, then lists every decision it made, numbered, so you can confirm or overturn any of them in one reply.

## The paper trail

| What resolved | Where it lands |
| --- | --- |
| A term, the project's own word for a thing | `CONTEXT.md`, inline, as it resolves |
| A decision that's hard to reverse, surprising without context, and a real trade-off | An ADR under `docs/adr/` |
| Everything else you decided | The conversation only |

The third row catches people out. Most decisions don't earn an ADR, so the bulk of what you agreed lives in the context window. Hand that same conversation to [to-spec](../engineering/to-spec.md) rather than clearing it, and land the files it wrote with [close](close.md).

## Common questions

**Where did `grill`, `grill` and `grilling` go?**
They're all `grill` now. The three ran the same interview; the only difference was whether it wrote docs, and a grilling session that leaves no paper trail wasn't worth keeping as its own skill.

**Can I go back to one question at a time?**
Yes. Add `When grilling, ask one question at a time.` to your global `CLAUDE.md`.

**Can I cap the number of questions?**
No, deliberately. Tell it to wrap up when you've had enough. A session that runs very long usually means the scope was too big; break it up.

**It ran out of questions and started building.**
It shouldn't: it's finished when you confirm the understanding is shared, not when the frontier empties. Weaker or lower-effort models are the usual cause. A line in your `AGENTS.md` telling the agent not to build without permission fixes it.

**It ran, but no `CONTEXT.md` or ADRs appeared.**
Usually nothing qualified: a change with no new vocabulary and no hard trade-off has nothing to write. If it keeps happening, ask the agent whether it loaded `domain-modeling`.

## It's working if

- A round arrives as a numbered list with a recommendation on each, and you can answer it by number.
- Later rounds ask things the first round couldn't have asked.
- It looks facts up rather than asking you something it could have found out.
- `CONTEXT.md` changes during the session, term by term.
- It stops at the end and asks you to confirm, instead of starting work.

## Where it fits

`grill` is the head of the main build chain:

```txt
grill → to-spec → to-tickets → build → close
```

It produces the shared understanding and settled vocabulary that [to-spec](../engineering/to-spec.md) then writes up without interviewing you again. [domain-modeling](../engineering/domain-modeling.md) is the glossary-and-ADR discipline it drives. [ask](../engineering/ask.md) routes you when you're unsure which skill fits.
