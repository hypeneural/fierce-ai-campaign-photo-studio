# Skill: plesk-deployment

Use this skill for DNS, TLS, Plesk Git, static deployment or server-environment work.

## Read first

- `AGENTS.md`
- `docs/FIERCE-AI.md`
- `docs/operations/PLESK.md`
- latest file under `docs/audits/`

## Architecture invariant

The public editor is deployed to the current Plesk host as static output from `next build` with `output: "export"`.

Do not attempt to run the Next.js application through Passenger as the default deployment model.

## Procedure

1. Read-only validation first.
2. Prove DNS authority/delegation before DNS edits.
3. Prove TLS/HTTPS before deployment.
4. Build outside production hosting where possible.
5. Verify `out/` with `npm run verify:static`.
6. Deploy manually first.
7. Verify production artifact and browser behavior.
8. Test rollback.
9. Only then consider webhook/automatic deployment.

## Prohibited without explicit human approval

- deleting DNS records;
- changing authoritative NS delegation;
- deleting the current document root;
- `rsync --delete` against production;
- service restarts;
- firewall changes;
- recursive permission/ownership changes;
- replacing certificates;
- destructive Git force operations on `main`.

The generated `plesk` branch is the only branch intentionally force-rewritten by CI.
