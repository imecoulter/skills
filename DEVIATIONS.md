# Deviations from upstream

This is imecoulter's fork of [mattpocock/skills](https://github.com/mattpocock/skills), based on the tag in `.upstream-version`.

**The rule:** stay as close to upstream as possible. A change lands only with a named workflow reason — never just to save tokens. Each change gets one entry here and its own commit pointing at the entry. When merging an upstream release, walk this list: keep each entry whose reason still holds, drop the rest.

## Inline by default

**Reason:** I work on a Claude Pro plan. Every sub-agent starts cold and re-reads the repo's `AGENTS.md`, so an unrequested spawn costs a whole extra context. Work happens inline unless I ask for a sub-agent. `research` is the deliberate exception — backgrounded reading is its point.

- **`grilling`** — facts are looked up inline, not by dispatching a sub-agent.
- **`code-review`** — the Standards and Spec passes run inline, one after the other, with each report written out in full before the next pass starts. That keeps the two axes separate without two parallel contexts.
- **`improve-codebase-architecture`** — walks the codebase inline instead of through a sub-agent.
- **`codebase-design`** (`DESIGN-IT-TWICE.md`) — the 3+ designs are written one after another, each in full and against only its own constraint, instead of by parallel sub-agents.
- **`wayfinder`** — charting no longer fires a `/research` sub-agent per research ticket. It lists them, and each is resolved when I run `/research` on it.

## Plugin and marketplace renamed to `imecoulter-skills`

**Reason:** so it's obvious in any session which copy is loaded, and upstream can't quietly get installed alongside it and double every skill description. The plugin version carries an `-imecoulter.N` suffix so Claude Code sees each fork release as an update.

## Release workflow replaced by an upstream watch

**Reason:** upstream's `release.yml` versions and tags with changesets, which this fork doesn't publish. `upstream-watch.yml` instead checks upstream's tags weekly and opens an issue when there's a release newer than `.upstream-version`. Nothing merges automatically.

## `implement` renamed to `build`

**Reason:** my own naming standard calls the build step `build`. The skill (`skills/engineering/build`), its docs page (`docs/engineering/build.md`), and `/implement` references across the skills and docs all move to `build`. Links to `aihero.dev/skills-implement` stay, since that is where upstream publishes the page. When merging an upstream release, re-apply the rename to any new `implement` references.

## Changed skills

- **`build`** — model-invoked; branches into a worktree when it starts on the default branch, runs the repo's definition of done, commits before `/code-review`, and ends by running `/close` so the work merges and its ticket closes. **Reason:** I ask for "inspect, implement, merge and close issue N" in plain words, which a user-invoked skill can't answer, and I kept finishing each build by hand.
- **`wayfinder`** — each session lands what it wrote (ADRs, `CONTEXT.md`, research and prototype files) on the default branch with `/close`, and stops by naming the next frontier ticket and the command to take it. Research findings land on the default branch instead of a `research/<name>` branch. **Reason:** I ended a dozen wayfinder sessions with "commit and push so I can start the next one" and "which session next?", and the next session starts from `main`, so a decision left on a branch is invisible to it.
- **`prototype`** — the prototype lands in the repo's prototypes folder on the default branch (never imported, built or deployed) instead of a never-merged `prototype/<name>` branch. **Reason:** every branch I open ends in a merged PR and gets swept, so a never-merged branch is exactly what `/close` would try to land or hand back, and a pointer to a branch breaks when the branch is deleted. Ante Up already works this way.
- **`to-tickets`** — ends by printing the tickets as a run order in waves (which can run in parallel sessions), with the command for each wave-1 ticket, and leaves the table as a comment on the parent issue. **Reason:** after every ticket split I asked for "the sequential run order, parallels in waves" and for the order to be written down where the next session would find it.
- **`grill`** replaces `grill-me`, `grill-with-docs` and `grilling`: one model-invoked interview that always runs `/domain-modeling`, so it records `CONTEXT.md` and ADRs as it goes. When asked to "go with your recs", it answers its own rounds and lists every decision for one confirmation at the end. Wayfinder's `grilling` ticket type and `wayfinder:grilling` label stay, and run `/grill`. **Reason:** I never want a grilling session that leaves no docs, three names for one interview is noise, and I often answer whole rounds with "agree all" or ask for a session run on its recommendations.

## Added skills

Skills that exist only in this fork. Upstream merges can't conflict with them, but check each release for an upstream skill that now covers the same ground.

- **`/close`** (`skills/productivity/close`) — closes a session: finish agreed work, run the repo's definition of done, merge the session's changes into the default branch (opening a PR when there isn't one), close the tickets it resolved, sweep worktrees and branches, and report what needs me first and what to run next. Model-invoked. **Reason:** my sessions end with the same loose ends every time (open PRs, worktrees, background tasks), I ask for it in plain words ("complete outstanding items, open PR, merge") far more often than I type `/close`, and nearly every session ends with me asking when I can move on and what's next.
