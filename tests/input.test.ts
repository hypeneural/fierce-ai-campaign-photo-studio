import { describe, expect, it } from "vitest";
import { ACCEPTED_PHOTO_TYPES, MAX_SOURCE_BYTES, validatePhotoFile } from "../src/image-engine/input";

describe("public photo input policy", () => {
  it("does not allow SVG in MIME allowlist", () => {
    expect(ACCEPTED_PHOTO_TYPES).not.toContain("image/svg+xml");
  });

  it("allows only JPEG, PNG, and WebP", () => {
    expect([...ACCEPTED_PHOTO_TYPES].sort()).toEqual(["image/jpeg", "image/png", "image/webp"].sort());
  });

  it("defines a finite source-size guard of 12MB", () => {
    expect(MAX_SOURCE_BYTES).toBe(12 * 1024 * 1024);
  });

  it("rejects SVG files with an error message", () => {
    const fakeSvg = new File(["<svg></svg>"], "test.svg", { type: "image/svg+xml" });
    expect(validatePhotoFile(fakeSvg)).toBe("Use uma foto JPG, PNG ou WebP.");
  });

  it("rejects files exceeding 12MB", () => {
    const hugeFile = {
      type: "image/jpeg",
      size: 13 * 1024 * 1024,
      name: "huge.jpg",
    } as unknown as File;
    expect(validatePhotoFile(hugeFile)).toBe("A foto excede o limite inicial de 12 MB.");
  });

  it("accepts valid JPEG, PNG, and WebP files within limit", () => {
    const validJpg = new File(["data"], "test.jpg", { type: "image/jpeg" });
    const validPng = new File(["data"], "test.png", { type: "image/png" });
    const validWebp = new File(["data"], "test.webp", { type: "image/webp" });
    expect(validatePhotoFile(validJpg)).toBeNull();
    expect(validatePhotoFile(validPng)).toBeNull();
    expect(validatePhotoFile(validWebp)).toBeNull();
  });
});

