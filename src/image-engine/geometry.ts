import type { NormalizedRect } from "@/templates/types";

export interface PixelRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function normalizedRectToPixels(rect: NormalizedRect, width: number, height: number): PixelRect {
  return {
    x: Math.round(rect.x * width),
    y: Math.round(rect.y * height),
    width: Math.round(rect.width * width),
    height: Math.round(rect.height * height),
  };
}

export function aspectForRect(rect: NormalizedRect, canvasWidth: number, canvasHeight: number): number {
  return (rect.width * canvasWidth) / (rect.height * canvasHeight);
}
