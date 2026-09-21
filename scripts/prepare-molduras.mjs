import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const moldurasDir = path.resolve('Molduras');
const files = fs.readdirSync(moldurasDir).filter(f => !f.startsWith('.')).sort();

// Create destination dirs
const sourceBackupDir = path.resolve('assets-source/molduras');
const duoTemplatesDir = path.resolve('public/templates/paulinha-emerson');
const duoThumbsDir = path.resolve('public/templates/paulinha-emerson/thumbs');

fs.mkdirSync(sourceBackupDir, { recursive: true });
fs.mkdirSync(duoTemplatesDir, { recursive: true });
fs.mkdirSync(duoThumbsDir, { recursive: true });

console.log(`Found ${files.length} files in Molduras/`);

const items = [];

for (let i = 0; i < files.length; i++) {
  const origFile = files[i];
  const origPath = path.join(moldurasDir, origFile);
  const normalizedId = `duo-avatar-${String(i + 1).padStart(2, '0')}`;
  const normPngName = `${normalizedId}.png`;
  const normThumbName = `${normalizedId}.webp`;

  // Backup original
  fs.copyFileSync(origPath, path.join(sourceBackupDir, origFile));

  // Resize / optimize master:
  // User output standard is 1080x1080. The masters are 1254x1254.
  // We can write high-quality 1080x1080 PNG or keep 1254x1254.
  // The directive says:
  // "O output final do sistema será 1080x1080.
  // Se o master for 1254x1254, 2048x2048 etc., isso é aceitável.
  // O renderer pode redimensionar para 1080x1080.
  // Evitar PNG de vários megabytes quando existir redução lossless segura."
  // Let's create both: optimized 1080x1080 PNG master and 360x360 WebP thumbnail!
  const targetPngPath = path.join(duoTemplatesDir, normPngName);
  const targetThumbPath = path.join(duoThumbsDir, normThumbName);

  await sharp(origPath)
    .resize(1080, 1080, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9, effort: 7 })
    .toFile(targetPngPath);

  await sharp(origPath)
    .resize(360, 360, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 85, alphaQuality: 90 })
    .toFile(targetThumbPath);

  const origSize = fs.statSync(origPath).size;
  const newSize = fs.statSync(targetPngPath).size;
  const thumbSize = fs.statSync(targetThumbPath).size;

  items.push({
    index: i + 1,
    id: normalizedId,
    origFile,
    origSize,
    newSize,
    thumbSize,
    reductionPct: (((origSize - newSize) / origSize) * 100).toFixed(1)
  });

  console.log(`Processed ${normalizedId}: ${origSize} B -> ${newSize} B (thumb: ${thumbSize} B)`);
}

// Generate an inspection HTML page to render all 9 frames with background
const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Molduras Audit Gallery</title>
  <style>
    body { font-family: sans-serif; background: #1e293b; color: #f8fafc; padding: 24px; }
    h1 { margin-bottom: 8px; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 24px; }
    .card { background: #0f172a; border-radius: 12px; padding: 16px; border: 1px solid #334155; }
    .preview-box {
      width: 100%;
      aspect-ratio: 1;
      position: relative;
      border-radius: 8px;
      overflow: hidden;
      /* checkered background to show transparency */
      background: repeating-conic-gradient(#334155 0% 25%, #1e293b 0% 50%) 50% / 20px 20px;
    }
    .user-sample {
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      object-fit: cover;
      opacity: 0.85;
    }
    .frame-overlay {
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      pointer-events: none;
    }
    .info { margin-top: 12px; font-size: 14px; line-height: 1.4; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 12px; }
    .badge-ok { background: #059669; color: white; }
  </style>
</head>
<body>
  <h1>Molduras 1:1 Paulinha + Emerson Audit (${items.length} frames)</h1>
  <p>Verificação visual de transparência real, sobreposição da foto do usuário e elementos gráficos.</p>
  <div class="grid">
    ${items.map(item => `
      <div class="card">
        <h3>${item.id} <span class="badge badge-ok">${item.reductionPct}% menor</span></h3>
        <div class="preview-box">
          <img class="user-sample" src="/brand/duo-hero.png" alt="Sample photo" />
          <img class="frame-overlay" src="/templates/paulinha-emerson/${item.id}.png" alt="${item.id}" />
        </div>
        <div class="info">
          <div><strong>Origem:</strong> ${item.origFile}</div>
          <div><strong>Tamanho:</strong> ${(item.origSize / 1024).toFixed(0)} KB &rarr; ${(item.newSize / 1024).toFixed(0)} KB (Thumb: ${(item.thumbSize / 1024).toFixed(0)} KB)</div>
        </div>
      </div>
    `).join('')}
  </div>
</body>
</html>`;

fs.writeFileSync(path.resolve('public/audit-gallery.html'), htmlContent);
console.log('Inspection page written to public/audit-gallery.html');
