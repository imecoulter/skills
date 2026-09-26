## What it does

`close` ends a session with its work on the default branch. It takes inventory of everything the session opened (uncommitted changes, branches, worktrees, PRs, tickets, background tasks), finishes the work you already agreed to, runs the repo's checks, merges every branch through a PR, closes the tickets that work resolved, and sweeps the merged branches and worktrees away.

Everything ends in one of two states: **landed** or **handed back**. Landed is the expected ending. A branch with no PR yet is not a reason to stop; `close` opens the PR itself. Handing back is reserved for blockers it can't clear on your behalf: a failing check, a required review, a conflict that needs your decision, or you asking it to leave something open.

## When to reach for it

Type `/close`, or the agent reaches for it when you say it in plain words: "close out the session", "open a PR and merge", "merge and let me know when I can move on".

| You want… | Reach for |
| --- | --- |
| The session's work merged, cleaned up, and a pointer to what's next | `close` |
| To carry unfinished work into a fresh session instead | [handoff](https://aihero.dev/skills-handoff) |
| A single ticket built and landed | [build](https://aihero.dev/skills-build), which ends by running `close` |

## The gate

Many repos run no checks on a PR, on purpose, to save CI minutes. There, "green" means the repo's own **definition of done**, run locally: its documented check command, or its typecheck and test suite. `close` runs it before every merge. A command that exits 0 without showing any results doesn't count as a pass, because a silent zero looks exactly like a clean run.

## The report

The report leads with what you have to act on and stays inside this session:

- **⚠ Needs you** — anything handed back or anything that went wrong while closing, each with the exact action to take.
- **Landed** — what merged, with PR links, and the tickets closed.
- **Next** — whether it's safe to start the next session, and the exact command for the next piece of work, such as the next frontier ticket on a wayfinder map.

## Common questions

**It handed back a PR with a failing check. Can it merge anyway?**

Only if you say so. Merging past a failing check is your decision, so tell it explicitly ("merge it anyway") and it will.

**When can I start the next session?**

When the **Next** line says it's safe: everything landed, and each primary checkout is clean on its default branch. The same line names the command to run.

## It's working if

- The session ends with its changes on `main`, not sitting on a branch.
- The only things left open are the ones listed under **⚠ Needs you**, each with a reason.
- `git worktree list` shows nothing this session created and already merged.
- You don't have to ask what to run next.

## Where it fits

`close` is the last step of any session that changed something. It's where [build](https://aihero.dev/skills-build) hands off, and where a [wayfinder](https://aihero.dev/skills-wayfinder) session lands the docs it wrote. Unlike [handoff](https://aihero.dev/skills-handoff), which carries work forward, `close` finishes it. [ask-matt](https://aihero.dev/skills-ask-matt) is the router over the whole set.
