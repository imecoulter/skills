# Orchestrate reference

Facts behind [CORE.md](CORE.md) and [SKILL.md](SKILL.md). Read only the section a decision needs. Where this file and the rules disagree, the rules win; where a repo's own docs disagree with either, the repo wins.

## Fact sheet

Sources: the Claude Code docs and CHANGELOG through v2.1.290, checked Oct 5, 2026. "(runtime)" marks facts read from the bundled workflow-authoring skill and runtime strings in the published package; they are not in the public docs.

### Dynamic workflows: mechanics
- **Script shape.** The file starts with `export const meta = { name, description }`, which must be the first statement and a plain object literal (`phases` and `whenToUse` are optional). The rest is a top-level-await body.
- **Primitives.**
  - `agent()` runs one subagent.
  - `pipeline(items, fn)` runs one per item with no barrier and keeps `null`s.
  - `parallel()` runs concurrently with a barrier.
  - Also available: `phase()`, `log()`, the `args` global, and `workflow(name, args)`, which nests one level only (runtime).
- **`agent(prompt, opts)` options** (runtime): `label`, `phase`, `schema`, `model` (alias or full ID), `effort` (`low`…`max`), `isolation: 'worktree'`, `agentType` (resolved from the same registry as the Agent tool).
  - `schema` returns validated JSON and fails after 5 attempts (`MAX_STRUCTURED_OUTPUT_RETRIES`).
  - A stopped agent, or one that hits an unrecoverable error, resolves to `null`.
- **Model choice.** A model the script names counts as the per-invocation model. Otherwise the agent follows the subagent order and finally falls back to the **session model**. The authoring skill tells Claude to omit `model` by default (runtime).
- **Runtime limits:**
  - 16 concurrent agents, or fewer on fewer CPUs; `CLAUDE_CODE_WORKFLOW_MAX_CONCURRENT_AGENTS` takes 1–256 (v2.1.269+).
  - 4,096 items per `parallel`/`pipeline` call; 1,000 agents per run.
  - The script has no filesystem, shell or `import()`, and takes no mid-run user input.
  - `Date.now()`, `Math.random()` and a no-argument `new Date()` throw.
- **Workflow agents** get all tools except SendUserMessage, Agent and Workflow, so they cannot nest agents or ask you questions (runtime). They load CLAUDE.md, except the built-in Explore and Plan types.
- **Worktree isolation.** An agent's changes are kept for review and never auto-merged; a worktree with no changes is cleaned up (runtime). Subagent worktrees branch from the remote default branch unless `worktree.baseRef: "head"`; whether this holds for workflow agents is unverified.
- **Launch and results.** A launch returns immediately, and the script's `return` arrives later as a task notification. Each agent's output is in `<transcriptDir>/journal.jsonl` (runtime). Run scripts are written under the session directory in `~/.claude/projects/`.
- **Save and edit.** In `/workflows`, select a run and press `s`. It saves to `.claude/workflows/` (project) or `~/.claude/workflows/` (personal, honours `CLAUDE_CONFIG_DIR`) and runs as `/<name>`; a project workflow beats a personal one of the same name, and plugin workflows run as `/<plugin>:<name>`. Before editing, run `/workflow-authoring` (v2.1.248+), then `/reload-skills`.
- **Args.** A slash invocation passes `args` as a raw string (runtime); a natural-language request passes structured data. If `args` is omitted it is `undefined`.
- **Resume** works only in the same session. On relaunch:
  - Agents are replayed in start order.
  - The first agent whose prompt changed reruns, and so does every agent after it.
  - A failed agent reruns, and so does every agent that started after it.
  - Stopping one agent with `x` counts as a failure.
- **Usage-limit pause** (v2.1.271+) needs all of these:
  - an interactive claude.ai session;
  - `autoContinueAtUsageLimit` on (on by default per the changelog);
  - a reset within 24h;
  - fewer than 2 earlier waits in the run.
  
  It does not apply in `-p`/SDK, background, Remote Control or teammate sessions, where agents fail instead.
- **Guardrails:**
  - The `Large workflow` warning fires above 25 agents or 1.5M projected tokens. It is advisory, and a guideline you choose replaces the 25.
  - Size guideline values: `small` <5, `medium` <10, `large` <50, `unrestricted`. Default is medium, or small on Pro from v2.1.271; v2.1.271 lowered medium from 15 to 10. Set it in `/config` or with `workflowSizeGuideline`.
- **Approval.** You approve every run in manual and accept-edits modes; saved workflows offer "don't ask again". In `-p`/SDK runs, allow `Workflow` or `Workflow(<name>)`.
- **On/off.** Workflows are off by default on Pro (turn on in `/config` or with `enableWorkflows`). They can be disabled with `disableWorkflows`, `CLAUDE_CODE_DISABLE_WORKFLOWS=1` or the admin toggle.
- **`budget` global** (runtime, undocumented). It is only set when you type a "+500k"-style directive, counts output tokens only, and throws on new `agent()` calls once the cap is hit. It is not a general spend cap.
- **Prompt caching:**
  - Siblings with the same model, effort, agent type, tools, output schema and directory share a cached prefix. Siblings are held up to `CLAUDE_CODE_WORKFLOW_PREFIX_STAGGER_MS` (5000 ms) so they can read it.
  - Workflow and subagent requests get a 5-minute TTL even on a subscription (`subagentPromptCacheTtl` changes it; 1h writes cost more). The main conversation gets 1h on a subscription.
  - Switching models busts the cache. Changing effort does not on Opus/Sonnet 5.5, and neither do `opusplan` toggles.
- **Trigger keyword.** The keyword in a prompt you type (or paste) starts a workflow; asking for one in plain words is treated as the same opt-in. It does not fire from `-p` prompts (since v2.1.210), and `workflowKeywordTriggerEnabled: false` turns it off.

### Models and effort
- **Aliases:**
  - `opus` → Opus 5.5 (v2.1.280+)
  - `sonnet` → Sonnet 5.5 (v2.1.284+)
  - `haiku` → Haiku 4.5, the only current Haiku (`claude-haiku-4-5-20251001`)
  
  Haiku 5.5 is announced but not shipped, and Haiku 4.5 retires no sooner than Oct 15, 2026.
- **Default model** is Opus 5.5 on Pro, Max, Team and Enterprise (v2.1.280). The built-in Explore and Plan agents inherit the session model; Explore stopped using Haiku in v2.1.198.
- **Effort.** Levels are low/medium/high/xhigh/max, and Opus/Sonnet 5.5 default to medium.
  - `/effort` saves the level per model in `modelSettings`; `max` applies to the session only.
  - Skill and subagent frontmatter accept `effort`.
  - `CLAUDE_CODE_EFFORT_LEVEL` overrides frontmatter.
  - `maxEffortLevel` caps everything (v2.1.267+).
- **Haiku 4.5 has no effort control.** `/effort max` is wrongly accepted on it (issue #96386, open). It uses budgeted extended thinking, which is on by default. `MAX_THINKING_TOKENS` positive values are ignored on the 5.5 models, so setting one would cap only Haiku (inference).
- **Thinking** is billed as output and cannot be disabled on Opus/Sonnet 5.5.
- **1M context** is included on every plan, Pro included, for Sonnet 5+ and Opus 4.7+. `autoCompactWindow` defaults to 800000 and accepts 100000–1000000; `CLAUDE_CODE_AUTO_COMPACT_WINDOW` overrides it for one session.
- **`CLAUDE_CODE_SUBAGENT_MODEL`** sets the default for subagents, teammates and workflow agents. `…_FORCE` (v2.1.257+) overrides every per-agent model. `omitClaudeMd` is agent frontmatter (v2.1.271).
- **API prices** per 1M tokens (a proxy only: subscription weighting is unpublished):

  | Model | Input | Output | Cache read | 5-min cache write |
  |---|---|---|---|---|
  | Opus 5.5 | $4 | $20 | $0.20 | $5 |
  | Sonnet 5.5 | $2 | $10 | $0.20 | $2.50 |
  | Haiku 4.5 | $1 | $5 | $0.10 | $1.25 |

- **Evidence:**
  - Sonnet 5.5 beats Opus 5.5 at xhigh on Terminal-Bench 4.0 (70.6 vs 66.4).
  - Opus leads on FrontierCode (54.4 vs 52.1) and CursorBench (57.8 vs 55.5).
  - Anthropic: "Opus 5.5 remains clearly stronger at complex, open-ended work requiring sustained judgment."
  - Opus 5.5 at default beats Opus 5 at max for about a fifth of the cost (Terminal-Bench only).
  - Deloitte: Opus 5.5 at its lowest effort caught 72% of known bugs, vs Opus 5 at high with 56%.
  - Sonnet 5.5 at max sometimes ran the multi-subagent code-review skill and made out-of-scope edits (two cases).
- **Guidance** (claude.com blog, Jul 7 2026):
  - Use the default effort for most tasks.
  - Wrong despite full context → use a larger model.
  - Skipped a file or tests, or quit midway → use higher effort.
  - High effort generated about 7x the tokens in their example.
- **Multi-agent cost.** Agents use about 4x the tokens of chat, and multi-agent research systems about 15x (Anthropic engineering, Jun 2025, research tasks). "Most coding tasks involve fewer truly parallelizable tasks than research." Agent teams use about 7x when teammates run in plan mode (costs docs).

### Plans, limits and monitoring
- **Limits.** Pro and Max each have a session limit that resets every 5 hours, plus a weekly limit across all models that resets at a fixed time. Max 5x gives 5x Pro's per-session allowance.
  - Usage is shared across claude.ai, Desktop and Claude Code.
  - Anthropic reserves the right to add model- or feature-specific caps.
  - The errors doc: one large workflow fan-out "can exhaust the weekly allowance before the session window resets."
- **Business seats:**
  - Team Standard is 1.25x Pro and Team Premium 6.25x.
  - New usage-billed Enterprise has no 5-hour or weekly bars and bills at API rates.
  - Admins can disable workflows, set `availableModels` and set spend limits.
- **Monitoring:**
  - The status line's `rate_limits.five_hour` / `seven_day` give `used_percentage` and `resets_at`, on Pro/Max only, after the first response. It also exposes `context_window.used_percentage` and `prompt_cache`.
  - `/usage` plan bars are account-wide. Its attribution (by skill, subagent, plugin, MCP; `d`/`w` toggle) is local and approximate, and it flags any behavior at 10% or more of usage.
  - `/workflows` shows token totals per agent and per phase.
- **Spend traps:**
  - Usage credits are opt-in and billed at API rates.
  - `/fast` draws credits even when plan capacity remains.
  - `ANTHROPIC_API_KEY` is always used in `-p`.
  - A limit reset is saved from Settings > Usage, not from Claude Code.

### Token hygiene (official costs docs unless noted)
- **Context:**
  - `/clear` between unrelated tasks is free.
  - `/compact <focus>`, plus a `# Compact instructions` section in CLAUDE.md, is cheapest while the cache is warm.
  - To go back, `/rewind` truncates to a cached prefix.
  - Keep each CLAUDE.md file under ~200 lines (imports and rules files count separately); `paths:` rules load only when a matching file is touched.
- **Skills and tools:**
  - Skills load on demand. `disable-model-invocation: true` removes a skill's description from context, and Claude is then told to ask you to run it (v2.1.222).
  - MCP tool schemas are deferred by default. CLI tools (`gh`) add no per-tool listing.
  - Code-intelligence (LSP) plugins replace grep-and-read loops.
- **Output limits:** `bashOutputMaxChars` defaults to 30,000 (v2.1.261+); `MAX_MCP_OUTPUT_TOKENS` defaults to 25,000.
- **Ignoring files.** A `.claudeignore` file has no effect; use `permissions.deny` `Read(./dir/**)` instead.
- **Idle drains:** scheduled tasks, goal check-ins and prompt suggestions (`promptSuggestionEnabled: false`).


## Why the rules say what they say
- **Explicit model on every agent:** workflow agents pick their model the way subagents do and otherwise fall back to the session model (Opus 5.5). The bundled authoring skill tells Claude to omit `model` by default, which is why the orchestrate rules override it. Built-in Explore also inherits the session model (v2.1.198), so it no longer runs on Haiku.
- **Effort:** Opus 5.5 and Sonnet 5.5 default to medium, and Anthropic advises the default "for most tasks". Raise effort when a task fails by skipping something, and move up a model when it's wrong despite full context (claude.com blog, Jul 7 2026). Haiku 4.5 has no effort control: it uses extended thinking with a budget, on by default.
- **Sonnet builds, Opus judges:** Sonnet 5.5 leads Opus 5.5 on Terminal-Bench 4.0 (70.6 vs 66.4). Anthropic says Opus "remains clearly stronger at complex, open-ended work requiring sustained judgment." Opus 5.5 at its lowest effort caught 72% of known bugs in Deloitte's reviews, against Opus 5 at high (56%). There is no head-to-head test of Opus-low vs Sonnet-high, so Opus is reserved for risky reviews.
- **Builders run /build steps 1–4 and stop:** otherwise each builder runs /close and merges in parallel. /build already runs /code-review inline (both axes, never reranked), so separate Standards/Spec/Check agents would double the review cost and check the wrong checkout.
- **Count units, not tokens:** token estimates can't be observed before you start. Per the skills, one ticket is an inline /build; a wave is a workflow.
- **Returns, not `.scratch/` files:** `.scratch/` is the local ticket tracker, /close deletes session scratch files, and worktree agents can't see untracked files.
- **No in-script retries:** relaunching a run reruns every agent started after the first failure.
- **Budget gates:** a large fan-out can drain the weekly allowance before the 5-hour window resets (errors docs). Workflows pause only for a 5-hour limit, in interactive sessions, if the reset is within 24h, at most twice. `/usage` attribution is local and approximate, though its plan bars are account-wide.
- **Caching:** agents that match on model, effort, agent type, tools, schema and directory share a prompt-cache prefix. Workflow agents get a 5-minute cache TTL even on a subscription. Switching models busts the cache; changing effort doesn't on Opus/Sonnet 5.5.
- **Price weights:** the API prices under *Models and effort* are a proxy for how fast usage drains, nothing more. Thinking bills as output, and Anthropic doesn't publish how subscriptions weight each model.

## Verified in the first pilot (Oct 5, 2026, imecoulter/skills#7)
- **Workflow agents can call the Skill tool.** The builder ran `build` and `code-review` by name (`skillTool: used`); the read-SKILL.md-by-path fallback stays in the prompt for harnesses where they can't.
- **Worktree isolation works on Windows.** The agent got `.claude/worktrees/wf_<run>-<n>`, renamed its branch to the repo convention, and the worktree was kept after the run for landing.
- **A small ticket on one Sonnet/medium builder:** 71.5k tokens, 15 tool calls, 99 s, green on the first pass.
- **A user `CLAUDE.md` written mid-session doesn't reach that session's agents** (`coreRules: false`): CLAUDE.md files and their imports load at launch, and agents get the session's set. New sessions load it. User-scope imports need no approval dialog (except in Cowork).
- **Workflow worktrees branch from the remote default branch.** A probe launched from a clone whose local `main` sat one commit behind `origin/main`, with `worktree.baseRef` unset, started its worktree at `origin/main` — the subagent rule holds for workflow agents. So a wave starts from what's pushed, never from local unpushed commits; set `worktree.baseRef: "head"` only when a run must build on local work.

## Still unverified
- Haiku 5.5 is announced "in the coming weeks" and Haiku 4.5's earliest retirement date is Oct 15, 2026, so the `haiku` alias will likely move to 5.5. Pin `claude-haiku-4-5-20251001` only if you specifically want 4.5.

## Sources
- code.claude.com/docs/en/ — workflows, model-config, sub-agents, prompt-caching, costs, settings-reference, statusline, errors, authentication
- raw.githubusercontent.com/anthropics/claude-code/main/CHANGELOG.md (through 2.1.290)
- claude.com/blog/introducing-dynamic-workflows-in-claude-code
- claude.com/blog/claude-model-and-effort-level-in-claude-code
- anthropic.com/claude-opus-5-5
- anthropic.com/claude-sonnet-5-5
- anthropic.com/engineering/multi-agent-research-system
- platform.claude.com/docs/en/about-claude/pricing
- platform.claude.com/docs/en/about-claude/models/overview
- platform.claude.com/docs/en/about-claude/model-deprecations
- support.claude.com articles: 11049741 (Max), 8325606 (Pro), 11145838 (Claude Code with Pro/Max), 15424964 (Fable), 17007452 (limit reset), 9266767 (Team seats), 9797531 (Enterprise)
- anthropic.com/legal/consumer-terms
- Anthropic Usage Policy
