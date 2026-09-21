export const ACCEPTED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export type AcceptedPhotoType = (typeof ACCEPTED_PHOTO_TYPES)[number];

export const MAX_SOURCE_BYTES = 12 * 1024 * 1024;

export function validatePhotoFile(file: File): string | null {
  if (!ACCEPTED_PHOTO_TYPES.includes(file.type as AcceptedPhotoType)) {
    return "Use uma foto JPG, PNG ou WebP.";
  }
  if (file.size > MAX_SOURCE_BYTES) {
    return "A foto excede o limite inicial de 12 MB.";
  }
  return null;
}
