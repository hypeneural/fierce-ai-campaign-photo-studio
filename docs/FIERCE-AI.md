# FIERCE AI Operating Model

FIERCE AI is the collaboration protocol for humans and coding agents working in this repository.

## Purpose

Keep architecture, performance, privacy, validation and deployment decisions visible in GitHub instead of hiding them inside one agent session.

## Roles

### ChatGPT — Architecture & Performance Lead

ChatGPT is the review/coordination role for this repository when invoked by the project owner.

Responsibilities:
- protect the architecture in `AGENTS.md` and the ADRs;
- review performance, privacy and security tradeoffs;
- review findings produced by validation agents;
- convert recurring findings into ADRs, tests or repository rules;
- identify regressions, duplicate implementations and unnecessary infrastructure;
- require evidence before accepting server/environment claims;
- keep the public image editor local-first unless an ADR explicitly changes that decision.

ChatGPT does **not** silently deploy, merge, monitor GitHub continuously, or make decisions outside an active user request. GitHub issues are the durable mailbox between sessions.

### Antigravity — Execution & Validation Agent

Antigravity is the implementation and environment-validation role.

Responsibilities:
- run repository checks locally and on authorized infrastructure;
- reproduce bugs and attach exact commands/output;
- validate Plesk, DNS, TLS, Git deployment and static artifacts;
- inspect image-processing behavior in real browsers;
- make small, reversible changes on a branch;
- open a GitHub issue when an architecture decision is required rather than silently changing the design;
- submit PRs with test evidence and rollback notes.

Antigravity must not expose credentials, copy secrets into issues, or run destructive server commands unless the human owner explicitly approves them.

### Human Owner — Authority and Production Gate

The repository owner:
- controls credentials and production access;
- approves destructive infrastructure changes;
- decides when a PR is merged and when production deploy occurs;
- resolves product/content questions that are not engineering questions.

## GitHub is the shared memory

Use GitHub issues and PRs as the protocol between agents.

Every agent comment should begin with one of:

```text
AGENT: CHATGPT
AGENT: ANTIGRAVITY
AGENT: HUMAN
```

Use these issue types:

- **FIERCE / Finding** — reproducible technical observation.
- **FIERCE / Decision Request** — architecture/security/performance decision required.
- **FIERCE / Performance** — performance budget or regression.
- **FIERCE / Deployment** — Plesk/Git/DNS/TLS/deployment issue.
- **FIERCE / Security** — security or privacy concern. Never include secrets.

## Evidence contract

A technical finding is not considered verified until it includes:

1. environment and date;
2. exact command or browser action;
3. relevant output, screenshot or log excerpt;
4. expected behavior;
5. actual behavior;
6. impact;
7. proposed next action;
8. whether the action is read-only, reversible or destructive.

## Decision protocol

For material changes:

1. Antigravity opens a Decision Request.
2. ChatGPT reviews the evidence and maps the change to architecture/performance/security constraints.
3. If the decision changes a long-lived invariant, create an ADR under `docs/adr/`.
4. Implementation happens in a branch/PR.
5. CI and environment validation must pass.
6. Human owner authorizes production deployment.

## Performance budgets

Initial budgets for the public editor:

- no public-photo network upload in the normal generation flow;
- no final export via DOM screenshotting;
- target export dimensions must match the template exactly;
- decode the selected photo once per editing session where feasible;
- do not repeatedly encode PNG/JPEG during drag/zoom interaction;
- maintain responsive interaction while exporting a 1080×1920 image on a mid-range mobile device;
- avoid source images remaining at extreme megapixel sizes when a safe downscale can preserve the final output.

Budgets should become measured thresholds after browser benchmarks are captured.

## Production rule

`main` is source. The `plesk` branch, when enabled, is generated deployment output only and must never be edited by hand.
