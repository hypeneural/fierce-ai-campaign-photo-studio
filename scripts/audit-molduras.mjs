import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';

const moldurasDir = path.resolve('Molduras');
const files = fs.readdirSync(moldurasDir).filter(f => !f.startsWith('.'));

console.log(`Auditing ${files.length} files in ${moldurasDir}...\n`);

const results = [];

for (const file of files) {
  const filePath = path.join(moldurasDir, file);
  const stats = fs.statSync(filePath);
  const buffer = fs.readFileSync(filePath);
  const hash = crypto.createHash('sha256').update(buffer).digest('hex');

  const image = sharp(buffer);
  const metadata = await image.metadata();

  // Get raw RGBA buffer to analyze pixels
  const { data, info } = await sharp(buffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;
  const totalPixels = width * height;

  let minAlpha = 255;
  let maxAlpha = 0;
  let transparentCount = 0;
  let semiTransparentCount = 0;
  let opaqueCount = 0;

  let minX = width, minY = height, maxX = 0, maxY = 0;

  // Inspect central 40% region
  const centerXStart = Math.floor(width * 0.3);
  const centerXEnd = Math.floor(width * 0.7);
  const centerYStart = Math.floor(height * 0.3);
  const centerYEnd = Math.floor(height * 0.7);
  let centerTransparentCount = 0;
  let centerWhiteCount = 0;
  let centerBlackCount = 0;
  let centerTotal = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];

      if (a < minAlpha) minAlpha = a;
      if (a > maxAlpha) maxAlpha = a;

      if (a === 0) {
        transparentCount++;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      } else if (a < 250) {
        semiTransparentCount++;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      } else {
        opaqueCount++;
      }

      if (x >= centerXStart && x <= centerXEnd && y >= centerYStart && y <= centerYEnd) {
        centerTotal++;
        if (a < 50) {
          centerTransparentCount++;
        } else if (r > 245 && g > 245 && b > 245) {
          centerWhiteCount++;
        } else if (r < 10 && g < 10 && b < 10) {
          centerBlackCount++;
        }
      }
    }
  }

  const hasTrueAlpha = (transparentCount + semiTransparentCount) > 0.05 * totalPixels;
  const centerIsTransparent = (centerTransparentCount / centerTotal) > 0.4;
  const centerIsWhite = (centerWhiteCount / centerTotal) > 0.6;
  const centerIsBlack = (centerBlackCount / centerTotal) > 0.6;

  results.push({
    file,
    sizeBytes: stats.size,
    width,
    height,
    aspectRatio: (width / height).toFixed(4),
    channels: metadata.channels,
    format: metadata.format,
    hasAlphaChannel: metadata.hasAlpha,
    minAlpha,
    maxAlpha,
    transparentPercent: ((transparentCount / totalPixels) * 100).toFixed(2),
    semiTransparentPercent: ((semiTransparentCount / totalPixels) * 100).toFixed(2),
    opaquePercent: ((opaqueCount / totalPixels) * 100).toFixed(2),
    transparencyBbox: (minX <= maxX && minY <= maxY) ? { minX, minY, maxX, maxY } : null,
    centerIsTransparent,
    centerIsWhite,
    centerIsBlack,
    hasTrueAlpha,
    sha256: hash
  });
}

console.log(JSON.stringify(results, null, 2));
