import { z } from "zod";

export const personalProfileSchema = z.object({
  description: z.string().trim().max(600),
  hobbies: z.array(z.string().trim().min(1).max(40)).max(12)
    .transform(values => [...new Set(values)]),
});

export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;

export function isWebp(bytes: Uint8Array) {
  return bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF"
    && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
}
