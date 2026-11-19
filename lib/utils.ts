import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** Hexágono de marca: vértices a izquierda y derecha, sin esquinas redondeadas. */
export const HEX_CLIP = "polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%)";
/** El mismo hexágono crecido hasta cubrir por completo su caja (para revelar fotos). */
export const HEX_CLIP_FULL = "polygon(-40% -60%, 140% -60%, 200% 50%, 140% 160%, -40% 160%, -100% 50%)";

export function hexPoints(cx: number, cy: number, r: number) {
  const h = (Math.sqrt(3) / 2) * r;
  return [
    [cx - r / 2, cy - h],
    [cx + r / 2, cy - h],
    [cx + r, cy],
    [cx + r / 2, cy + h],
    [cx - r / 2, cy + h],
    [cx - r, cy],
  ]
    .map((p) => p.join(","))
    .join(" ");
}

export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
