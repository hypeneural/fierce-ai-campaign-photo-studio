# Skill: fierce-handoff

Use this skill whenever work moves between ChatGPT, Antigravity and a human owner.

## GitHub message format

Begin the issue or comment with exactly one role marker:

```text
AGENT: CHATGPT
AGENT: ANTIGRAVITY
AGENT: HUMAN
```

Then include:

1. scope;
2. commit SHA/environment;
3. evidence;
4. verified facts;
5. unverified hypotheses;
6. risk/impact;
7. next proposed command/change;
8. rollback;
9. explicit questions for the next role.

## Important

- GitHub is the durable shared memory; chat transcripts are not.
- Never paste secrets or session cookies.
- Separate observation from interpretation.
- A blocker requiring architecture judgement becomes a FIERCE Decision Request.
- A performance claim needs a workload, device/browser and measurement method.
