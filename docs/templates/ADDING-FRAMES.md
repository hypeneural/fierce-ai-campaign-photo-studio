# Guia de Adição de Molduras — Campaign Photo Studio

Este documento orienta a inclusão de novas molduras de campanha no sistema, preservando a integridade arquitetural (local-first, candidate-agnostic no image engine, e conformidade com os gates de validação).

---

## 1. Diretórios de Destino

As molduras são organizadas por identidade e formato em `public/templates/`:

- **Paulinha**: `public/templates/paulinha/`
- **Emerson Stein**: `public/templates/emerson-stein/`
- **Paulinha + Emerson (Conjunto)**: `public/templates/paulinha-emerson/`
- **Thumbnails (geradas)**: `public/templates/thumbnails/`
- **Originais Brutos (backup/provenance)**: `assets-source/molduras/`

---

## 2. Convenção de Nomes

NUNCA utilize nomes temporários ou gerados como `ChatGPT Image...`. Utilize identificadores determinísticos e padronizados:

- **Avatar 1:1 Paulinha**: `paulinha-avatar-[variante]-v[versao].png` (ex: `paulinha-avatar-apoio-v1.png`)
- **Story 9:16 Paulinha**: `paulinha-story-[variante]-v[versao].png`
- **Avatar 1:1 Emerson**: `emerson-avatar-[variante]-v[versao].png` (ex: `emerson-avatar-apoio-v1.png`)
- **Story 9:16 Emerson**: `emerson-story-[variante]-v[versao].png`
- **Avatar 1:1 Conjunto**: `duo-avatar-[01-99].png` (ex: `duo-avatar-01.png`)
- **Story 9:16 Conjunto**: `duo-story-[variante]-v[versao].png`

---

## 3. Requisitos Técnicos do Arquivo PNG

| Propriedade | Avatar (1:1) | Story (9:16) |
|---|---|---|
| **Resolução Recomendada** | **1080 × 1080 px** | **1080 × 1920 px** |
| **Formato** | PNG-24 com canal Alpha | PNG-24 com canal Alpha |
| **Canais** | 4 (RGBA) | 4 (RGBA) |
| **Transparência** | Região central onde a foto do apoiador será posicionada DEVE ter opacidade $\alpha = 0$. | Região de foto DEVE ter $\alpha = 0$. |
| **Peso Recomendado** | < 350 KB (otimizado via Sharp/pngquant) | < 600 KB (otimizado) |

> [!WARNING]
> Nunca assuma transparência apenas pela extensão `.png`. Verifique se o centro não possui fundo branco, preto ou tabuleiro xadrez rasterizado.

---

## 4. Geração de Thumbnail

Miniaturas são salvas em `public/templates/thumbnails/[template-id].png` (e opcionalmente `.webp`).

- **Dimensão**: 360 × 360 px (ou 360 × 640 px para story)
- **Fundo**: Transparente
- **Script**: Utilize `node scripts/prepare-molduras.mjs` ou execute via `sharp`:
```bash
node -e "
import sharp from 'sharp';
sharp('public/templates/paulinha-emerson/duo-avatar-01.png')
  .resize(360, 360, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png({ compressionLevel: 9 })
  .toFile('public/templates/thumbnails/duo-avatar-01.png');
"
```

---

## 5. Registro no Manifest (`public/templates/manifest.json`)

Toda moldura em produção deve estar catalogada em `manifest.json`:

```json
{
  "id": "duo-avatar-01",
  "identity": "paulinha-emerson",
  "format": "avatar",
  "label": "Paulinha + Emerson · Clássica Circular",
  "path": "/templates/paulinha-emerson/duo-avatar-01.png",
  "thumbnail": "/templates/thumbnails/duo-avatar-01.png",
  "thumbnailSha256": "...",
  "status": "human-supplied-derived",
  "source": "Molduras/ (1)",
  "sourceSha256": "...",
  "sha256": "...",
  "width": 1080,
  "height": 1080,
  "hasAlpha": true,
  "alphaBoundingBox": [0, 0, 1080, 1080],
  "cropShape": "round",
  "photoArea": { "x": 0, "y": 0, "width": 1, "height": 1 },
  "retrievedAt": "2026-09-21"
}
```

Valores válidos para `status`:
- `official-source`: extraído diretamente de canal oficial verificado.
- `human-supplied`: fornecido pelo operador/campanha.
- `derived`: derivado matematicamente ou composto de elementos oficiais.
- `human-supplied-derived`: gerado a partir de materiais fornecidos pelo operador humano.

---

## 6. Registro no Template Registry (`src/templates/registry.ts`)

Adicione a definição ao array `templates`:

```typescript
{
  id: "duo-avatar-01",
  identity: "paulinha-emerson",
  format: "avatar",
  label: "Paulinha + Emerson · Clássica Circular",
  thumbnail: "/templates/thumbnails/duo-avatar-01.png",
  status: "human-supplied-derived",
  width: 1080,
  height: 1080,
  photoArea: { x: 0.0, y: 0.0, width: 1.0, height: 1.0 },
  cropShape: "round",
  layers: [{ type: "overlay", src: "/templates/paulinha-emerson/duo-avatar-01.png" }],
  export: { mime: "image/png" },
}
```

> [!IMPORTANT]
> Nunca crie branches condicionais `if (candidate === ...)` no código de `src/image-engine/`. O engine de imagem deve permanecer 100% agnóstico a candidatos.

---

## 7. Como Validar

Execute a suíte de auditoria completa:

```bash
npm run audit
```

Essa suíte executa automaticamente:
1. `npm run typecheck`: checagem de tipos TypeScript.
2. `npm run lint`: checagem de regras de código ESLint.
3. `npm test`: 20 testes unitários (Vitest), incluindo validação de manifest, schemas e invariantes de geometria.
4. `npm run build`: static export do Next.js.
5. `npm run verify:static`: integridade do bundle estático gerado.
6. `npm run verify:assets`: verificação de existência em disco, hashes SHA-256 e coordenadas da `photoArea` para todas as molduras.
