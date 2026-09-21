import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const duoDir = path.resolve('public/templates/paulinha-emerson');
const files = fs.readdirSync(duoDir).filter(f => f.startsWith('duo-avatar-') && f.endsWith('.png')).sort();

console.log('Calculating safe photo areas for duo templates...\n');

const results = {};

for (const file of files) {
  const filePath = path.join(duoDir, file);
  const { data, info } = await sharp(filePath).raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;

  // Find inner bounding box where alpha < 20
  let minX = width, minY = height, maxX = 0, maxY = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha < 20) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  // Normalized coordinates
  const normMinX = Number((minX / width).toFixed(4));
  const normMinY = Number((minY / height).toFixed(4));
  const normWidth = Number(((maxX - minX) / width).toFixed(4));
  const normHeight = Number(((maxY - minY) / height).toFixed(4));

  results[file] = {
    pixelBox: { minX, minY, maxX, maxY },
    photoArea: {
      x: normMinX,
      y: normMinY,
      width: normWidth,
      height: normHeight
    }
  };
}

console.log(JSON.stringify(results, null, 2));
