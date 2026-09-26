---
name: build
description: "Build a piece of work from a ticket, spec or agreed plan, in its own worktree, test-first and reviewed, then land it on the default branch. Use when the user wants a ticket, issue, spec or agreed plan built or implemented (\"build #42\", \"implement issue 87\", \"build this\")."
---

Build the work described by the user in the ticket, spec or agreed plan. Whatever was settled upstream is the input — don't reopen it.

1. **Branch.** Follow the repo's git workflow (`docs/agents/git-workflow.md` or equivalent). Without one, if the checkout is on the default branch, create a branch in its own worktree before the first commit. Build work is never committed straight to the default branch.
2. **Build.** Use /tdd where possible, at pre-agreed seams. Run typechecking regularly and single test files regularly.
3. **Check.** Run the repo's definition of done once at the end — its documented check command (e.g. `npm run check`), otherwise the full test suite. A check has passed only when you've seen its results; exit code 0 with no results shown is not a pass.
4. **Review.** Commit, then use /code-review to review the work, and fix what it finds.
5. **Land.** Run /close to open the PR, merge it on green and sweep — unless the user asked to stop before merging. When the work came from a ticket, the PR body carries `Closes #<n>` (or the tracker's equivalent) so merging closes it.
