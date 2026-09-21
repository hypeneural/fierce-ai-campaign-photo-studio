import { describe, expect, it } from "vitest";
import { templates } from "../src/templates/registry";

describe("template registry", () => {
  it("has unique template ids", () => {
    const ids = templates.map((template) => template.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("keeps normalized photo areas inside the canvas", () => {
    for (const template of templates) {
      const { x, y, width, height } = template.photoArea;
      expect(x).toBeGreaterThanOrEqual(0);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(width).toBeGreaterThan(0);
      expect(height).toBeGreaterThan(0);
      expect(x + width).toBeLessThanOrEqual(1);
      expect(y + height).toBeLessThanOrEqual(1);
    }
  });

  it("enforces exact target dimensions: avatar is 1080x1080 and story is 1080x1920", () => {
    for (const template of templates) {
      if (template.format === "avatar") {
        expect(template.width).toBe(1080);
        expect(template.height).toBe(1080);
      } else if (template.format === "story") {
        expect(template.width).toBe(1080);
        expect(template.height).toBe(1920);
      }
    }
  });
});

