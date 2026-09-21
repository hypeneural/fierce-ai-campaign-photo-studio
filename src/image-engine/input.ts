export const ACCEPTED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export type AcceptedPhotoType = (typeof ACCEPTED_PHOTO_TYPES)[number];

export const MAX_SOURCE_BYTES = 12 * 1024 * 1024;
export const MAX_IMAGE_EDGE = 3072; // Max pixel dimension for memory safety

export function validatePhotoFile(file: File): string | null {
  if (!ACCEPTED_PHOTO_TYPES.includes(file.type as AcceptedPhotoType)) {
    return "Use uma foto JPG, PNG ou WebP.";
  }
  if (file.size > MAX_SOURCE_BYTES) {
    return "A foto excede o limite inicial de 12 MB.";
  }
  return null;
}

/**
 * Normalizes oversized photos entirely in the browser before cropping.
 * Downscales images exceeding 3072px on either edge for optimal memory and speed.
 */
export async function normalizePhotoFile(file: File): Promise<Blob> {
  if (typeof window === "undefined" || !("createImageBitmap" in window)) {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const { width, height } = bitmap;

    if (width <= MAX_IMAGE_EDGE && height <= MAX_IMAGE_EDGE) {
      bitmap.close();
      return file;
    }

    const scale = Math.min(MAX_IMAGE_EDGE / width, MAX_IMAGE_EDGE / height);
    const targetW = Math.round(width * scale);
    const targetH = Math.round(height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      bitmap.close();
      return file;
    }

    ctx.drawImage(bitmap, 0, 0, targetW, targetH);
    bitmap.close();

    const normalizedBlob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.94);
    });

    return normalizedBlob || file;
  } catch {
    return file;
  }
}
