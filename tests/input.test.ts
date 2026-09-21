import { describe, expect, it } from "vitest";
import { ACCEPTED_PHOTO_TYPES, MAX_SOURCE_BYTES } from "../src/image-engine/input";

describe("public photo input policy", () => {
  it("does not allow SVG", () => {
    expect(ACCEPTED_PHOTO_TYPES).not.toContain("image/svg+xml");
  });

  it("defines a finite source-size guard", () => {
    expect(MAX_SOURCE_BYTES).toBeGreaterThan(0);
    expect(Number.isFinite(MAX_SOURCE_BYTES)).toBe(true);
  });
});
