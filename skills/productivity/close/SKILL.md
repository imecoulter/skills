---
name: close
description: Close the current session — finish what's outstanding, merge the session's changes to the default branch, sweep worktrees and branches, report.
argument-hint: "Anything to leave open or handle specially?"
disable-model-invocation: true
---

Close the current session. Everything this session opened ends in one of two states: **landed** (done, merged into the default branch, swept) or **handed back** (named in the report with the reason and what the user must do). The session is closed when nothing is in neither state.

The expected ending is **landed**: the session's changes merged into the default branch (`main`). Handing back is the exception, reserved for the specific blockers named below — not a default for work that simply has no PR yet.

Scope is this session: the work, branches, worktrees, PRs, background tasks and scratch files it created, across every repo it touched. If the user passed arguments, they override the defaults below.

## 1. Inventory

List every loose end, using the environment as the source of truth rather than memory:

- Tasks and todos still open, and background tasks still running.
- Per repo touched: `git status`, `git worktree list`, unpushed commits, and PRs opened from this session's branches (`gh pr list --author @me`).
- Per repo touched: every branch carrying this session's commits that aren't on the default branch yet (`git log <default>..<branch>`) — **including the branch or worktree the session is running in**, with or without a PR.
- Follow-ups the conversation promised ("I'll do X after Y") and questions left unanswered.

Tag each item **finish**, **merge**, **sweep** or **hand back**. Every branch with session commits not on the default branch is tagged **merge**.

Done when every item on the list has a tag.

## 2. Finish

Complete each **finish** item — work the user already agreed to in this session. An item that needs a decision the user hasn't made, or that is new scope, is re-tagged **hand back**; closing lands agreed work and starts nothing new.

Commit finished work on its branch, following the repo's conventions. Uncommitted changes in the session's checkout count as finish items — commit them rather than leaving them behind.

Done when every finish item is pushed or re-tagged.

## 3. Merge

Every **merge** branch goes into the default branch. Follow the repo's documented workflow (`docs/agents/git-workflow.md` or equivalent) if one exists; otherwise:

- **Has a PR** → merge it through the PR.
- **No PR, repo has a remote** → push the branch, open a PR (`gh pr create`), and merge it through the PR.
- **No remote** → merge the branch into the default branch locally, from the checkout that has the default branch checked out.

For a PR's checks:

- **Green, or no checks configured** → merge.
- **Pending** → wait for it (`gh pr checks --watch`, backgrounded when slow).
- **Red** → leave it open and hand it back with the failing output.

If the default branch has moved on and the branch conflicts, bring it up to date and resolve the conflicts (`/resolving-merge-conflicts`); hand back only a conflict whose resolution needs a decision the user hasn't made.

Merge only through the PR with its checks intact — the user decides anything that would bypass them. Hand back only for: red checks, a required review or other branch protection the session can't satisfy, an unresolvable conflict, or the user's arguments saying to leave it open.

Done when every merge branch's commits are on the default branch (`git log <default>..<branch>` is empty, after fetching) or the branch is handed back for one of the reasons above.

## 4. Sweep

Run the repo's documented sweep if it has one. Otherwise, for each branch this session merged: remove its worktree, delete the local branch, `git fetch --prune`. Delete scratch files the session created. Return each primary checkout to its default branch, pulled.

Sweep only what is merged and belonged to this session. An unmerged branch, a dirty worktree, or anything that predates the session is handed back instead.

Done when `git worktree list` and `git branch` in each repo show nothing merged that this session created, and each primary checkout is clean on its default branch.

## 5. Report

A few lines, no recap of the conversation:

- **Landed** — what merged into the default branch, with PR links (or the merge commit when merged locally).
- **Handed back** — each item, why, and what the user needs to do.
