import { readFile, access } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { templates } from "../src/templates/registry.ts";

const root = path.resolve(".");
const manifestPath = path.join(root, "public", "templates", "manifest.json");

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function sha256File(filePath) {
  const buf = await readFile(filePath);
  return createHash("sha256").update(buf).digest("hex");
}

console.log("Checking template asset manifest...");
if (!(await fileExists(manifestPath))) {
  throw new Error(`Manifest not found at: ${manifestPath}`);
}

const manifestContent = await readFile(manifestPath, "utf-8");
const manifest = JSON.parse(manifestContent);

if (!manifest.schemaVersion || !Array.isArray(manifest.assets)) {
  throw new Error("Invalid manifest schema: missing schemaVersion or assets array");
}

console.log(`Verifying ${manifest.assets.length} assets in manifest...`);
for (const asset of manifest.assets) {
  const assetPath = path.join(root, "public", asset.path.replace(/^\//, ""));
  if (!(await fileExists(assetPath))) {
    throw new Error(`Asset file missing: ${assetPath}`);
  }

  const hash = await sha256File(assetPath);
  if (hash !== asset.sha256) {
    throw new Error(`SHA-256 mismatch for ${asset.id}:\nExpected: ${asset.sha256}\nActual:   ${hash}`);
  }

  if (asset.thumbnail) {
    const thumbPath = path.join(root, "public", asset.thumbnail.replace(/^\//, ""));
    if (!(await fileExists(thumbPath))) {
      throw new Error(`Thumbnail file missing: ${thumbPath}`);
    }
    const thumbHash = await sha256File(thumbPath);
    if (thumbHash !== asset.thumbnailSha256) {
      throw new Error(`Thumbnail SHA-256 mismatch for ${asset.id}:\nExpected: ${asset.thumbnailSha256}\nActual:   ${thumbHash}`);
    }
  }

  // Check photoArea bounds
  const { x, y, width, height } = asset.photoArea;
  if (x < 0 || y < 0 || width <= 0 || height <= 0 || x + width > 1.0001 || y + height > 1.0001) {
    throw new Error(`Invalid photoArea bounds for ${asset.id}: ${JSON.stringify(asset.photoArea)}`);
  }
}

console.log(`Verifying ${templates.length} registry templates against disk...`);
for (const tpl of templates) {
  for (const layer of tpl.layers) {
    const layerPath = path.join(root, "public", layer.src.replace(/^\//, ""));
    if (!(await fileExists(layerPath))) {
      throw new Error(`Registry layer missing on disk: ${layerPath} (template: ${tpl.id})`);
    }
  }
}

console.log("Template asset verification passed successfully.");
