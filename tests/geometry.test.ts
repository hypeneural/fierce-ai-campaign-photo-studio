import { describe, expect, it } from "vitest";
import { aspectForRect, normalizedRectToPixels } from "../src/image-engine/geometry";

describe("template geometry", () => {
  it("maps normalized full-canvas rect", () => {
    expect(normalizedRectToPixels({ x: 0, y: 0, width: 1, height: 1 }, 1080, 1920)).toEqual({
      x: 0,
      y: 0,
      width: 1080,
      height: 1920,
    });
  });

  it("computes photo-area aspect independently of preview size", () => {
    const rect = { x: 0.1, y: 0.2, width: 0.8, height: 0.5 };
    expect(aspectForRect(rect, 1080, 1920)).toBeCloseTo((0.8 * 1080) / (0.5 * 1920));
  });
});
