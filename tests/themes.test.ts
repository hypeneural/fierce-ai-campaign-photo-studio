import { describe, expect, it } from "vitest";
import { identityThemes, themeCssVars } from "../src/themes/identityThemes";
import type { IdentityId } from "../src/templates/types";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const engineDir = path.resolve(__dirname, "../src/image-engine");

describe("identity theming architecture", () => {
  const identities: IdentityId[] = ["paulinha", "emerson-stein", "paulinha-emerson"];

  it("provides complete theme tokens for all identities", () => {
    for (const id of identities) {
      const theme = identityThemes[id];
      expect(theme).toBeDefined();
      expect(theme.id).toBe(id);
      expect(theme.name).toBeTypeOf("string");
      expect(theme.badge).toBeTypeOf("string");
      expect(theme.hero.portraitSrc).toBeTypeOf("string");
      expect(theme.tokens.primary).toBeTypeOf("string");
      expect(theme.tokens.accent).toBeTypeOf("string");
      expect(theme.tokens.pageBg).toBeTypeOf("string");
      expect(theme.tokens.panelBg).toBeTypeOf("string");
    }
  });

  it("maps theme tokens to required CSS variables", () => {
    const theme = identityThemes.paulinha;
    const cssVars = themeCssVars(theme);
    expect(cssVars["--brand-primary"]).toBe(theme.tokens.primary);
    expect(cssVars["--brand-accent"]).toBe(theme.tokens.accent);
    expect(cssVars["--brand-page-bg"]).toBe(theme.tokens.pageBg);
    expect(cssVars["--brand-panel-bg"]).toBe(theme.tokens.panelBg);
    expect(cssVars["--brand-text"]).toBe(theme.tokens.text);
  });

  it("preserves candidate-agnostic invariant: no candidate names inside src/image-engine", () => {
    const files = readdirSync(engineDir).filter((f) => f.endsWith(".ts"));
    const forbiddenPatterns = ["paulinha", "emerson", "stein", "podemos", "mdb"];

    for (const file of files) {
      const code = readFileSync(path.join(engineDir, file), "utf-8").toLowerCase();
      for (const pattern of forbiddenPatterns) {
        expect(code.includes(pattern), `Forbidden candidate reference '${pattern}' found in ${file}`).toBe(false);
      }
    }
  });
});
