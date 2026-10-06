---
name: orchestrate
description: "Run AFK work as subagents or a dynamic workflow, with a named model and effort on every stage. Use before launching any subagent or workflow, and whenever 2+ independent units could run at once — a ticket wave, a PR sweep, competing bug hypotheses, refactor batches, or a research sweep across directories or sources (\"run wave 2\", \"review these PRs\")."
---

Read [CORE.md](CORE.md) first, unless it is already in your context (the user's `CLAUDE.md` imports it). It holds the mode table, the roles table, the budget gates and escalation; this skill is the procedure around them. For a fact behind a decision — a limit, a default, a price — read only the section of [REFERENCE.md](REFERENCE.md) that decision needs.

## 1. Orient

Once per session, before the first launch.

- `claude --version` must be v2.1.284 or later; tell the user if it's older.
- Read the user and project `settings.json` for `model`, `workflowSizeGuideline` and `env`. Flag `CLAUDE_CODE_SUBAGENT_MODEL_FORCE` or `CLAUDE_CODE_EFFORT_LEVEL` if set: they override per-stage model and effort.
- Read `CLAUDE.md`/`AGENTS.md`, `CONTEXT.md` and `docs/agents/*.md` for the tracker, the git workflow, the definition of done, hotspot files and worktree setup cost (the `## Parallel waves` section of `docs/agents/git-workflow.md`). Without `docs/agents/`, ask the user to run `/setup-imecoulter-skills` before any wave.
- Glob once for skill folders (project, user config dir, plugins) and note absolute paths or namespaced names — builders need them.
- Usage: in the desktop app, the `get_usage` tool (`mcp__ccd_session_mgmt__get_usage`). Otherwise `statusline-rate-limits-cache.json` in the active config dir, when its `updated_at` is under 15 minutes old. Otherwise ask the user for the 5-hour %, the weekly %, and which account this is.

Done when you've printed an ops header of 6 lines or fewer covering: version, account/plan, size guideline, session model, check command, tracker, usage %.

## 2. Choose the mode

Count units against CORE.md's mode table, then:

- **Stay inline** even for big work when several units edit the same hotspot file, there's no definition of done, the seams aren't agreed, the repo isn't git (Perforce), or worktree setup dominates (Unreal projects, heavy installs).
- Workflow worktrees branch from the remote default branch unless `worktree.baseRef` is `"head"` (verified) — which is why a wave starts only after the previous one is pushed.
- If workflows are unavailable (off on Pro until enabled, or disabled by an admin), launch the same stages as subagents with explicit models.

## 3. Announce, then pilot

- Announce per CORE.md and wait for "go".
- Load the bundled `workflow-authoring` skill before you write or edit a script.
- Every `agent()` call names `model`; every sonnet/opus call names `effort`.
- Accept `args` as either a string (a slash invocation passes it raw) or structured data.
- Run a new or edited script on one unit first and report each agent's token total from `/workflows`. Scale only after that.

## 4. Agent contracts

- **Prompt order.** The shared part goes first and is identical across siblings (spec ref, conventions, check command, scout brief); the unit-specific part goes last. Siblings with the same model, effort, agentType, tools and schema share the prompt cache.
- **Builder preamble:** "Your isolated worktree is your /build worktree. Rename its branch to the repo convention and create no other worktree. The acceptance criteria are the pre-agreed seams. If you need another seam, return blocked with the proposed seam. Run /build steps 1–4, running /code-review with fixed point <base SHA> and spec <ref>. Stop after the review fixes are committed; the human asked to stop before merging."
- **Builder returns** `{id, status: green|red|blocked|failed, branch, head, checks:{command, passed, outputSeen}, review:{standards_n, spec_n, worst}, notes ≤3 lines}`.
- **Script:** map every `null` result to `{id, status:'failed'}` so every unit appears in the summary.
- **Handoffs** go through returns, commits and the run journal (`<transcriptDir>/journal.jsonl`; read only the entries you need). `.scratch/` belongs to the local ticket tracker, and isolated agents can't see untracked files.
- **Skills in agents:** agents invoke model-invoked skills (`build`, `tdd`, `code-review`, `diagnosing-bugs`, `resolving-merge-conflicts`) by name, or read the `SKILL.md` at its absolute path plus the files it links. User-invoked skills stay inline with the user.
- **Limits:** workflow agents can't spawn agents or ask questions, so any human-only step returns blocked.

## 5. Land

- Present the run as a table: unit, status, branch, checks, worst finding. After the user's OK, run one `/close` for the wave, merging in ticket order and then smallest diff first.
- Red, blocked or failed units: fix them inline in their preserved worktree, or launch a new run over only those units. Relaunching the old run reruns every agent started after the first failure.
- When `/close` reports it's safe, ask the user to `/clear` — the tickets carry the context — then start the next wave from the run-order table. At other boundaries, walk the phase-boundary tree in `/ask`.

## 6. Recipes

- **Ticket wave:** [scout] → `pipeline(ticket → builder, worktree, §4)` → the script builds the summary → [opus reviewer runs `/code-review` read-only on base...branch for each risky ticket] → §5. This recipe ships as the saved workflow `/imecoulter-skills:ticket-wave` — run it with the wave's ticket numbers (`risky:` before a risky one) instead of writing a new script.
- **PR sweep** (2+ PRs; one PR is one subagent): `pipeline(pr → sonnet/medium in a worktree: check out the PR, run the definition of done; if red, return red; else /code-review against the PR base)` → `{pr, red, standards{n,worst}, spec{n,worst}|skipped}`.
- **Hard bug:** `/diagnosing-bugs` phases 1–3 inline (red loop, minimise, hypotheses) → `parallel(hypothesis → sonnet/medium, worktree, change one variable, run the red loop)` → `{id, held: yes|no|unclear, evidence ≤3}` → fix and regression test inline. A regression between two known-good states gets `git bisect run` with no agents.
- **Wide refactor:** the expand step inline (`/build`, `/close`) → `pipeline(batch sized by blast radius → sonnet/low, worktree)` → `{batch, branch, sites, checks}` → `/close` in order → the contract step inline.
- **Sweep or research:** `pipeline(dir or source → haiku finder/reader)` → `[{loc, quote, issue|claim}]` → dedupe in the script → one sonnet/medium writer (fixes, a doc, or the cited research file) → `{path, n, open ≤3}`. The agents do `/research`'s reading themselves rather than each launching `/research`. Reserve the bundled `/deep-research` workflow for open-web questions that need cross-checking.
