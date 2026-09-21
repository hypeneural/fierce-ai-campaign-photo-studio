# Forensic hosting audit — 2026-09-20

Scope: deployment feasibility for Campaign Photo Studio on `apoio.etijucas.com.br`, based on supplied Plesk screenshots and the SSH diagnostic summary supplied by the infrastructure owner.

## Verified from supplied screenshots

### Plesk Git extension

The Git screen for `apoio.etijucas.com.br` is available and currently has no repository connected. This confirms that the subscription exposes Plesk's Git workflow and is ready for a remote repository to be added.

### DNS zone shape

The DNS screen shows a standalone zone for `apoio.etijucas.com.br`, including:

- `apoio.etijucas.com.br A 186.209.113.134`
- `www.apoio.etijucas.com.br CNAME apoio.etijucas.com.br`
- zone apex NS records pointing to `ns1.apoio.etijucas.com.br` and `ns2.apoio.etijucas.com.br`
- multiple `nsN.apoio...` A records to unrelated public IPs
- mail/MX/SPF/DMARC entries copied into the subdomain zone.

This is more DNS surface than a static application subdomain requires. Before deleting or disabling anything, public delegation must be checked with `dig +trace`.

## Supplied SSH/environment findings accepted as observations pending agent reproduction

The infrastructure owner reports:

- CloudLinux 8 / CageFS / chroot shell;
- Nginx reverse proxy + Apache backend;
- PHP 8.3 web runtime;
- Plesk Node 20 and 22 installed under `/opt/plesk/node/`;
- Git 2.43.x;
- shared-storage write throughput around 12 MB/s;
- Node is not in the default SSH PATH;
- `apoio.etijucas.com.br` document root is under its Plesk vhost directory.

Antigravity must reproduce the relevant read-only checks before these are treated as current verified facts.

## Architecture impact

### Critical finding: do not use managed Next.js runtime in Plesk

Plesk's current knowledge base says Next.js is not officially supported as a Plesk-managed runtime. The public studio does not require SSR or API routes to perform its core image work, so production should use `output: "export"` and serve static assets.

Severity: architectural / high.

### Strong fit: static local-first editor

The current browser-first design has unusually good compatibility with this hosting environment:

- no image-processing backend required;
- no PHP memory/upload limits affect normal photo generation;
- no long-running Node process is required;
- Apache/Nginx only serve static assets;
- photo privacy is improved because the source photo need not transit the server.

### Build location

Because the server is shared, chrooted and reported to have relatively slow write throughput, build on GitHub Actions rather than on production hosting. Plesk should receive generated static files.

## DNS risk

A separate DNS zone for a subdomain is valid only with matching public delegation. The screenshot alone does not prove that delegation exists. The proposed corrective action is therefore a gate, not an automatic change:

1. inspect public `NS` and `A` responses;
2. inspect `dig +trace`;
3. if the parent zone is authoritative for `apoio`, put the `A`/`CNAME` records in the parent and disable the redundant local subdomain DNS service;
4. if the subdomain is intentionally delegated, verify that its delegated nameservers are authoritative and reachable and that glue/records are correct.

## Production gates

- DNS resolution proven from outside the server.
- HTTPS certificate valid for the subdomain.
- static artifact produced by CI.
- manual Plesk deployment tested.
- rollback tested.
- image engine tests pass.
- at least one desktop and two mobile-browser validations recorded.
- no photo network request during normal edit/export flow.
- generated avatar and Story dimensions verified byte-for-byte/pixel dimensions.

## Bootstrap reproducibility finding

The repository snapshot does not yet contain `package-lock.json` because dependency installation could not complete in the originating sandbox. The first Antigravity environment with registry access must run `npm install`, execute the full audit, inspect the resulting lockfile, and commit `package-lock.json` in a dedicated PR. After that, CI should use `npm ci` exclusively and npm cache can be re-enabled.
