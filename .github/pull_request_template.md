## Summary

Describe the change and why it is needed.

## FIERCE handoff

- Agent/human author: `AGENT: ...`
- Related issue/decision:
- Architecture/ADR impact:
- Deployment impact:

## Validation

- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm test`
- [ ] `npm run build`
- [ ] `npm run verify:static`
- [ ] No source photo upload endpoint was introduced accidentally.
- [ ] No candidate-specific branch was added to `src/image-engine/`.
- [ ] Export dimensions remain deterministic and template-driven.
- [ ] If deployment behavior changed, rollback steps are documented.
- [ ] If schema/invariants changed, docs/ADR were updated.
