import { describe, expect, it } from "vitest";
import { templates } from "../src/templates/registry";
import { templateDefinitionSchema } from "../src/templates/schema";

describe("template schema", () => {
  it("accepts every checked-in template", () => {
    for (const template of templates) {
      expect(templateDefinitionSchema.safeParse(template).success).toBe(true);
    }
  });
});
