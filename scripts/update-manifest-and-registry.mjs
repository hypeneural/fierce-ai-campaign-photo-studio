import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';

const manifestPath = path.resolve('public/templates/manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

const duoDir = path.resolve('public/templates/paulinha-emerson');
const paulinhaDir = path.resolve('public/templates/paulinha');
const emersonDir = path.resolve('public/templates/emerson-stein');
const thumbsDir = path.resolve('public/templates/thumbnails');

// Copy solo frames
fs.copyFileSync(path.join(duoDir, 'duo-avatar-07.png'), path.join(paulinhaDir, 'avatar-apoio-v1.png'));
fs.copyFileSync(path.join(duoDir, 'duo-avatar-08.png'), path.join(emersonDir, 'avatar-apoio-v1.png'));

// Generate thumbnails for solo frames
await sharp(path.join(paulinhaDir, 'avatar-apoio-v1.png'))
  .resize(360, 360, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png({ compressionLevel: 9 })
  .toFile(path.join(thumbsDir, 'paulinha-avatar-apoio-v1.png'));

await sharp(path.join(emersonDir, 'avatar-apoio-v1.png'))
  .resize(360, 360, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png({ compressionLevel: 9 })
  .toFile(path.join(thumbsDir, 'emerson-avatar-apoio-v1.png'));

function sha256(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

const duoTitles = [
  'Clássica Circular',
  'Faixa Superior & Inferior',
  'Selo Circular EU APOIO',
  'Octogonal Dinâmica',
  'União Apertando as Mãos',
  'Ondas Dinâmicas',
  'Apoio Paulinha 2020',
  'Apoio Emerson Stein 15100',
  'Ondas com Selo Superior'
];

const photoAreas = {
  'duo-avatar-01': { x: 0, y: 0, width: 1, height: 1 },
  'duo-avatar-02': { x: 0.13, y: 0.07, width: 0.73, height: 0.65 },
  'duo-avatar-03': { x: 0, y: 0, width: 1, height: 1 },
  'duo-avatar-04': { x: 0.14, y: 0.10, width: 0.72, height: 0.70 },
  'duo-avatar-05': { x: 0.12, y: 0.02, width: 0.76, height: 0.68 },
  'duo-avatar-06': { x: 0.16, y: 0.19, width: 0.68, height: 0.64 },
  'duo-avatar-07': { x: 0.06, y: 0.02, width: 0.85, height: 0.72 },
  'duo-avatar-08': { x: 0, y: 0, width: 1, height: 0.75 },
  'duo-avatar-09': { x: 0.10, y: 0.16, width: 0.79, height: 0.68 }
};

const newAssets = [];

for (let i = 1; i <= 9; i++) {
  const id = `duo-avatar-${String(i).padStart(2, '0')}`;
  const pngPath = path.join(duoDir, `${id}.png`);
  const thumbPngPath = path.join(thumbsDir, `${id}.png`);

  await sharp(pngPath)
    .resize(360, 360, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toFile(thumbPngPath);

  const assetSha = sha256(pngPath);
  const thumbSha = sha256(thumbPngPath);

  newAssets.push({
    id,
    identity: 'paulinha-emerson',
    format: 'avatar',
    label: `Paulinha + Emerson · ${duoTitles[i - 1]}`,
    path: `/templates/paulinha-emerson/${id}.png`,
    thumbnail: `/templates/thumbnails/${id}.png`,
    thumbnailSha256: thumbSha,
    status: 'human-supplied-derived',
    source: `Molduras/ (${i})`,
    sourceSha256: assetSha,
    sha256: assetSha,
    width: 1080,
    height: 1080,
    hasAlpha: true,
    alphaBoundingBox: [0, 0, 1080, 1080],
    cropShape: [1, 3, 5, 9].includes(i) ? 'round' : 'rect',
    photoArea: photoAreas[id],
    retrievedAt: '2026-09-21'
  });
}

// Paulinha solo asset
const paulinhaSoloPng = path.join(paulinhaDir, 'avatar-apoio-v1.png');
const paulinhaSoloThumb = path.join(thumbsDir, 'paulinha-avatar-apoio-v1.png');
newAssets.push({
  id: 'paulinha-avatar-apoio-v1',
  identity: 'paulinha',
  format: 'avatar',
  label: 'Paulinha · EU APOIO 2020',
  path: '/templates/paulinha/avatar-apoio-v1.png',
  thumbnail: '/templates/thumbnails/paulinha-avatar-apoio-v1.png',
  thumbnailSha256: sha256(paulinhaSoloThumb),
  status: 'human-supplied-derived',
  source: 'Molduras/ChatGPT Image 21 de set. de 2026, 01_01_49 (1).png',
  sourceSha256: sha256(paulinhaSoloPng),
  sha256: sha256(paulinhaSoloPng),
  width: 1080,
  height: 1080,
  hasAlpha: true,
  alphaBoundingBox: [0, 0, 1080, 1080],
  cropShape: 'round',
  photoArea: { x: 0.06, y: 0.02, width: 0.85, height: 0.72 },
  retrievedAt: '2026-09-21'
});

// Emerson solo asset
const emersonSoloPng = path.join(emersonDir, 'avatar-apoio-v1.png');
const emersonSoloThumb = path.join(thumbsDir, 'emerson-avatar-apoio-v1.png');
newAssets.push({
  id: 'emerson-avatar-apoio-v1',
  identity: 'emerson-stein',
  format: 'avatar',
  label: 'Emerson · EU APOIO 15100',
  path: '/templates/emerson-stein/avatar-apoio-v1.png',
  thumbnail: '/templates/thumbnails/emerson-avatar-apoio-v1.png',
  thumbnailSha256: sha256(emersonSoloThumb),
  status: 'human-supplied-derived',
  source: 'Molduras/ChatGPT Image 21 de set. de 2026, 01_01_49 (2).png',
  sourceSha256: sha256(emersonSoloPng),
  sha256: sha256(emersonSoloPng),
  width: 1080,
  height: 1080,
  hasAlpha: true,
  alphaBoundingBox: [0, 0, 1080, 1080],
  cropShape: 'rect',
  photoArea: { x: 0, y: 0, width: 1, height: 0.75 },
  retrievedAt: '2026-09-21'
});

// Merge into manifest.assets
const newIds = new Set(newAssets.map(a => a.id));
const existing = manifest.assets.filter(a => !newIds.has(a.id));
manifest.assets = [...existing, ...newAssets];
manifest.generatedAt = new Date().toISOString();

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log(`Manifest updated! Total assets: ${manifest.assets.length}`);
