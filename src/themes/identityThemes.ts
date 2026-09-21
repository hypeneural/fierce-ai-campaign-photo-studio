import type { IdentityId } from "@/templates/types";

export interface IdentityTheme {
  id: IdentityId;
  name: string;
  badge: string;
  number: string;
  slogan: string;
  tokens: {
    pageBg: string;
    panelBg: string;
    surfaceBg: string;
    primary: string;
    primaryHover: string;
    secondary: string;
    accent: string;
    accentHover: string;
    text: string;
    textInverse: string;
    muted: string;
    border: string;
    borderActive: string;
    ring: string;
  };
  hero: {
    portraitSrc: string;
    title: string;
    subtitle: string;
  };
}

export const identityThemes: Record<IdentityId, IdentityTheme> = {
  paulinha: {
    id: "paulinha",
    name: "Deputada Paulinha",
    badge: "Campanha Oficial 2026",
    number: "2020",
    slogan: "Deputada Federal",
    tokens: {
      pageBg: "radial-gradient(circle at 20% 20%, #2d0937 0%, #15021c 100%)",
      panelBg: "#23062b",
      surfaceBg: "#350c41",
      primary: "#e2007a",
      primaryHover: "#c00067",
      secondary: "#6b0080",
      accent: "#ccee33",
      accentHover: "#b8d825",
      text: "#ffffff",
      textInverse: "#18021f",
      muted: "#d8b2de",
      border: "rgba(226, 0, 122, 0.35)",
      borderActive: "#ccee33",
      ring: "rgba(204, 238, 51, 0.4)",
    },
    hero: {
      portraitSrc: "/brand/paulinha-hero.png",
      title: "Paulinha 2020",
      subtitle: "Deputada Federal · Crie seu avatar ou story oficial",
    },
  },
  "emerson-stein": {
    id: "emerson-stein",
    name: "Emerson Stein",
    badge: "Campanha Oficial 2026",
    number: "15100",
    slogan: "Deputado Estadual",
    tokens: {
      pageBg: "radial-gradient(circle at 80% 20%, #09235e 0%, #030d24 100%)",
      panelBg: "#091e4c",
      surfaceBg: "#0f2f75",
      primary: "#10358a",
      primaryHover: "#0c296d",
      secondary: "#1f4cb8",
      accent: "#74b72e",
      accentHover: "#629e24",
      text: "#ffffff",
      textInverse: "#030c21",
      muted: "#a8c2ef",
      border: "rgba(116, 183, 46, 0.4)",
      borderActive: "#74b72e",
      ring: "rgba(116, 183, 46, 0.4)",
    },
    hero: {
      portraitSrc: "/brand/emerson-hero.png",
      title: "Emerson Stein 15100",
      subtitle: "Deputado Estadual · Crie seu avatar ou story oficial",
    },
  },
  "paulinha-emerson": {
    id: "paulinha-emerson",
    name: "Paulinha + Emerson",
    badge: "Mobilização Conjunta 2026",
    number: "2020 + 15100",
    slogan: "Federal & Estadual",
    tokens: {
      pageBg: "linear-gradient(135deg, #1f0426 0%, #051336 100%)",
      panelBg: "#170c2d",
      surfaceBg: "#29184d",
      primary: "#990080",
      primaryHover: "#80006c",
      secondary: "#10358a",
      accent: "#d4e63b",
      accentHover: "#bfd126",
      text: "#ffffff",
      textInverse: "#0e051c",
      muted: "#cdbedf",
      border: "rgba(212, 230, 59, 0.4)",
      borderActive: "#d4e63b",
      ring: "rgba(212, 230, 59, 0.4)",
    },
    hero: {
      portraitSrc: "/brand/duo-hero.png",
      title: "Paulinha & Emerson",
      subtitle: "Santa Catarina em Movimento · Crie sua moldura conjunta",
    },
  },
};

export function themeCssVars(theme: IdentityTheme): Record<string, string> {
  return {
    "--brand-page-bg": theme.tokens.pageBg,
    "--brand-panel-bg": theme.tokens.panelBg,
    "--brand-surface-bg": theme.tokens.surfaceBg,
    "--brand-primary": theme.tokens.primary,
    "--brand-primary-hover": theme.tokens.primaryHover,
    "--brand-secondary": theme.tokens.secondary,
    "--brand-accent": theme.tokens.accent,
    "--brand-accent-hover": theme.tokens.accentHover,
    "--brand-text": theme.tokens.text,
    "--brand-text-inverse": theme.tokens.textInverse,
    "--brand-muted": theme.tokens.muted,
    "--brand-border": theme.tokens.border,
    "--brand-border-active": theme.tokens.borderActive,
    "--brand-ring": theme.tokens.ring,
  };
}
