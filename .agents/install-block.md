# The canonical install block

One install story, one wording. `README.md` says **this** and nothing else. Change it here first, then propagate.

The plugin installs from this repo's own marketplace (`.claude-plugin/marketplace.json`). It is not in Claude Code's official marketplace, so the marketplace is added first.

## Claude Code — the plugin

<canonical-block name="claude-code">

From inside a Claude Code session:

```
/plugin marketplace add imecoulter/skills
/plugin install imecoulter-skills@imecoulter-skills
```

Or enable it for everyone who opens a repo, in that repo's `.claude/settings.json`:

```json
{
  "extraKnownMarketplaces": {
    "imecoulter-skills": {
      "source": { "source": "github", "repo": "imecoulter/skills" }
    }
  },
  "enabledPlugins": {
    "imecoulter-skills@imecoulter-skills": true
  }
}
```

</canonical-block>

## Codex, and other agents — skills.sh

The plugin is Claude Code only. Everywhere else, [skills.sh](https://skills.sh) copies editable skill files into the project:

<canonical-block name="skills-sh-whole-set">

```bash
npx skills@latest add imecoulter/skills
```

Pick the skills you want, and make sure `setup-imecoulter-skills` is one of them.

</canonical-block>

## The two routes are exclusive

The plugin is a managed, read-only bundle. skills.sh writes files you own and edit. Installing both leaves every skill twice, so always say "pick one".
