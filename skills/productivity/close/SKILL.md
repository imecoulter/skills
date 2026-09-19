---
name: close
description: Close the current session — finish what's outstanding, merge what's green, sweep worktrees and branches, report.
argument-hint: "Anything to leave open or handle specially?"
disable-model-invocation: true
---

Close the current session. Everything this session opened ends in one of two states: **landed** (done, merged, swept) or **handed back** (named in the report with the reason and what the user must do). The session is closed when nothing is in neither state.

Scope is this session: the work, branches, worktrees, PRs, background tasks and scratch files it created, across every repo it touched. If the user passed arguments, they override the defaults below.

## 1. Inventory

List every loose end, using the environment as the source of truth rather than memory:

- Tasks and todos still open, and background tasks still running.
- Per repo touched: `git status`, `git worktree list`, unpushed commits, and PRs opened from this session's branches (`gh pr list --author @me`).
- Follow-ups the conversation promised ("I'll do X after Y") and questions left unanswered.

Tag each item **finish**, **merge**, **sweep** or **hand back**.

Done when every item on the list has a tag.

## 2. Finish

Complete each **finish** item — work the user already agreed to in this session. An item that needs a decision the user hasn't made, or that is new scope, is re-tagged **hand back**; closing lands agreed work and starts nothing new.

Commit and push finished work on its branch, following the repo's conventions.

Done when every finish item is pushed or re-tagged.

## 3. Merge

For each PR, follow the repo's documented workflow (`docs/agents/git-workflow.md` or equivalent) if one exists; otherwise merge on green:

- **Green, or no checks configured** → merge.
- **Pending** → wait for it (`gh pr checks --watch`, backgrounded when slow).
- **Red** → leave it open and hand it back with the failing output.

Merge only through the PR with its checks intact — the user decides anything that would bypass them.

Done when every PR is merged or handed back.

## 4. Sweep

Run the repo's documented sweep if it has one. Otherwise, for each branch this session merged: remove its worktree, delete the local branch, `git fetch --prune`. Delete scratch files the session created. Return each primary checkout to its default branch, pulled.

Sweep only what is merged and belonged to this session. An unmerged branch, a dirty worktree, or anything that predates the session is handed back instead.

Done when `git worktree list` and `git branch` in each repo show nothing merged that this session created, and each primary checkout is clean on its default branch.

## 5. Report

A few lines, no recap of the conversation:

- **Landed** — what shipped, with PR links.
- **Handed back** — each item, why, and what the user needs to do.
