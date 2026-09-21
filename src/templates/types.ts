export type IdentityId = "paulinha" | "emerson-stein" | "paulinha-emerson";
export type FormatId = "avatar" | "story" | "feed";

export interface NormalizedRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type TemplateLayer =
  | { type: "background"; src: string }
  | { type: "overlay"; src: string };

export interface TemplateDefinition {
  id: string;
  identity: IdentityId;
  format: FormatId;
  label: string;
  thumbnail?: string;
  status?: "official-source" | "human-supplied" | "derived" | "human-supplied-derived";
  width: number;
  height: number;
  photoArea: NormalizedRect;
  cropShape: "rect" | "round";
  layers: TemplateLayer[];
  export: {
    mime: "image/png" | "image/jpeg";
    quality?: number;
  };
}

