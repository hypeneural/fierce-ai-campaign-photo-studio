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

## Gestão de Molduras e Templates

Para adicionar novas molduras da campanha, siga as diretrizes em [`docs/templates/ADDING-FRAMES.md`](docs/templates/ADDING-FRAMES.md):
- **Onde adicionar**: `public/templates/paulinha/`, `public/templates/emerson-stein/`, `public/templates/paulinha-emerson/`
- **Requisitos**: PNG-24 RGBA com transparência real no centro, resolução recomendada 1080×1080 (Avatar) ou 1080×1920 (Story).
- **Thumbnails**: 360×360 px em `public/templates/thumbnails/`.
- **Registro**: Catalogar no manifesto de proveniência `public/templates/manifest.json` e registrar em `src/templates/registry.ts`.
- **Validação**: `npm run verify:assets` e `npm run audit`.

## FIERCE AI & Deploy Plesk

This repository uses the FIERCE AI collaboration protocol for human/agent engineering work. See `docs/FIERCE-AI.md` and the issue forms under `.github/ISSUE_TEMPLATE/`.

Para o ambiente de produção em `apoio.etijucas.com.br`, a aplicação é gerada com `output: "export"`.
O Plesk serve **exclusivamente** os arquivos estáticos compilados da branch de release `plesk` (que contém os arquivos de `out/`). O código-fonte (`src/`, `package.json`, etc.) **nunca** é publicado na raiz do servidor web.

```bash
npm run audit
```

A suíte `npm run audit` executa:
1. `npm run typecheck`
2. `npm run lint`
3. `npm test`
4. `npm run build`
5. `npm run verify:static`
6. `npm run verify:assets`

Operational guide: `docs/operations/PLESK.md`.
Guia de molduras: `docs/templates/ADDING-FRAMES.md`.

