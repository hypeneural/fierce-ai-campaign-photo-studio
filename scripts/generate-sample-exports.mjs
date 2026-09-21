import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const samplePhotoPath = path.resolve('public/brand/duo-hero.png');
const outDir = path.resolve('docs/screenshots');

const sampleTests = [
  { id: 'duo-avatar-01', w: 1080, h: 1080, overlay: 'public/templates/paulinha-emerson/duo-avatar-01.png' },
  { id: 'duo-avatar-02', w: 1080, h: 1080, overlay: 'public/templates/paulinha-emerson/duo-avatar-02.png' },
  { id: 'duo-avatar-03', w: 1080, h: 1080, overlay: 'public/templates/paulinha-emerson/duo-avatar-03.png' },
  { id: 'paulinha-avatar-apoio-v1', w: 1080, h: 1080, overlay: 'public/templates/paulinha/avatar-apoio-v1.png' },
  { id: 'emerson-avatar-apoio-v1', w: 1080, h: 1080, overlay: 'public/templates/emerson-stein/avatar-apoio-v1.png' },
  { id: 'duo-story-derived-v1', w: 1080, h: 1920, overlay: 'public/templates/paulinha-emerson/story-derived-v1.png' }
];

console.log('Generating sample exports with verified photo composite...\n');

const results = [];

for (const t of sampleTests) {
  const photo = await sharp(samplePhotoPath)
    .resize(t.w, t.h, { fit: 'cover' })
    .toBuffer();

  const compositeBuf = await sharp(photo)
    .composite([{ input: path.resolve(t.overlay), top: 0, left: 0 }])
    .png()
    .toBuffer();

  const outFilePath = path.join(outDir, `sample-export-${t.id}.png`);
  fs.writeFileSync(outFilePath, compositeBuf);

  const meta = await sharp(compositeBuf).metadata();
  results.push({
    id: t.id,
    width: meta.width,
    height: meta.height,
    channels: meta.channels,
    format: meta.format,
    sizeBytes: fs.statSync(outFilePath).size
  });
}

console.log(JSON.stringify(results, null, 2));
