# FIERCE AI — Campaign Photo Studio

Browser-first image compositor for campaign photo frames. The same engine supports multiple identities, output formats, and template variants without candidate-specific rendering code.

## Current scope

- Identities: Paulinha, Emerson Stein, and combined.
- Formats: avatar (1:1) and Story (9:16).
- User photo stays in the browser in the public editor.
- JPEG, PNG, and WebP uploads only.
- Crop/zoom with `react-easy-crop`.
- Final-size Canvas rendering and `toBlob()` export.
- Template definitions are data, not conditional rendering code.
- Placeholder assets are intentionally non-final and should be replaced by approved artwork.

## Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Quality checks

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## Repository map

- `src/app/` — Next.js UI.
- `src/components/studio/` — public photo editor.
- `src/image-engine/` — decoding/export/rendering primitives.
- `src/templates/` — template schema and registry.
- `public/templates/` — trusted internal overlay assets.
- `docs/` — architecture, template contract, security, roadmap.
- `.agent/skills/` — reusable agent instructions for implementation work.
- `AGENTS.md` — repository-wide engineering instructions.

## Architectural rule

The image engine must not contain logic such as `if (candidate === "paulinha")`. Candidate/identity, format, photo area and overlay assets belong in template data.

## GitHub bootstrap

If this folder was delivered outside GitHub, authenticate GitHub CLI and run:

```bash
./scripts/publish-github.sh
```

The script creates a private `campaign-photo-studio` repository from this local Git history and pushes `main`.

## FIERCE AI

This repository uses the FIERCE AI collaboration protocol for human/agent engineering work. See `docs/FIERCE-AI.md` and the issue forms under `.github/ISSUE_TEMPLATE/`.

For the current hosting target, the app is built with `output: "export"`. Production receives the generated static artifact; Plesk does not run the Next.js application server.

```bash
npm run audit
```

The static result is generated in `out/` and checked by `npm run verify:static`.

Operational guide: `docs/operations/PLESK.md`.
Antigravity audit prompt: `prompts/ANTIGRAVITY-2.15.1-PLESK-AUDIT.md`.
