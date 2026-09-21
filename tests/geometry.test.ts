import { describe, expect, it } from "vitest";
import { aspectForRect, normalizedRectToPixels } from "../src/image-engine/geometry";

describe("template geometry", () => {
  it("maps normalized full-canvas rect for 9:16 template", () => {
    expect(normalizedRectToPixels({ x: 0, y: 0, width: 1, height: 1 }, 1080, 1920)).toEqual({
      x: 0,
      y: 0,
      width: 1080,
      height: 1920,
    });
  });

  it("maps normalized rect for 1:1 avatar template", () => {
    expect(normalizedRectToPixels({ x: 0, y: 0, width: 1, height: 1 }, 1080, 1080)).toEqual({
      x: 0,
      y: 0,
      width: 1080,
      height: 1080,
    });
  });

  it("computes photo-area aspect independently of preview size", () => {
    const rect = { x: 0.1, y: 0.2, width: 0.8, height: 0.5 };
    expect(aspectForRect(rect, 1080, 1920)).toBeCloseTo((0.8 * 1080) / (0.5 * 1920));
  });

  it("ensures photoArea aspect ratio matches pixel dimensions without stretching", () => {
    const storyRect = { x: 0.08, y: 0.16, width: 0.84, height: 0.62 };
    const pixelRect = normalizedRectToPixels(storyRect, 1080, 1920);
    const pixelAspect = pixelRect.width / pixelRect.height;
    const computedAspect = aspectForRect(storyRect, 1080, 1920);
    expect(computedAspect).toBeCloseTo(pixelAspect, 2);
  });
});

