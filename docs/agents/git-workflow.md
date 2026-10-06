# Git workflow

Read this before creating a branch or committing anything.

**Never work in the primary checkout on `main`.** Every branch gets its own worktree, and the primary checkout stays on a clean `main`, pullable at all times — so a half-finished change never sits on it, two agents can work at once without colliding, and "what is on `main`" is always answerable without stashing. It matters more here than in most repos: the user `CLAUDE.md` imports `skills/engineering/orchestrate/CORE.md` from the primary checkout, so whatever sits there is what every session reads.

Worktrees live in `.claude/worktrees/<name>` and nowhere else — where Claude Code's own worktree tooling puts them, and gitignored. `<name>` is the branch's last path segment.

```sh
git worktree add .claude/worktrees/<name> -b <branch>   # new branch
git worktree add .claude/worktrees/<name> <branch>      # existing branch
```

## Every branch ends in a pull request, and dies when it merges

Skills, docs pages, manifests and ADRs all land on `main` by PR. Nothing ever links to a branch.

## Definition of done

`claude plugin validate . --strict` (the marketplace manifest), then `claude plugin validate .claude-plugin/plugin.json` (the plugin and every skill it ships; its one standing warning, `CLAUDE.md` at the plugin root, is expected, which is why this one runs without `--strict`). A check has passed only when you've seen its results. Then confirm by reading: every promoted skill is in `README.md`, its bucket `README.md` and `.claude-plugin/plugin.json`, its docs page exists, and `ask` still routes to it (the rules are in `CLAUDE.md`).

`npm run check-plugin-version` is upstream's changesets check and fails by design here: the plugin version carries an `-imecoulter.N` suffix that `package.json` doesn't.

**PRs have no checks** (the only workflow is `upstream-watch.yml`). Green is the local run above, so run it before opening the PR, not after.

## Landing a branch

1. Work in the worktree. Commit there.
2. Run the definition of done.
3. `gh pr create` from the worktree.
4. **Merge on green** with `gh pr merge --merge --delete-branch` — this repo merges with merge commits and doesn't delete head branches on its own.
5. Run the sweep below from the repo root.
6. A change to anything the plugin ships also bumps the `-imecoulter.N` suffix in `plugin.json`, so installed copies see an update; after the merge, `claude plugin marketplace update imecoulter-skills` and `claude plugin update imecoulter-skills@imecoulter-skills` pull it into this machine's install (loaded from the next session).

`/close` does steps 2–5 at the end of a session.

## Parallel waves

Two or more independent tickets run as one workflow (`/orchestrate`), each builder in its own worktree, stopping before merge; one `/close` lands the wave.

- **Worktree setup:** none — nothing here is built or installed.
- **Hotspots:** `README.md`, `skills/<bucket>/README.md`, `.claude-plugin/plugin.json`, `skills/engineering/ask/SKILL.md` and `DEVIATIONS.md` — nearly every skill change touches them. Builders leave these alone and report the lines they need; the edits land once, inline, at `/close`.
- **Risky areas** (reviewed by an opus reviewer before landing): `.claude-plugin/*.json` — a broken manifest breaks the install in every repo that enables the plugin.

## The sweep

Run after every merge, and at the start of any session that pulls `main`:

```sh
# from the repo root, on main
git pull --prune
git worktree prune
for wt in .claude/worktrees/*/; do
  [ -e "$wt/.git" ] || { rmdir "$wt" 2>/dev/null; continue; }
  b=$(git -C "$wt" branch --show-current)
  git branch -vv | grep -q "^[+*] $b .*: gone]" && git worktree remove "$wt"
done
git branch -vv | awk '/: gone]/ { sub(/^[+*]/, ""); print $1 }' | xargs -r git branch -d
```

It only removes what is merged or already gone from the remote. Two refusals are the point, not errors to route around:

- **`git worktree remove` refuses a worktree with uncommitted changes.** Report it; never `--force`.
- **`git branch -d` refuses a branch not merged into `main`.** Report it; never `-D`.
