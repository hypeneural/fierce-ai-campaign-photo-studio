# FIERCE / Deployment: Forensic Audit & Production Readiness for apoio.etijucas.com.br

AGENT: ANTIGRAVITY

**Date:** 2026-09-21  
**Environment:** Local Windows Dev + Remote Plesk Obsidian on CloudLinux 8 (`186.209.113.134`)  
**Commit SHA Tested:** `8a232cb1c5dd4d3a34316bef35944265ac583655` (branch `main`)  
**Target Domain:** `apoio.etijucas.com.br`  
**Target Architecture:** Next.js Static Export (`output: "export"`) served via Plesk Nginx/Apache

---

## 1. Executive Summary

A full forensic validation of the repository, the image-engine invariants, and the authorized Plesk hosting environment was performed under strict read-only safety rules.

1. **Repository Gates:** `npm test` passes (7/7 tests pass). However, `typecheck`, `lint`, and `build` currently **FAIL** due to:
   - A runtime and compilation bug in `src/components/studio/StudioClient.tsx(148,52)` (`TS18004`: `aspectRatio` undefined in scope; calculated as `aspect` on line 51).
   - ESLint React hook violations (`react-hooks/set-state-in-effect` on lines 37 & 41 of `StudioClient.tsx`).
   - Missing `package-lock.json` in repository root (now bootstrapped via clean `npm install`, 0 vulnerabilities).
   - Incompatible Server Route Handler `src/app/api/health/route.ts` present in a static export project where `public/health.json` already fulfills health check requirements.
2. **Plesk Environment:** Verified via SSH. The hosting account runs **CloudLinux 8** under **CageFS** with a chrooted shell (`/bin/bash (chrooted)`). It has 12 TB storage (6.3 TB free) and ample system ulimits. The web stack runs **Nginx reverse proxy + Apache 2.4 + PHP 8.3.33 (PHP-FPM)** with `Zend OPcache` enabled.
3. **Plesk CLI Tools:** Default SSH `$PATH` has `/usr/bin/php` (legacy PHP 7.2.24) and lacks `node`/`npm`/`composer`. However, modern runtimes are installed in `/opt/plesk/`: Node 20.20.2 (`/opt/plesk/node/20/bin/node`), Node 22.23.2, PHP 8.3.33 (`/opt/plesk/php/8.3/bin/php`), and Composer 2.10.3 (`/usr/lib64/plesk-9.0/composer.phar`).
4. **DNS & Resolution:** The parent domain `etijucas.com.br` delegates authoritative DNS to `ns1.etijucas.com.br` (`177.93.111.32`) and `ns2.etijucas.com.br` (`187.45.181.114`). Both authoritatively return `apoio.etijucas.com.br A 186.209.113.134`. Public resolvers (Cloudflare 1.1.1.1) resolve correctly to `186.209.113.134`. The Plesk DNS alert in the screenshot is caused by a redundant standalone DNS zone with `ns1.apoio...` inside Plesk that lacks root delegation.
5. **TLS/HTTPS:** Verified and active. Let's Encrypt wildcard/SAN certificate (`apoio.etijucas.com.br`, `*.apoio.etijucas.com.br`) was successfully provisioned by Let's Encrypt (valid from 2026-09-21 to 2026-12-20). HTTP strictly 301 redirects to HTTPS, and HTTPS returns `200 OK`.
6. **Production Readiness:** The environment is fully capable of serving the static export. **Production deployment is currently BLOCKED** until the 3 repository code fixes are merged and verified.

---

## 2. Commit SHA & Working-Tree State

- **Branch:** `main`
- **Commit SHA:** `8a232cb1c5dd4d3a34316bef35944265ac583655`
- **Git Remotes:** None configured on the local clone.
- **Node:** `v24.20.0`
- **npm:** `11.19.0`
- **Lockfile:** `package-lock.json` was initially absent; generated via `npm install` (385 packages, 0 vulnerabilities).

---

## 3. Repository Gate Results

| Gate | Status | Command | Exact Output / Failure Reason |
| :--- | :--- | :--- | :--- |
| `npm run typecheck` | ❌ **FAIL** | `npx tsc --noEmit` | `src/components/studio/StudioClient.tsx(148,52): error TS18004: No value exists in scope for the shorthand property 'aspectRatio'. Either declare one or provide an initializer.` |
| `npm run lint` | ❌ **FAIL** | `npx eslint .` | `src/components/studio/StudioClient.tsx`: Line 37:5 & Line 41:5 `error: Calling setState synchronously within an effect can trigger cascading renders (react-hooks/set-state-in-effect)` |
| `npm test` | ✅ **PASS** | `npx vitest run` | 4 test files passed (4/4), 7 tests passed (7/7) in 4.91s |
| `npm run build` | ❌ **FAIL** | `npx next build` | Compiles in Turbopack, but fails TypeScript step with `TS18004` on `StudioClient.tsx(148,52)` |
| `verify:static` | ⏸️ **BLOCKED**| `node scripts/verify-static.mjs` | Blocked because `out/` is not generated due to build failure |
| `npm outdated` | ℹ️ **INFO** | `npm outdated` | `@types/node` (20.19 -> 26.6), `eslint` (9.39 -> 10.11), `typescript` (5.9 -> 7.0), `vitest` (4.1 -> 5.0) |
| `npm audit --omit=dev` | ✅ **PASS** | `npm audit --omit=dev`| 0 vulnerabilities found |

---

## 4. Static Export & Artifact Validation

- `next.config.ts` confirms static export configuration:
  ```ts
  const nextConfig: NextConfig = {
    reactStrictMode: true,
    output: "export",
    trailingSlash: true,
    images: { unoptimized: true },
  };
  ```
- **Architectural Contradiction:**
  - `src/app/api/health/route.ts` contains a server dynamic Route Handler (`export function GET() { return Response.json(...); }`).
  - Next.js static exports (`output: "export"`) do not support dynamic server Route Handlers.
  - `public/health.json` is already present with `{ "ok": true, "service": "campaign-photo-studio", "deployment": "static-export" }`, which Next.js automatically copies into `out/health.json`.
  - `scripts/verify-static.mjs` expects `out/health.json` (static).
  - **Resolution:** Remove `src/app/api/health/route.ts`.

---

## 5. Image-Engine & Architectural Invariants Audit

Deep analysis of `src/image-engine/`, `src/components/studio/`, `src/templates/`, and `tests/`:

1. **No Candidate-Specific Branches in Engine (AGENTS.md Rule 1):**
   - **CONFIRMED PASS.** No `if`, `switch`, or ternary statements branch on candidate identities (`paulinha`, `emerson-stein`) inside `src/image-engine/`.
   - Candidate names exist strictly in template metadata (`registry.ts`, `schema.ts`, `types.ts`) and UI selectors (`StudioClient.tsx`).
2. **Local-First & No Photo Uploads (AGENTS.md Rule 2):**
   - **CONFIRMED PASS.** Zero network exfiltration code (`fetch`, `XMLHttpRequest`, `FormData`, WebSockets) exists for user images. Image processing is 100% in-browser via Canvas.
3. **MIME & SVG Rejection (AGENTS.md Rule 5):**
   - **CONFIRMED PASS.** `ACCEPTED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"]`. SVG is strictly omitted from the allowlist and rejected with localized message. Size guard enforces 12 MB limit.
4. **Preserve Aspect Ratio / Cover Semantics (AGENTS.md Rule 7):**
   - **CONFIRMED PASS.** Aspect ratio is derived via `aspectForRect(template.photoArea, template.width, template.height)` and passed to cropper. Canvas draws `cropPixels` into destination rect without anamorphic stretching.
5. **Canvas Export via Blob (AGENTS.md Rule 4):**
   - **CONFIRMED PASS.** `canvasToBlob()` wraps native `canvas.toBlob()`. No `toDataURL()` is used.
6. **Object URL Lifecycle (AGENTS.md Rule 8):**
   - **CONFIRMED PASS.** `URL.createObjectURL` is paired with `URL.revokeObjectURL` in both `export.ts` and `StudioClient.tsx`.
7. **Target Dimensions (AGENTS.md Rule 3):**
   - **CONFIRMED PASS.** All avatars are explicitly `1080 × 1080`. All stories are explicitly `1080 × 1920`.
8. **Test Coverage Gaps:**
   - Missing unit tests for: 1:1 `photoArea` mapping (only 9:16 tested), programmatic `validatePhotoFile` failure cases with mock files, no-stretch invariant assertion, and exported canvas resolution assertion.

---

## 6. Browser & Runtime Validation

- Initiated local dev server (`npx next dev --port 3000`).
- Requesting `http://localhost:3000/` reproduces the exact crash:
  ```
  HTTP/1.1 500 Internal Server Error
  data-next-error-message="aspectRatio is not defined"
  ReferenceError: aspectRatio is not defined at StudioClient (StudioClient.tsx:148:52)
  ```
- **Finding:** The responsive preview shell `<div className={styles.cropShell} style={{ aspectRatio }}>` fails at render time because the variable is declared as `const aspect = ...` on line 51.

---

## 7. Plesk Read-Only Environment Audit (SSH)

Executed against `186.209.113.134:22` as `etijucas.com.br_wey8hp7xl7`:

- **Path:** `/var/www/vhosts/etijucas.com.br`
- **Identity:** `uid=11784(etijucas.com.br_wey8hp7xl7) gid=1004(psacln) groups=1004(psacln)`
- **Kernel / OS:** `Linux br46-pl.valueserver.net 4.18.0-553.126.2.lve.el8.x86_64` (CloudLinux 8 with LVE)
- **Isolation:** CageFS active. Process table is strictly isolated (only user's own processes visible).
- **Web Stack:** Nginx (Reverse Proxy) + Apache 2.4 + PHP 8.3.33 (PHP-FPM `fpm-fcgi`). OPcache active.
- **Git Version:** `git version 2.43.7`
- **Default PATH:** `node: command not found`, `npm: command not found`, `composer: command not found`. Default `/usr/bin/php` is legacy PHP 7.2.24.
- **Plesk Custom Runtimes Available:**
  - Node 20: `/opt/plesk/node/20/bin/node` (`v20.20.2`), npm `10.8.2`
  - Node 22: `/opt/plesk/node/22/bin/node` (`v22.23.2`)
  - PHP 8.3 CLI: `/opt/plesk/php/8.3/bin/php` (`PHP 8.3.33`)
  - Composer: `/opt/plesk/php/8.3/bin/php /usr/lib64/plesk-9.0/composer.phar` (`v2.10.3`)
- **Storage / Partitions:** `/dev/md127` (12 TB total, 5.0 TB used, 6.3 TB free, 45% use).
- **I/O Performance:** Direct synchronous write test (`dd fdatasync`): `12.2 MB/s` (consistent with shared mechanical array or CloudLinux LVE throttling).
- **CPU Performance:** Xeon E5-2680 v4 (56 cores visible on host). Python 5M ops compute time: `0.51s`. PHP 2M ops: `0.015s`.
- **Subdomain Document Root:**
  ```text
  /var/www/vhosts/etijucas.com.br/apoio.etijucas.com.br/
  ├── index.html (464 bytes, default Plesk placeholder)
  ```
  Rollback target: Plesk placeholder `index.html`.

---

## 8. DNS Authority & Delegation Validation

- **Authoritative Nameservers for `etijucas.com.br`:**
  - `ns1.etijucas.com.br` (`177.93.111.32`)
  - `ns2.etijucas.com.br` (`187.45.181.114`)
- **Delegation Status:**
  - `apoio.etijucas.com.br` has a local DNS zone created in Plesk with internal NS records.
  - However, querying the parent authoritative server directly (`ns1.etijucas.com.br`) returns:
    ```text
    apoio.etijucas.com.br. 86400 IN A 186.209.113.134
    ```
  - Public DNS resolvers (e.g. Cloudflare `1.1.1.1` and Google `8.8.8.8`) resolve `apoio.etijucas.com.br` directly to `186.209.113.134`.
- **Conclusion on Plesk DNS Warning:**
  - The warning in Plesk (*"O domínio não pode ser corrigido..."*) occurs because Plesk created a redundant standalone zone for the subdomain while the parent domain's zone is the actual authoritative zone resolving the A record.
  - **Action:** No external DNS disruption exists. To silence Plesk's warning cleanly, the redundant local DNS zone on the subdomain can be disabled in Plesk after confirming the parent zone contains the `apoio A 186.209.113.134` record.

---

## 9. TLS & HTTP Validation

- **HTTP Redirection:**
  ```text
  curl -sSIL http://apoio.etijucas.com.br/
  HTTP/1.1 301 Moved Permanently -> Location: https://apoio.etijucas.com.br/
  ```
- **HTTPS Response:**
  ```text
  HTTP/1.1 200 OK
  Server: nginx
  X-Powered-By: PleskLin
  ```
- **SSL Certificate Details:**
  - **Subject:** `CN=apoio.etijucas.com.br`
  - **Issuer:** `Let's Encrypt (YR1)`
  - **Validity:** 2026-09-21 01:26 UTC to 2026-12-20 01:26 UTC
  - **SAN:** `*.apoio.etijucas.com.br`, `apoio.etijucas.com.br`
  - **TLS Handshake:** Fully valid; hostname verification succeeds without warnings.

---

## 10. Plesk Git Readiness

- Remote Git hosting is supported via Plesk Git Extension.
- Deployment path: `/var/www/vhosts/etijucas.com.br/apoio.etijucas.com.br`.
- Recommended deployment pipeline:
  1. CI runs on GitHub Actions (avoids building on shared hosting with 12 MB/s disk I/O).
  2. CI pushes static `out/` contents to a clean, generated `plesk` branch.
  3. Plesk Git pulls the `plesk` branch directly into the document root.

---

## 11. Ranked Blockers

### [CRITICAL] 1. `StudioClient.tsx` Compilation & Runtime Crash
- **File:** `src/components/studio/StudioClient.tsx:148`
- **Issue:** `{ aspectRatio }` shorthand property references non-existent variable. Variable is named `aspect` on line 51.
- **Impact:** TypeScript build fails; page throws 500/ReferenceError in browser.
- **Fix:** Change line 148 to `style={{ aspectRatio: aspect }}`.

### [CRITICAL] 2. Incompatible Route Handler in Static Export
- **File:** `src/app/api/health/route.ts`
- **Issue:** Server API Route Handler incompatible with `output: "export"`.
- **Impact:** Blocks static verification; redundant with `public/health.json`.
- **Fix:** Delete `src/app/api/health/route.ts`.

### [HIGH] 3. ESLint React Hook State Violations
- **File:** `src/components/studio/StudioClient.tsx:37,41`
- **Issue:** `react-hooks/set-state-in-effect` errors for setting template and crop state synchronously inside effects.
- **Impact:** Fails `npm run lint`; causes cascading re-renders.
- **Fix:** Refactor state initialization to derive initial state or handle template transitions in event handlers.

### [HIGH] 4. Missing `package-lock.json` in Repository
- **Issue:** Repository had no lockfile committed.
- **Impact:** Non-deterministic CI installs.
- **Fix:** Commit newly generated `package-lock.json` in a dedicated bootstrap PR.

### [MEDIUM] 5. Test Suite Invariant Coverage Gaps
- **Issue:** Missing explicit tests for 1:1 photoArea mapping, cover/crop geometry across orientations, and `validatePhotoFile` file rejections.
- **Fix:** Add corresponding test cases to `tests/`.

---

## 12. Proposed Code Changes (Diff)

```diff
diff --git a/src/components/studio/StudioClient.tsx b/src/components/studio/StudioClient.tsx
--- a/src/components/studio/StudioClient.tsx
+++ b/src/components/studio/StudioClient.tsx
@@ -145,7 +145,7 @@ export default function StudioClient() {
           <strong>Prévia de enquadramento</strong>
           <span>{template?.width}×{template?.height}</span>
         </div>
-        <div className={styles.cropShell} style={{ aspectRatio }}>
+        <div className={styles.cropShell} style={{ aspectRatio: aspect }}>
           {photoUrl ? (
             <Cropper
               image={photoUrl}

diff --git a/src/app/api/health/route.ts b/src/app/api/health/route.ts
deleted file mode 100644
--- a/src/app/api/health/route.ts
+++ /dev/null
@@ -1,4 +0,0 @@
-export function GET() {
-  return Response.json({ ok: true, service: "campaign-photo-studio" });
-}
```

---

## 13. Rollback Plan

- **Subdomain Document Root Rollback:**
  If a deployment fails, restore the initial Plesk placeholder file:
  ```html
  <!doctype html>
  <html lang="en">
  <head>
      <meta charset="utf-8">
      <title>Domain Default page</title>
      <script src="https://assets.plesk.com/static/default-website-content/public/default-website-index.js"></script>
  </head>
  <body>
      This is a default webpage generated for <script>document.write(location.hostname)</script> by Plesk.
  </body>
  </html>
  ```
- **Git Rollback:** Reset deployment branch `plesk` to previous known good commit.

---

## 14. Architecture Questions for ChatGPT Review

1. **State Transition Architecture in `StudioClient`:** Should template selection be stored as a controlled state driven by format/identity changes via URL query params or purely in-memory React state?
2. **Pre-export Canvas Downscaling:** For mobile devices with high-megapixel photos (e.g. 48 MP phone cameras), should we introduce an intermediate downscale to `max(width, height) * 1.5` in `src/image-engine/render.ts` to prevent iOS WebKit canvas memory crash during compositing?
3. **Plesk Deployment Flow:** Confirm preference for GitHub Actions pushing to `plesk` branch vs Plesk Git webhook pull.

---

## 15. Next Commands

### Read-Only Commands
```bash
npm run typecheck
npm run lint
npm test
curl -sSIL https://apoio.etijucas.com.br/
```

### Reversible Commands
```bash
# Apply fixes for aspectRatio, ESLint hooks, delete redundant API route, and commit package-lock.json
git checkout -b fix/bootstrap-audit-gates
git add package-lock.json src/components/studio/StudioClient.tsx
git rm src/app/api/health/route.ts
npm run build
npm run verify:static
```

### Destructive Commands (Require Explicit Human Approval)
```bash
# Plesk DNS: Disable redundant standalone DNS zone for apoio.etijucas.com.br (DO NOT EXECUTE without approval)
# Production deploy: Overwrite apoio.etijucas.com.br document root with static out/ files
```
