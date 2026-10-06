## What it does

`orchestrate` decides how AFK work runs — inline, one subagent, or one dynamic workflow — and launches it with a named model and effort on every stage. It covers ticket waves, PR sweeps, competing bug hypotheses, wide refactors and research sweeps, and it lands the result through [close](../productivity/close.md).

It counts **units**, never tokens. A unit is one piece of work that can finish with you away from the keyboard: a frontier ticket, a PR, a hypothesis, a batch, a directory, a source. One unit, units that share files, or anything that needs you stays inline; two or more independent units become one workflow run. Token estimates can't be observed before a run starts, but units can be counted.

## When to reach for it

Type `/orchestrate`, or the agent reaches for it automatically before it launches any subagent or workflow, and when you ask in plain words — "run wave 2", "review these PRs".

| You have… | Reach for |
| --- | --- |
| One ready ticket | [build](build.md), inline |
| A wave of two or more ready tickets | `/imecoulter-skills:ticket-wave 12 13` — the saved workflow, a builder per ticket |
| Two or more open PRs to check | `orchestrate` — PR sweep |
| One hard bug, hypotheses ranked | [diagnosing-bugs](diagnosing-bugs.md) first; `orchestrate` tests independent hypotheses in parallel |
| One research question | [research](research.md) |
| A question spread over many sources or directories | `orchestrate` — sweep, Haiku readers and one Sonnet writer |
| A decision that needs you (grill, spec, tickets, triage, a seam) | inline; never a workflow |

## Prerequisites

The always-on half lives in `skills/engineering/orchestrate/CORE.md`, imported from your user `CLAUDE.md` with one line (`@~/Dev/skills/skills/engineering/orchestrate/CORE.md`), so its rules hold in every repo before the skill loads. Each config dir needs that line.

A wave reads the repo's `docs/agents/` — the definition of done, and the `## Parallel waves` section of `git-workflow.md` that [setup-imecoulter-skills](setup-imecoulter-skills.md) writes (worktree setup command, hotspot files, risky areas). Without `docs/agents/`, it asks you to run setup before any wave.

One-time settings in each config dir's `settings.json`: `"model": "sonnet"` (switch to `/model opus` right after `/clear` for grill, spec, tickets and wayfinder sessions), `"effortLevel": "medium"`, `"workflowKeywordTriggerEnabled": false`, and `env.CLAUDE_CODE_SUBAGENT_MODEL: "sonnet"` as a floor for any agent that names no model. Leave `CLAUDE_CODE_SUBAGENT_MODEL_FORCE` and `CLAUDE_CODE_EFFORT_LEVEL` unset. On Pro, dynamic workflows must be switched on (`enableWorkflows`). On Windows, set `git config --global core.longpaths true`, since worktrees nest under `.claude/worktrees/`.

## Sonnet builds, Opus judges

Every agent names its **model**, because an agent that names none runs the session model, and the session model is Opus by default. The roles are fixed: Haiku finds and reads, Sonnet builds and writes, Opus reviews only risky changes (auth, money, data, migrations). Effort is named on Sonnet and Opus and left off Haiku, which has no effort control.

Failure moves a unit up one notch, on a re-run and never inside the script: a unit that skipped work gets more effort on the same model; a unit that was wrong despite full context gets the next model up. A second failure is reported as blocked.

## The announcement and the gates

The ticket wave is already a saved workflow, `/imecoulter-skills:ticket-wave`, shipped with the plugin: pass the wave's ticket numbers, with `risky:` before any ticket in auth, money, data or migrations, and it returns one table for `/close`. The other recipes are written fresh for each run and piloted on one unit first.

Nothing launches until you say "go" to a five-line announcement: the mode, each stage's model and effort, the agent count, a rough cost, and your usage. Before every launch it reads your 5-hour and weekly bars (the desktop app's usage tool, or the statusline cache) and applies the **budget gates**: at 70% no Opus stages and half the cap; at 85%, or a weekly bar at 70% with its reset more than a day out, no workflow at all.

## Common questions

**Can I move a heavy run to my other account when this one is near its limit?**

No. Each repo stays on its owner's account for the life of the project; when that account hits a limit, wait for the reset or shrink the run. Nothing bans holding two accounts, but the usage policy prohibits using several to get around product limits, and "use the bigger plan for the heavy runs" reads as exactly that.

**Why don't the builders merge their own work?**

Parallel builders running `/close` would merge into the default branch concurrently. Each builder stops after its review fixes are committed, and one `/close` lands the wave in ticket order, then smallest diff first. The review already runs inside `/build`, so there are no separate review agents to pay for.

**A run failed halfway. Do I relaunch it?**

Relaunch only the failed units as a new run, or fix them inline in their preserved worktrees. Relaunching the old run reruns every agent started after the first failure.

**Why not let each builder write its notes to `.scratch/`?**

`.scratch/` is the local ticket tracker, `/close` deletes session scratch files, and an agent in an isolated worktree can't see untracked files. Results travel through each agent's return value, its commits, and the run journal.

## It's working if

- Every launch is preceded by a short announcement naming a model for each stage, and nothing starts until you answer.
- `/workflows` shows Haiku and Sonnet agents doing most of the work, and Opus only on risky reviews.
- A wave ends with one table — unit, status, branch, checks, worst finding — and one `/close`.
- A session near its limit finishes inline on Sonnet instead of starting a run.

## Where it fits

A reach-for-it-anytime layer over the main chain rather than a step in it: it runs [build](build.md) once per ticket in a wave that [to-tickets](to-tickets.md) printed, and hands the wave to [close](../productivity/close.md). [diagnosing-bugs](diagnosing-bugs.md) and [research](research.md) hand it their parallel cases. For the whole map, see [ask](ask.md).
