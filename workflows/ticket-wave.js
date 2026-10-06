export const meta = {
  name: 'ticket-wave',
  description: 'Build a wave of independent tickets in parallel worktrees (Sonnet builders that stop before merge), then hand back one table for /close',
  whenToUse: 'A wave of ready, independent tickets printed by /to-tickets. Pass ticket numbers; prefix risky ones (auth, money, data, migrations) with risky: for an Opus review.',
  phases: [
    { title: 'Build', detail: 'one sonnet/medium builder per ticket, each in its own worktree' },
    { title: 'Review', detail: 'opus/low read-only /code-review of each risky ticket', model: 'opus' },
  ],
}

// args: {tickets: [{id, ref?, risky?}], base?}, an array of ids, or a raw slash string like "12 13 risky:14"
function parseArgs(a) {
  const norm = t => (t && typeof t === 'object') ? { ...t, id: String(t.id).replace(/^#/, '') } : { id: String(t).replace(/^#/, '') }
  if (a && typeof a === 'object' && Array.isArray(a.tickets)) return { base: a.base || null, tickets: a.tickets.map(norm) }
  if (Array.isArray(a)) return { base: null, tickets: a.map(norm) }
  const tickets = []
  for (const tok of (typeof a === 'string' ? a : '').split(/[\s,]+/).filter(Boolean)) {
    const risky = /^risky:/i.test(tok)
    const id = tok.replace(/^risky:/i, '').replace(/^#/, '')
    if (id) tickets.push({ id, risky })
  }
  return { base: null, tickets }
}

const { base, tickets } = parseArgs(args)
if (!tickets.length) return { error: 'No tickets given. Example: /ticket-wave 12 13 risky:14' }
if (tickets.length > 9) log(`${tickets.length} tickets is over the largest cap (9); /orchestrate splits a wave this size into several runs.`)

const fixedPoint = base ? base : 'the commit you recorded as env.startSha'

const BUILDER = {
  type: 'object',
  required: ['id', 'status', 'branch', 'head', 'checks', 'review', 'notes', 'env'],
  properties: {
    id: { type: 'string' },
    status: { type: 'string', enum: ['green', 'red', 'blocked', 'failed'] },
    branch: { type: 'string' },
    head: { type: 'string' },
    checks: {
      type: 'object', required: ['command', 'passed', 'outputSeen'],
      properties: { command: { type: 'string' }, passed: { type: 'boolean' }, outputSeen: { type: 'boolean' } },
    },
    review: {
      type: 'object', required: ['standards_n', 'spec_n', 'worst'],
      properties: { standards_n: { type: 'integer' }, spec_n: { type: 'integer' }, worst: { type: 'string' } },
    },
    notes: { type: 'string', description: 'Three lines or fewer.' },
    env: {
      type: 'object', required: ['startSha', 'skillTool', 'coreRules'],
      properties: {
        startSha: { type: 'string' },
        skillTool: { type: 'string', enum: ['used', 'unavailable'] },
        coreRules: { type: 'boolean' },
      },
    },
  },
}

const REVIEWER = {
  type: 'object',
  required: ['id', 'verdict', 'findings_n', 'worst'],
  properties: {
    id: { type: 'string' },
    verdict: { type: 'string', enum: ['land', 'fix-first'] },
    findings_n: { type: 'integer' },
    worst: { type: 'string' },
  },
}

// Shared part first and identical across siblings, so they share the prompt cache.
const SHARED = `You are a builder in a ticket wave run by /orchestrate.

Your isolated worktree is your /build worktree. Rename its branch to the repo convention (docs/agents/git-workflow.md; without one, <ticket-number>-<short-slug>) and create no other worktree. The acceptance criteria are the pre-agreed seams. If you need another seam, return blocked with the proposed seam in notes. Run /build steps 1-4, running /code-review with fixed point ${fixedPoint} and the ticket as spec. Stop after the review fixes are committed; the human asked to stop before merging. Push nothing, open no PR, and leave the default branch alone.

Before changing anything, record \`git rev-parse HEAD\` as env.startSha. Invoke build, tdd and code-review with the Skill tool and set env.skillTool to "used"; if the Skill tool is unavailable, read each SKILL.md under ~/.claude/plugins/cache/imecoulter-skills/ (newest version folder) plus the files it links, follow it, and set env.skillTool to "unavailable". Set env.coreRules to true only if your loaded instructions contain a section titled "Workflow-first: the always-on rules".

The definition of done and any worktree setup it needs are in docs/agents/git-workflow.md (else AGENTS.md or CLAUDE.md). Run the setup, then the definition of done once at the end; checks.passed is true only if you saw its results. Where git-workflow.md names hotspot files builders leave alone, leave them and name the lines you need in notes.

Status: green = checks passed and review fixes committed; red = checks fail; blocked = needs a human decision or a new seam; failed = could not finish.`

const unit = t => `Ticket: #${t.id}${t.ref ? ` (${t.ref})` : ''}. Read it through the repo's issue tracker (docs/agents/issue-tracker.md) and build exactly that.`

const review = (r, t) => `Read-only review of a risky change (auth, money, data or migrations). Run /code-review on ${base || r.env.startSha}...${r.branch} with ticket #${t.id} as the spec, working only from git diff and git show in the current checkout: edit, commit and check out nothing. Weigh the risky area first. Verdict land, or fix-first when a finding must be fixed before merge.`

phase('Build')
const results = await pipeline(
  tickets,
  t => agent(`${SHARED}\n\n${unit(t)}`, {
    label: `build #${t.id}`, phase: 'Build', model: 'sonnet', effort: 'medium', isolation: 'worktree', schema: BUILDER,
  }),
  (r, t) => {
    if (!r) return { id: t.id, status: 'failed' }
    if (!t.risky || r.status !== 'green') return r
    return agent(review(r, t), { label: `review #${t.id}`, phase: 'Review', model: 'opus', effort: 'low', schema: REVIEWER })
      .then(v => ({ ...r, opusReview: v || { id: t.id, verdict: 'failed' } }))
  },
)

const units = results.map((r, i) => r || { id: tickets[i].id, status: 'failed' })
const checksCell = r => !r.checks ? '—' : (r.checks.passed && r.checks.outputSeen ? `pass (${r.checks.command})` : `FAIL (${r.checks.command})`)
const worstCell = r => r.opusReview ? `opus: ${r.opusReview.verdict}, ${r.opusReview.worst}` : (r.review ? r.review.worst : '—')
const table = [
  '| unit | status | branch | checks | worst finding |',
  '|---|---|---|---|---|',
  ...units.map(r => `| #${r.id} | ${r.status} | ${r.branch || '—'} | ${checksCell(r)} | ${worstCell(r)} |`),
].join('\n')

return { table, units }
