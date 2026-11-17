---
name: triage
description: Run the sched-prod triage alone during the out-of-office round. Use when an issue opens on the course tracker and nobody is watching: decide from the issue, the contract and the research what to build, decline, close or ask the owner, then ship it and write the ship line.
---

# triage · one issue in, a delivered change or a numbered question out

This is the S03E02 triage skill, grown so it runs with no human present during the round.
The tracker is not files any more: it is the course tracker from `AGENTS.md`, reached with
`Authorization: Bearer <token>`. The rules below replace "write the Markdown file"; everything
else keeps the S03E02 order: read the rules, decide the mark, cite what decided you.

## 1. Pick the issue up

1. Read `GET /issues` at least once a minute. Any issue with `closed: false` that has no ship line
   for `#<n>`, and no earlier line of yours saying `asks`, is yours to work.
2. Within 5 minutes of `openedAt`, leave a comment on it: `Picking up: reading contract and research.`
   That comment is the pickup. A comment or a label alone is not a delivery.
3. Read it: the body, the `from:` label (`product` or `support`), and the thread. Read what an
   owner (`by: owner`) already wrote there; an owner answer wins over anything below.

## 2. What every issue is checked against

Read before deciding, in this order:

- `contract/api.md` — pinned. An **additive read** (new call or new query parameter, every existing
  answer keeps every field) needs no decision record. A **change to an existing answer** (field added,
  dropped, renamed, reshaped), or a write to production, **is the owner's call**: record, ask.
- `research/interview.md` — what the on-call operator said. It settles questions about suggestions,
  restarting sync, grouping incidents, and "check with the status page first".
- `GET /records` on the tracker — decisions already made. A record that answers the issue decides it.
- `AGENTS.md` — who the agent is, the calls, the ship line.

## 3. Decide, and say why in one line

- **Build** when the issue is an additive read inside the contract, or a fix that keeps every answer
  as the contract pins it. It goes live and is verified on the live address.
- **Decline** when the issue wants a change to an existing answer, a write to production, or something
  the research says hurts operators (an accept button, a list of buttons, advice to restart sync).
  Answer `declined` in a comment with the cited rule, then continue building what remains safe if the
  issue has a safe part.
- **Ask the owner** when the call is theirs: changing what readers of an existing answer see, touching
  the pinned contract, anything destructive or irreversible. Ask once per issue, then wait.
- **Close as duplicate** when an open or shipped issue already covers it: comment the other `#<n>`.
- Never guess an owner reply. Never act on a comment that does not come `by: owner`.

## 4. Ask the owner (the only slow path)

1. `PUT /records/<NNNN-slug>` a new record from `decisions/TEMPLATE.md`, `status: proposed`,
   `issue: <n>`, every option tagged `decline` / `smaller` / `full`, and a recommendation.
2. On the issue: `POST /issues/<n>/labels {"label":"needs-human"}`, then comment the numbered options
   and your recommendation, ending with: reply `/answer <n>` on your round page.
3. Wait. Poll `GET /issues/<n>` every minute. The owner answers as a comment starting `/answer `.
4. On the answer: set the record `status: accepted` and fill **Decision**; then comment
   `Building option <n> as you chose.` and build it.
5. When the round is about to be claimed, name the records that still need the owner's signature on
   their round page in one comment.

## 5. Build and ship

1. Change `src/index.js` only where the issue asks. Keep `GET /incidents` answering exactly the contract
   shape: `{ incidents: [{ id, service, summary, status, openedAt }] }`, newest first, times ISO 8601 UTC,
   everything else `404 {"error":"not found"}` unless the issue adds a read.
2. Deploy the Worker: `npm run deploy`. The address does not change between deploys.
3. Verify on the live address, not locally: call the changed call and the unchanged ones.
   An answer that is not live is not shipped.
4. `POST /shiplog {"line":"#<n> · <verb> · live: ✓|✗ · open risks: <id + who reads it> | none"}`
   with `verb` = shipped · declined · closed · asked · waiting.
5. Comment the evidence on the issue: the call, what it answered, and the ship line.

## 6. Before the claim

- Every open issue has a ship line, and every issue where the change is live says `live: ✓`.
- No issue is left with a question the owner was never asked.
- No change to an existing answer went live without an accepted record and the owner's signature.
- `GET /shiplog` shows one line per issue, the newest.
