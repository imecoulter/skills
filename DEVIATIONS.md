# Deviations from upstream

This is imecoulter's fork of [mattpocock/skills](https://github.com/mattpocock/skills), based on the tag in `.upstream-version`.

**The rule:** stay as close to upstream as possible. A change lands only with a named workflow reason — never just to save tokens. Each change gets one entry here and its own commit pointing at the entry. When merging an upstream release, walk this list: keep each entry whose reason still holds, drop the rest.

## Inline by default

**Reason:** I work on a Claude Pro plan. Every sub-agent starts cold and re-reads the repo's `AGENTS.md`, so an unrequested spawn costs a whole extra context. Work happens inline unless I ask for a sub-agent. `research` is the deliberate exception — backgrounded reading is its point.

- **`grilling`** — facts are looked up inline, not by dispatching a sub-agent.
- **`code-review`** — the Standards and Spec passes run inline, one after the other, with each report written out in full before the next pass starts. That keeps the two axes separate without two parallel contexts.

## Plugin and marketplace renamed to `imecoulter-skills`

**Reason:** so it's obvious in any session which copy is loaded, and upstream can't quietly get installed alongside it and double every skill description. The plugin version carries an `-imecoulter.N` suffix so Claude Code sees each fork release as an update.

## Release workflow replaced by an upstream watch

**Reason:** upstream's `release.yml` versions and tags with changesets, which this fork doesn't publish. `upstream-watch.yml` instead checks upstream's tags weekly and opens an issue when there's a release newer than `.upstream-version`. Nothing merges automatically.
