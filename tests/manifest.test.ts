import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";

const rootDir = path.resolve(__dirname, "..");
const manifestPath = path.join(rootDir, "public", "templates", "manifest.json");

describe("template asset provenance manifest", () => {
  it("exists and conforms to schema version 1", () => {
    expect(existsSync(manifestPath)).toBe(true);
    const content = JSON.parse(readFileSync(manifestPath, "utf-8"));
    expect(content.schemaVersion).toBe(1);
    expect(Array.isArray(content.assets)).toBe(true);
    expect(content.assets.length).toBeGreaterThanOrEqual(6);
  });

  it("verifies all manifest asset files and thumbnails exist with matching SHA-256", () => {
    const content = JSON.parse(readFileSync(manifestPath, "utf-8"));
    for (const asset of content.assets) {
      const assetFile = path.join(rootDir, "public", asset.path.replace(/^\//, ""));
      expect(existsSync(assetFile), `Asset file missing: ${asset.path}`).toBe(true);

      const buf = readFileSync(assetFile);
      const computedHash = createHash("sha256").update(buf).digest("hex");
      expect(computedHash).toBe(asset.sha256);
      expect(asset.hasAlpha).toBe(true);

      if (asset.thumbnail) {
        const thumbFile = path.join(rootDir, "public", asset.thumbnail.replace(/^\//, ""));
        expect(existsSync(thumbFile), `Thumbnail file missing: ${asset.thumbnail}`).toBe(true);
        const thumbBuf = readFileSync(thumbFile);
        const thumbHash = createHash("sha256").update(thumbBuf).digest("hex");
        expect(thumbHash).toBe(asset.thumbnailSha256);
      }
    }
  });

  it("ensures photoArea bounds in manifest are strictly normalized within [0, 1]", () => {
    const content = JSON.parse(readFileSync(manifestPath, "utf-8"));
    for (const asset of content.assets) {
      const { x, y, width, height } = asset.photoArea;
      expect(x).toBeGreaterThanOrEqual(0);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(width).toBeGreaterThan(0);
      expect(height).toBeGreaterThan(0);
      expect(x + width).toBeLessThanOrEqual(1.0001);
      expect(y + height).toBeLessThanOrEqual(1.0001);
    }
  });
});
