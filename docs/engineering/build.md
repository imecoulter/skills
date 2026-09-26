## What it does

`build` builds work that has already been decided. You point it at a ticket, a spec, or the plan you just agreed in the conversation, and it writes the code, drives [tdd](tdd.md) at the seams, typechecks as it goes, runs [code-review](code-review.md) at the end, and lands the work on the default branch through [close](../productivity/close.md).

It never reopens the plan. There is no interview, no clarifying round, no proposal of a different approach. Whatever was settled upstream is the input, and the skill's whole job is to turn that into merged code. That is what separates it from typing "build this" at a fresh agent, which will happily redesign the work while it builds it.

## When to reach for it

Type `/build`, or the agent reaches for it automatically when you ask in plain words — "build #42", "implement issue 87 and merge it".

Where the work currently lives decides whether this is the right skill:

| The work is… | Reach for |
| --- | --- |
| A ticket on the tracker | `/build #42`, one ticket per session, clearing context between tickets |
| A spec, not yet split up, and the build spans sessions | [to-tickets](to-tickets.md) first, then `/build` per ticket |
| A spec, and the build is small | `/build` directly against the spec |
| Only in the conversation you just had, and it's still small | `/build` right there, in the same window |
| Not written down anywhere yet | [grill](../productivity/grill.md) |
| One concrete behaviour you want test-first, with no spec | [tdd](tdd.md) directly |
| Already built, and you want it checked | [code-review](code-review.md) directly |

If the plan lives only in the thread, say so when you invoke it, so the model doesn't go hunting for a spec file that doesn't exist.

## Prerequisites

`build` follows the repo's git workflow (`docs/agents/git-workflow.md`, written by [setup-imecoulter-skills](setup-imecoulter-skills.md)). Without one, a run that starts on the default branch makes its own branch in a worktree before the first commit, so build work never lands on `main` except by merge.

If the tickets came from [to-tickets](to-tickets.md), the tracker they live on was configured by [setup-imecoulter-skills](setup-imecoulter-skills.md). `code-review` reads the same configuration to find the originating spec at close-out.

## What one run does

A run is five beats, in order:

1. Branch into a worktree, unless it's already on a work branch.
2. Drive [tdd](tdd.md) at the pre-agreed seams, one red-green slice at a time, typechecking and running single test files as it goes.
3. Run the repo's definition of done once, at the end — its check command, or the full suite.
4. Commit, then run [code-review](code-review.md) and fix what it finds.
5. Hand off to [close](../productivity/close.md), which opens the PR, merges on green, closes the ticket and sweeps.

One run covers one ticket. The tickets [to-tickets](to-tickets.md) produces are tracer-bullet vertical slices sized to fit a single fresh context window, so the intended rhythm is: clear context, build one ticket, merge, clear again. Each ticket is self-contained, which is what makes the previous ticket's context disposable.

## Pre-agreed seams

The idea the skill runs on is the **seam**: the public boundary you observe behaviour at, without reaching inside. Tests live at seams. Working at a seam agreed before any code is written is what keeps the tests durable, because the implementation underneath can be rewritten without the tests moving.

The word "pre-agreed" is doing real work, and it is also the skill's weakest joint. Nothing inside `build` agrees the seams. `tdd` is the skill that asks, and it refuses to write a test at an unconfirmed seam. So in practice the agreement happens either upstream in the spec, or in the first exchange of the run. If it happens nowhere, the precondition never fires and the run quietly becomes "just write the code". Naming the seams in the spec is what stops that.

## Common questions

**Does it close my ticket?**

Yes, through the merge. The PR carries `Closes #<n>`, and [close](../productivity/close.md) confirms the ticket is closed once the PR lands. That matters most on a dependency chain, because `to-tickets` defines the frontier as tickets whose blockers are all closed. If nothing gets closed, nothing ever becomes visibly unblocked.

**Can I point it at all my tickets at once, or run several in parallel?**

One invocation, one ticket. Parallel is fine across sessions: each run works in its own worktree, so side-by-side `/build` sessions don't share an index or HEAD. [to-tickets](to-tickets.md) prints the tickets in waves, and every ticket in a wave can run in its own session. The git stash is still shared across worktrees, so no run should rely on it.

**Can I stop it before it merges?**

Yes. Say so when you invoke it ("build #42, but leave the PR open"). It then stops after the review with the work committed on its branch.

**`code-review` says it cannot see my changes.**

`code-review` reviews `git diff <fixed-point>...HEAD`, which excludes staged and working-tree changes. `build` commits before it reviews for exactly this reason; if you run the review by hand, commit first.

Separately, some people deliberately do not want the review inside the run at all, because an agent reviewing the code it just wrote is biased toward its own solution. Running [code-review](code-review.md) in a fresh session against a fixed point is a legitimate alternative.

**One ticket burned 150k tokens. Am I using it wrong?**

Probably the ticket is too big rather than the skill being misused. A run does codebase exploration, a red-green loop per seam, a full suite, and a review, so a non-trivial ticket exceeding 100k tokens is normal rather than a sign something broke. The lever is upstream: right-size the tickets in [to-tickets](to-tickets.md) so each fits one fresh window. If a single ticket keeps blowing out, split it rather than raising the effort level.

**`/build #2` in a fresh session worked on something completely unrelated.**

`#2` is resolved against whatever numbered list the agent can see, which in a fresh session may be a todo file, a checklist, or another work list rather than the configured tracker. The resolution is confident rather than fail-closed, so the mistake is not obvious until it has started. Pass the full reference, the issue URL or `owner/repo#2`, and ask it to confirm the title back before it begins.

## It's working if

- The session opens by reading the ticket or spec and restating what it will build, rather than asking you what to build.
- You can see an actual `/tdd` invocation in the trace, not just tests appearing in the diff.
- Typechecks and single test files run repeatedly during the run, and the full suite runs once near the end.
- The run works in its own worktree and ends with a merged PR and a closed ticket, without you prompting it to carry on.
- The diff is one ticket's worth of change: a vertical slice through every layer, not several tickets swept together.

## Where it fits

`build` is the build step of the main chain, second from the end:

```txt
grill → to-spec → to-tickets → build → code-review
```

Its neighbours are [to-tickets](to-tickets.md), which produces the tickets it consumes and declares the blocking edges that decide their order; [tdd](tdd.md), which it drives internally at each seam; [code-review](code-review.md), which it runs before landing; and [close](../productivity/close.md), which lands it. It sits downstream of the planning skills and trusts them. It does not re-validate the shape of what it was handed, so a badly-structured map or a horizontally-layered ticket gets built as written.

That trust is why [wayfinder](wayfinder.md) merges onto the chain at [to-spec](to-spec.md) rather than looping its map straight into `build`. Go straight to `build` from a map only when the effort turned out genuinely small.

[ask](ask.md) is the router over the whole set when you are not sure which flow you are in.
