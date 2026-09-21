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
});
