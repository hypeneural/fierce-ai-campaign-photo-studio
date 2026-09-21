import type { TemplateDefinition, TemplateLayer } from "@/templates/types";
import { normalizedRectToPixels, type PixelRect } from "./geometry";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    image.src = src;
  });
}

async function drawLayer(ctx: CanvasRenderingContext2D, layer: TemplateLayer, width: number, height: number) {
  const image = await loadImage(layer.src);
  ctx.drawImage(image, 0, 0, width, height);
}

export async function renderTemplateToCanvas(args: {
  template: TemplateDefinition;
  photoSrc: string;
  cropPixels: PixelRect;
}): Promise<HTMLCanvasElement> {
  const { template, photoSrc, cropPixels } = args;
  const canvas = document.createElement("canvas");
  canvas.width = template.width;
  canvas.height = template.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D is unavailable");

  const backgrounds = template.layers.filter((layer) => layer.type === "background");
  const overlays = template.layers.filter((layer) => layer.type === "overlay");
  for (const layer of backgrounds) await drawLayer(ctx, layer, template.width, template.height);

  const photo = await loadImage(photoSrc);
  const target = normalizedRectToPixels(template.photoArea, template.width, template.height);

  ctx.save();
  if (template.cropShape === "round") {
    const radius = Math.min(target.width, target.height) / 2;
    ctx.beginPath();
    ctx.arc(target.x + target.width / 2, target.y + target.height / 2, radius, 0, Math.PI * 2);
    ctx.clip();
  } else {
    ctx.beginPath();
    ctx.rect(target.x, target.y, target.width, target.height);
    ctx.clip();
  }

  ctx.drawImage(
    photo,
    cropPixels.x,
    cropPixels.y,
    cropPixels.width,
    cropPixels.height,
    target.x,
    target.y,
    target.width,
    target.height,
  );
  ctx.restore();

  for (const layer of overlays) await drawLayer(ctx, layer, template.width, template.height);
  return canvas;
}
