# Git workflow

Read this before creating a branch or committing anything.

**Never work in the primary checkout on `<default>`.** Every branch gets its own worktree, and the primary checkout stays on a clean `<default>`, pullable at all times — so a half-finished change never sits on it, two agents can work at once without colliding, and "what is on `<default>`" is always answerable without stashing.

Worktrees live in `.claude/worktrees/<name>` and nowhere else — where Claude Code's own worktree tooling puts them, and gitignored. `<name>` is the branch's last path segment.

```sh
git worktree add .claude/worktrees/<name> -b <branch>   # new branch
git worktree add .claude/worktrees/<name> <branch>      # existing branch
```

## Every branch ends in a pull request, and dies when it merges

Code, ADRs, docs, research findings and prototypes all land on `<default>` by PR. Nothing ever links to a branch: research lives in `<research-dir>`, prototypes in `<prototypes-dir>`, and the ticket links to the file on `<default>`.

## Definition of done

`<check-command>` — <what it runs>. A check has passed only when you've seen its results.

<one of:>
- PRs run `<ci-checks>`; **green** means those pass, on top of the local run.
- **PRs have no checks.** Green is the local run above, so run it before opening the PR, not after.

## Landing a branch

1. Work in the worktree. Commit there.
2. Run the definition of done.
3. `gh pr create` from the worktree.
4. **Merge on green.** Never merge with a failing check.
5. Run the sweep below from the repo root.

`/close` does steps 2–5 at the end of a session.

## The sweep

Run after every merge, and at the start of any session that pulls `<default>`:

```sh
# from the repo root, on <default>
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
- **`git branch -d` refuses a branch not merged into `<default>`.** Report it; never `-D`.
