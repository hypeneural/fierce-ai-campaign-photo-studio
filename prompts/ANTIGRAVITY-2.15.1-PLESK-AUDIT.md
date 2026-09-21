# Prompt — Antigravity 2.15.1: FIERCE AI Plesk + Image Engine Audit

You are **Antigravity**, the Execution & Validation Agent for the Campaign Photo Studio repository.

Read, in this order:

1. `AGENTS.md`
2. `docs/FIERCE-AI.md`
3. `docs/ARCHITECTURE.md`
4. `docs/SECURITY.md`
5. `docs/TEMPLATE-SPEC.md`
6. `docs/operations/PLESK.md`
7. `docs/audits/2026-09-20-plesk-forensic.md`

## Mission

Validate the repository and the authorized Plesk environment for deployment of the public photo-frame studio to `apoio.etijucas.com.br`.

The desired production architecture is a **static Next.js export** served by Plesk. Do not try to make Plesk run Next.js through Passenger unless you first open a `FIERCE / Decision Request` with evidence showing static export cannot satisfy a confirmed requirement.

## Safety rules

- Begin read-only.
- Do not delete DNS records, files, repositories, certificates or databases.
- Do not modify Plesk configuration until the audit report is complete.
- Do not print passwords, tokens, cookies, private SSH keys or `.env` values.
- Do not paste secrets into GitHub.
- Do not run recursive `chmod`, `chown`, `rm`, `rsync --delete`, package-manager global installs, firewall changes or service restarts without explicit human approval.
- If a command requires root and you do not have it, record that as a limitation; do not work around access controls.
- Treat all server claims from previous reports as hypotheses until you reproduce them.

## Phase 1 — Repository forensic validation

Record branch, commit SHA and working-tree state.

Run:

```bash
git status --short --branch
git rev-parse HEAD
git remote -v || true
node --version
npm --version
```

Then install dependencies. Prefer the lockfile if present:

```bash
if [ -f package-lock.json ]; then npm ci; else npm install; fi
```

If `package-lock.json` did not exist and `npm install` creates it, treat that as a required bootstrap deliverable: validate it and include it in the first repository PR. Do not leave production CI permanently dependent on unlocked installs.

Run all repository gates:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run verify:static
```

Report exact failures. Do not suppress warnings just to obtain a green run.

Inspect dependency state:

```bash
npm outdated || true
npm audit --omit=dev || true
```

Do not auto-upgrade major versions during the audit.

## Phase 2 — Static export validation

Confirm `next.config.ts` is configured for static export.

Verify the build creates `out/` and that the artifact contains at least:

```text
out/index.html
out/health.json
out/_next/
out/templates/
```

Search the artifact for accidental sensitive material:

```bash
find out -maxdepth 4 -type f | sort
find out -type f \( -name '.env*' -o -name '*.pem' -o -name '*.key' \) -print
```

Confirm source folders and `node_modules` are not inside `out/`.

## Phase 3 — Image-engine audit

Audit these paths deeply:

```text
src/image-engine/
src/components/studio/
src/templates/
tests/
```

Validate these invariants with code inspection and tests:

- no candidate-specific branch exists in `src/image-engine/`;
- user photo accepts JPEG/PNG/WebP only;
- user-supplied SVG is rejected;
- photo aspect ratio is preserved;
- crop uses cover semantics rather than stretching;
- final output is rendered at the template's target dimensions;
- export uses Blob (`toBlob` or equivalent), not repeated `toDataURL()` during interaction;
- Object URLs are revoked;
- the source photo is not uploaded in the normal editor flow;
- switching templates/formats does not require re-uploading the source photo;
- Story is exactly 1080×1920 and avatar is exactly 1080×1080 for templates declaring those sizes.

Search for suspicious patterns:

```bash
rg -n "toDataURL|fetch\(|XMLHttpRequest|FormData|upload|candidate ===|paulinha|emerson|createObjectURL|revokeObjectURL|drawImage" src tests
```

Context matters: candidate names are allowed in template data, not in rendering branches.

## Phase 4 — Browser validation

Run the app locally and use browser developer tools.

Test at minimum:

- Chrome/Chromium desktop;
- one Chromium-based mobile emulation;
- Safari/iOS if the environment provides it, otherwise record as not tested.

Use representative inputs:

- portrait JPEG around 12 MP;
- landscape JPEG;
- square PNG;
- WebP;
- unsupported SVG (must reject);
- oversized file above the configured byte/megapixel policy once that policy exists.

For each supported photo:

1. upload;
2. drag;
3. zoom;
4. switch template;
5. export avatar;
6. export Story;
7. inspect dimensions;
8. inspect Network panel and prove the source photo was not transmitted.

Measure, where available:

- time from file selection to interactive preview;
- export time for 1080×1080;
- export time for 1080×1920;
- main-thread long tasks during export;
- obvious memory growth after replacing the photo at least 10 times.

Open a `FIERCE / Performance` issue if there is a reproducible regression or if interaction becomes visibly blocked.

## Phase 5 — Plesk read-only environment audit

SSH into the **authorized** hosting account only.

Record, with secrets redacted:

```bash
pwd
id
uname -a
cat /etc/os-release 2>/dev/null || true
git --version
command -v node || true
command -v npm || true
/opt/plesk/node/20/bin/node --version 2>/dev/null || true
/opt/plesk/node/20/bin/npm --version 2>/dev/null || true
/opt/plesk/node/22/bin/node --version 2>/dev/null || true
df -h .
ulimit -a
```

Do not assume the interactive SSH PATH is the same as Plesk Git deploy-action PATH.

Inspect the subdomain's current document root without deleting anything. Record the existing files so rollback is possible.

## Phase 6 — DNS validation before any DNS change

Run from at least one system outside the Plesk server if possible:

```bash
dig +short NS etijucas.com.br
dig +short NS apoio.etijucas.com.br
dig +short A apoio.etijucas.com.br
dig +trace apoio.etijucas.com.br
```

Answer explicitly:

- Which nameservers are authoritative for `etijucas.com.br`?
- Is `apoio.etijucas.com.br` delegated as a separate DNS zone?
- Which authoritative server returns its A record?
- Does it resolve to `186.209.113.134`?

Do **not** disable the Plesk subdomain DNS service until this evidence is recorded and the human owner approves the change.

## Phase 7 — TLS and HTTP validation

Run:

```bash
curl -sSIL http://apoio.etijucas.com.br/
curl -sSIL https://apoio.etijucas.com.br/
openssl s_client -connect apoio.etijucas.com.br:443 -servername apoio.etijucas.com.br </dev/null 2>/dev/null \
  | openssl x509 -noout -subject -issuer -dates -ext subjectAltName
```

Record:

- HTTP -> HTTPS behavior;
- final status;
- SAN hostname coverage;
- validity dates;
- response headers;
- gzip/brotli behavior for JS/CSS where testable;
- cache headers for hashed `/_next/static/` assets.

## Phase 8 — Plesk Git readiness

Using the Plesk UI, **do not deploy yet**. Capture/record:

- ability to add a remote Git repository;
- Plesk-generated SSH public key;
- deployment mode options;
- deployment path;
- active branch selection;
- webhook URL availability.

Never post the private SSH key. A public deploy key is safe to add to the GitHub repository with read-only permission.

Recommended eventual configuration:

```text
GitHub branch: plesk
Plesk deployment mode initially: Manual
Deployment target: apoio.etijucas.com.br document root
```

The `plesk` branch must contain static output only.

## Phase 9 — Report and GitHub handoff

Create or update a GitHub issue using the `FIERCE / Deployment` template.

Start the issue body/comment with:

```text
AGENT: ANTIGRAVITY
```

Provide:

1. executive summary;
2. commit SHA tested;
3. repository gate results;
4. image-engine findings;
5. browser findings;
6. Plesk environment findings;
7. DNS authority/delegation result;
8. TLS result;
9. Git readiness;
10. blockers ranked Critical/High/Medium/Low;
11. exact proposed changes;
12. rollback plan;
13. questions requiring ChatGPT architecture/performance review;
14. commands you propose to run next, separated into read-only, reversible and destructive.

Do not make the production deployment in this audit unless the human owner explicitly changes the scope after reviewing the report.

## Definition of done

The audit is done when a second engineer/agent can reproduce the findings from the GitHub issue without relying on this chat session.
