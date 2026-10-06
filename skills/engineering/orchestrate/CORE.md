# Workflow-first: the always-on rules

AFK work goes to agents; HITL work runs inline with the user. The full procedure is the `/orchestrate` skill: load it before you launch any subagent or workflow. A repo's own docs and skills win any conflict with these rules; these rules win over the workflow-authoring skill's model and effort defaults.

**Count units before choosing a mode.** A unit is one AFK-ready piece of work: a frontier ticket, a PR, a hypothesis, a batch, a directory or a source.

| Units | Mode |
|---|---|
| One unit, units that share files, a linear chain, or anything that needs the user (grill, to-spec, to-tickets, wayfinder, triage, prototype feedback, a seam decision) | Inline, or one subagent with an explicit `model` |
| 2+ independent units, up to the cap (4 agents on Pro, 9 on Max/business) | One workflow run |
| More than the cap, or several waves | One run per wave; wave N+1 starts after wave N has landed and been pushed |

**Name `model` on every agent** — the aliases `haiku`, `sonnet` or `opus`, nothing else. An agent without one runs the session model, Opus by default; built-in Explore inherits it too, so spawn Explore with `model: haiku`. Name `effort` on every sonnet or opus agent and leave it off haiku.

| Role | Model | Effort |
|---|---|---|
| Scout (one per run, only when 3+ builders would explore the same unfamiliar area), finder, reader | haiku | — |
| Builder (ticket, hypothesis), writer/synthesizer | sonnet | medium |
| Mechanical batch (rename, codemod, expand–contract migrate) | sonnet | low |
| Reviewer of a risky change (auth, data, migrations), or when the user asks | opus | low |
| Inline planning: grill, to-spec, to-tickets, wayfinder, architecture | session on opus | medium |
| Inline landing (/close), small fixes | session on sonnet | medium |

**Orient once per session, before the first launch** (an agent, a workflow, or `/build`): print the ops header from `/orchestrate`.

**Announce, then wait for "go".** Before each launch post 5 lines or fewer: the mode (say "workflow run" when it is one), stages with model/effort, agent count, rough cost (inline ≈1x; a run ≈ agents × per-agent work), and account/usage. A saved script the user already approved just gets the announcement.

**Budget gates** — on the higher of the 5-hour and weekly bars, before every launch and between waves:
- Under 70%: normal.
- 70% or more: no opus stages, and halve the cap.
- 85% or more, or weekly at 70% or more with its reset over 24h away: no workflow. Finish the phase inline on sonnet, stop at the next boundary, and name the next command.

**Escalate on a re-run, never inside a script.** A unit that skipped work (a missed file, tests not run, quit midway) re-runs on the same model at effort +1. A unit wrong despite full context re-runs one model up at medium. A second failure is blocked and reported. The effort ceiling is high; xhigh and max only when the user asks.

Launch workflows from interactive sessions only. Keep model and effort fixed within a session — switching models busts the cache — and change the model right after `/clear`. `/usage`, `/config`, `/status` and `/clear` are the user's commands: ask them to run one.
