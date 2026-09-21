import { z } from "zod";

const normalizedNumber = z.number().min(0).max(1);

export const normalizedRectSchema = z.object({
  x: normalizedNumber,
  y: normalizedNumber,
  width: z.number().gt(0).max(1),
  height: z.number().gt(0).max(1),
}).refine((rect) => rect.x + rect.width <= 1 && rect.y + rect.height <= 1, {
  message: "photoArea must stay inside the canvas",
});

const layerSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("background"), src: z.string().min(1) }),
  z.object({ type: z.literal("overlay"), src: z.string().min(1) }),
]);

export const templateDefinitionSchema = z.object({
  id: z.string().min(1),
  identity: z.enum(["paulinha", "emerson-stein", "paulinha-emerson"]),
  format: z.enum(["avatar", "story", "feed"]),
  label: z.string().min(1),
  thumbnail: z.string().min(1).optional(),
  status: z.enum(["official-source", "human-supplied", "derived"]).optional(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  photoArea: normalizedRectSchema,
  cropShape: z.enum(["rect", "round"]),
  layers: z.array(layerSchema),
  export: z.object({
    mime: z.enum(["image/png", "image/jpeg"]),
    quality: z.number().min(0).max(1).optional(),
  }),
});
