# Deviations from upstream

These are my skills. They started as a fork of [mattpocock/skills](https://github.com/mattpocock/skills), based on the tag in `.upstream-version`, and upstream is now a source I pull from, not a line I stay close to.

**The rule:** a change lands with a named workflow reason, never just to save tokens. Each one gets an entry here and a commit pointing at it. When an upstream release lands, `upstream-watch.yml` opens an issue; walk the release and cherry-pick what's worth having, re-applying the renames below (`implement` → `build`, the grill skills → `grill`, `ask-matt` → `ask`, `setup-matt-pocock-skills` → `setup-imecoulter-skills`) to anything you take.

## Rebranded as mine

**Reason:** I'd rather the repo read as my own set than as a copy of someone else's. The plugin, marketplace, `package.json`, README and LICENSE name me (upstream's MIT notice stays, as the license requires); `ask-matt` is `ask`; docs pages link to each other with relative paths instead of `aihero.dev`, and drop the AI Coding Dictionary links. The install route is this repo's own marketplace.

## Inline for HITL work, workflows for AFK fan-out

**Reason:** I work on a Claude Pro plan. Every sub-agent starts cold and re-reads the repo's `AGENTS.md`, so an unrequested spawn costs a whole extra context, and an agent that names no model runs on Opus. Work that needs me stays inline. Work that doesn't — two or more independent AFK units, such as a ticket wave — goes through `/orchestrate`: counted units, a named model and effort on every agent, an announcement I say "go" to, and budget gates. Its always-on rules (`orchestrate/CORE.md`) are imported by my user `CLAUDE.md`, so they hold in every repo. `research` stays a single background agent, now on a named model.

- **`grill`** — facts are looked up inline, not by dispatching a sub-agent.
- **`code-review`** — the Standards and Spec passes run inline, one after the other, with each report written out in full before the next pass starts. That keeps the two axes separate without two parallel contexts.
- **`improve-codebase-architecture`** — walks the codebase inline instead of through a sub-agent.
- **`codebase-design`** (`DESIGN-IT-TWICE.md`) — the 3+ designs are written one after another, each in full and against only its own constraint, instead of by parallel sub-agents.
- **`wayfinder`** — charting no longer fires a `/research` sub-agent per research ticket. It lists them, and each is resolved when I run `/research` on it.

## Plugin and marketplace named `imecoulter-skills`

**Reason:** so it's obvious in any session which copy is loaded, and upstream can't quietly get installed alongside it and double every skill description. The plugin version carries an `-imecoulter.N` suffix so Claude Code sees each fork release as an update.

## Release workflow replaced by an upstream watch

**Reason:** upstream's `release.yml` versions and tags with changesets, which this fork doesn't publish. `upstream-watch.yml` instead checks upstream's tags weekly and opens an issue when there's a release newer than `.upstream-version`. Nothing merges automatically.

## `implement` renamed to `build`

**Reason:** my own naming standard calls the build step `build`. The skill (`skills/engineering/build`), its docs page (`docs/engineering/build.md`), and `/implement` references across the skills and docs all move to `build`. Links to `aihero.dev/skills-implement` stay, since that is where upstream publishes the page. When merging an upstream release, re-apply the rename to any new `implement` references.

## Changed skills

- **`build`** — model-invoked; branches into a worktree when it starts on the default branch, runs the repo's definition of done, commits before `/code-review`, and ends by running `/close` so the work merges and its ticket closes. **Reason:** I ask for "inspect, implement, merge and close issue N" in plain words, which a user-invoked skill can't answer, and I kept finishing each build by hand.
- **`wayfinder`** — each session lands what it wrote (ADRs, `CONTEXT.md`, research and prototype files) on the default branch with `/close`, and stops by naming the next frontier ticket and the command to take it. Research findings land on the default branch instead of a `research/<name>` branch. **Reason:** I ended a dozen wayfinder sessions with "commit and push so I can start the next one" and "which session next?", and the next session starts from `main`, so a decision left on a branch is invisible to it.
- **`prototype`** — the prototype lands in the repo's prototypes folder on the default branch (never imported, built or deployed) instead of a never-merged `prototype/<name>` branch. **Reason:** every branch I open ends in a merged PR and gets swept, so a never-merged branch is exactly what `/close` would try to land or hand back, and a pointer to a branch breaks when the branch is deleted. Ante Up already works this way.
- **`to-tickets`** — ends by printing the tickets as a run order in waves (each of which can run in parallel), with the command for each wave-1 ticket, and leaves the table as a comment on the parent issue. **Reason:** after every ticket split I asked for "the sequential run order, parallels in waves" and for the order to be written down where the next session would find it.
- **`grill`** replaces `grill-me`, `grill-with-docs` and `grilling`: one model-invoked interview that always runs `/domain-modeling`, so it records `CONTEXT.md` and ADRs as it goes. When asked to "go with your recs", it answers its own rounds and lists every decision for one confirmation at the end. Wayfinder's `grilling` ticket type and `wayfinder:grilling` label stay, and run `/grill`. **Reason:** I never want a grilling session that leaves no docs, three names for one interview is noise, and I often answer whole rounds with "agree all" or ask for a session run on its recommendations.
- **`build`, `to-tickets`, `close`, `ask`** — a wave of two or more tickets is one workflow run through `/orchestrate` (`to-tickets` prints "run wave N" for it, `build` names it, `close` lands a wave in ticket order then smallest diff first, `ask` routes there), and the boundary between waves is `/clear`. **Reason:** I ran each wave as N hand-opened sessions; one announced run with Sonnet builders that stop before merge, landed by one `/close`, is cheaper and leaves me one thing to review.
- **`research`** — the background agent is launched on `sonnet` at medium effort and told to read rather than delegate; many-source questions use `/orchestrate`'s sweep recipe. **Reason:** an unnamed model runs on Opus, and the agent re-delegating to itself is upstream's [#530](https://github.com/mattpocock/skills/issues/530).
- **`diagnosing-bugs`** — independent hypotheses can be tested in parallel through `/orchestrate`; a known-good→bad regression goes straight to `git bisect run`. **Reason:** hypotheses that each change one variable are the clearest AFK fan-out there is.
- **`setup-imecoulter-skills`** (was `setup-matt-pocock-skills`) — also records what a parallel wave needs (worktree setup command, hotspot files, risky areas) in a `## Parallel waves` section of `git-workflow.md`. **Reason:** `/orchestrate` can't split a wave safely without knowing which files collide and what a fresh worktree has to install. Before that, it added a git-workflow section: worktree per branch, PR, merge on green, the sweep, and the repo's definition of done, written to `docs/agents/git-workflow.md` from a seed template. **Reason:** only Ante Up had this written down; in vrlab I had to say "we should be creating PRs" after the fact, and `/build` and `/close` need to know what green means in repos whose PRs run no CI.

## Added skills

Skills that exist only in this fork. Upstream merges can't conflict with them, but check each release for an upstream skill that now covers the same ground.

- **`/close`** (`skills/productivity/close`) — closes a session: finish agreed work, run the repo's definition of done, merge the session's changes into the default branch (opening a PR when there isn't one), close the tickets it resolved, sweep worktrees and branches, and report what needs me first and what to run next. Model-invoked. **Reason:** my sessions end with the same loose ends every time (open PRs, worktrees, background tasks), I ask for it in plain words ("complete outstanding items, open PR, merge") far more often than I type `/close`, and nearly every session ends with me asking when I can move on and what's next.
- **`/orchestrate`** (`skills/engineering/orchestrate`) — chooses inline, one subagent or one workflow run by counting AFK units; names `model` (aliases only) on every agent and `effort` on every Sonnet/Opus one; announces each launch and waits for "go"; applies budget gates on the 5-hour and weekly bars; and carries recipes for ticket waves, PR sweeps, parallel bug hypotheses, wide refactors and research sweeps. `CORE.md` is the always-on part, imported by the user `CLAUDE.md`; `REFERENCE.md` is the verified fact sheet behind it. Model-invoked. The ticket-wave recipe ships as a plugin workflow, `workflows/ticket-wave.js` (`/imecoulter-skills:ticket-wave`), piloted on one ticket before it landed. **Reason:** workflow agents fall back to the session model (Opus) and the bundled authoring skill omits `model` by default, so an unguided fan-out on Pro drains the weekly allowance on the most expensive model; I wanted one written rule set for that, applied in every repo.
