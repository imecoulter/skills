# imecoulter skills

The agent skills I build software with. Agents write most of my code, so every skill here is aimed at one thing: a fresh session that gets the work right without me re-explaining it. Plan by interview, build in its own worktree, land it on `main`, and say what's next.

They started as a fork of [Matt Pocock's skills](https://github.com/mattpocock/skills) and are now shaped around how I work. [DEVIATIONS.md](./DEVIATIONS.md) records what's different from upstream and why.

## Install

**Claude Code.** From inside a Claude Code session:

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

**Codex, and other agents.** [skills.sh](https://skills.sh) copies editable skill files into the project:

```bash
npx skills@latest add imecoulter/skills
```

Pick the skills you want, and make sure `setup-imecoulter-skills` is one of them.

Pick one route. Installing both leaves every skill twice.

Then, in each repo, run `/setup-imecoulter-skills` once. It records where issues live, how the domain docs are laid out, and how a branch lands on `main`, including the one command that counts as green.

## How a change goes

1. **[`/grill`](./skills/productivity/grill/SKILL.md)** the idea. It asks a round of questions at a time, each with a recommended answer, and writes the settled vocabulary and hard decisions into `CONTEXT.md` and ADRs as it goes. Say "go with your recs" and it answers itself, then lists every decision for you to check.
2. If the build spans sessions, **[`/to-spec`](./skills/engineering/to-spec/SKILL.md)** writes it up and **[`/to-tickets`](./skills/engineering/to-tickets/SKILL.md)** splits it into tickets, printed as waves you can run in parallel.
3. **[`/build #n`](./skills/engineering/build/SKILL.md)**, one ticket per session. It branches into a worktree, works test-first, runs the checks and a review, then lands the ticket.
4. **[`/close`](./skills/productivity/close/SKILL.md)** ends every session that changed something. It merges the work into `main` through a PR, closes the tickets, sweeps the worktrees, and tells you what needs you and what to run next.

Too big to hold in one session? **[`/wayfinder`](./skills/engineering/wayfinder/SKILL.md)** charts it as a map of decision tickets first. Bug reports arriving from other people go through **[`/triage`](./skills/engineering/triage/SKILL.md)**. Not sure where you are? **[`/ask`](./skills/engineering/ask/SKILL.md)**.

`build`, `close` and `grill` are model-invoked, so "build #42", "grill me on this" and "open a PR and merge" work in plain words.

## Reference

Skills split on who can start them. **User-invoked** skills run only when you type them (e.g. `/handoff`). **Model-invoked** skills run when you type them _or_ when the agent sees the task fits, so asking in plain words works. A user-invoked skill can call model-invoked ones, never another user-invoked one.

### Engineering

Daily code work.

**User-invoked**

- **[ask](./skills/engineering/ask/SKILL.md)** — Ask which skill or flow fits your situation. A router over every skill in this repo.
- **[triage](./skills/engineering/triage/SKILL.md)** — Move issues through a state machine of triage roles.
- **[improve-codebase-architecture](./skills/engineering/improve-codebase-architecture/SKILL.md)** — Scan a codebase for deepening opportunities, present them as a visual HTML report, then grill through whichever one you pick.
- **[setup-imecoulter-skills](./skills/engineering/setup-imecoulter-skills/SKILL.md)** — Configure a repo for the engineering skills: issue tracker, triage labels, domain doc layout, and git workflow with its definition of done. Run once per repo.
- **[to-spec](./skills/engineering/to-spec/SKILL.md)** — Turn the current conversation into a spec and publish it to the issue tracker. No interview — just synthesizes what you've already discussed.
- **[to-tickets](./skills/engineering/to-tickets/SKILL.md)** — Break any plan, spec, or conversation into a set of tracer-bullet tickets, each declaring its blocking edges — written as text in a local file, or as native blocking links on a real tracker.
- **[wayfinder](./skills/engineering/wayfinder/SKILL.md)** — Plan a huge chunk of work, more than one agent session can hold, as a shared map of decision tickets on the issue tracker — resolve them one at a time until the way to the destination is clear.

**Model-invoked**

- **[prototype](./skills/engineering/prototype/SKILL.md)** — Build a throwaway prototype to answer a design question — a single shareable HTML file for state/logic questions, or several radically different UI variations toggleable from one route.
- **[diagnosing-bugs](./skills/engineering/diagnosing-bugs/SKILL.md)** — Disciplined diagnosis loop for hard bugs and performance regressions: build a feedback loop that goes red on this bug → minimise → hypothesise → instrument → fix → regression-test.
- **[research](./skills/engineering/research/SKILL.md)** — Investigate a question against high-trust primary sources and capture the findings as a cited Markdown file in the repo, run as a background agent.
- **[tdd](./skills/engineering/tdd/SKILL.md)** — Test-driven development with a red-green-refactor loop. Builds features or fixes bugs one vertical slice at a time.
- **[domain-modeling](./skills/engineering/domain-modeling/SKILL.md)** — Actively build and sharpen a project's domain model — challenge terms against the glossary, stress-test with edge-case scenarios, and update `CONTEXT.md` and ADRs inline.
- **[codebase-design](./skills/engineering/codebase-design/SKILL.md)** — Shared discipline and vocabulary for designing deep modules: a lot of behaviour behind a small interface, placed at a clean seam, testable through that interface.
- **[code-review](./skills/engineering/code-review/SKILL.md)** — Two-axis review of the diff since a fixed point: **Standards** (does it follow the repo's coding standards, plus a Fowler smell baseline?) and **Spec** (does it faithfully implement the originating issue/spec?), run one after the other, inline.
- **[resolving-merge-conflicts](./skills/engineering/resolving-merge-conflicts/SKILL.md)** — Work through an in-progress git merge or rebase conflict hunk by hunk, resolving by intent traced to each side's primary source, then finish the operation — never `--abort`.
- **[wizard](./skills/engineering/wizard/SKILL.md)** — Generate an interactive bash wizard that walks a human through steps only they can perform: provisioning infrastructure, setting up credentials or CI secrets, walking an unfamiliar third-party dashboard, or running a one-off migration or cutover.
- **[build](./skills/engineering/build/SKILL.md)** — Build a ticket, spec or agreed plan in its own worktree, driving `/tdd` at pre-agreed seams and `/code-review` before landing it on the default branch through `/close`.

### Productivity

Workflow tools that aren't code-specific.

**User-invoked**

- **[handoff](./skills/productivity/handoff/SKILL.md)** — Compact the current conversation into a handoff document so another agent can continue the work.
- **[teach](./skills/productivity/teach/SKILL.md)** — Teach the user a new skill or concept over multiple sessions, using the current directory as a stateful teaching workspace.
- **[to-questionnaire](./skills/productivity/to-questionnaire/SKILL.md)** — Turn a decision you can't answer alone into a Markdown questionnaire for the one person who can — filled in async, or together over a meeting. It grills you about the send (who it's for, what you need back), not the subject.
- **[wait-what](./skills/productivity/wait-what/SKILL.md)** — Fire this the moment a message doesn't land. The agent re-pitches it with the context you're missing, in plain English, using your `CONTEXT.md` vocabulary.

**Model-invoked**

- **[writing-for-agents](./skills/productivity/writing-for-agents/SKILL.md)** — Writing documents for agents: skills, AGENTS.md/CLAUDE.md, and any doc an agent reaches by a pointer.
- **[close](./skills/productivity/close/SKILL.md)** — Close out the session: finish agreed work, run the repo's checks, merge the session's changes into the default branch, close their tickets, sweep worktrees and branches, and report what needs you and what's next.
- **[grill](./skills/productivity/grill/SKILL.md)** — Get grilled relentlessly about a plan, decision or idea, a round of questions at a time, with the domain language and hard decisions recorded in `CONTEXT.md` and ADRs as they're settled.
