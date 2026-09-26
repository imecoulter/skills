---
name: grill
description: Grill the user relentlessly about a plan, decision, or idea, a round of questions at a time, recording the domain language and hard decisions (CONTEXT.md, ADRs) as it goes. Use when the user wants to stress-test their thinking or sharpen a plan or design, or uses any 'grill' trigger phrase.
---

Interview the user relentlessly until you reach a shared understanding. Run the `/domain-modeling` skill throughout: sharpen terms against `CONTEXT.md` and record hard-to-reverse decisions as ADRs inline, as they're settled. Map this as a **design tree**: every decision branches into the decisions that hang off it.

Work the tree in **rounds**. The **frontier** is every decision whose prerequisites are already settled — the questions you can ask _now_ without guessing at answers you haven't heard yet. Ask the whole frontier in one round: number each question and give your recommended answer. Then wait for the user's answers before the next round.

Each question should be formatted like so:

```
❓ **Q1** - **<question title>**: <question body, might be multiple paragraphs, including multiple choices>

➡️ <your recommended answer>
```

Each round the user answers reshapes the tree — settled decisions push the frontier outward and unblock questions that depended on them. Recompute the frontier and ask the next round. A question whose answer depends on another question still open in this round belongs to a _later_ round, not this one.

Finding _facts_ is your job, never the user's. When a frontier question needs a fact from the environment (filesystem, tools, etc.), look it up yourself, inline — don't ask the user for anything you could look up yourself, and don't dispatch a sub-agent unless the user asks for one. Keep the lookup cheap: measure or grep rather than reading whole files. The _decisions_ are the user's — put each to them and wait.

If the user asks you to run the whole session on your recommendations ("go with your recs", "don't ask me"), answer each round yourself with your recommended answer and keep working the tree. At the end, list every decision you made, numbered, so the user can confirm or overturn any of them in one reply.

The session is done when the frontier is empty: every branch of the design tree visited, nothing left silently assumed. Do not act on it until the user confirms you have reached a shared understanding.
