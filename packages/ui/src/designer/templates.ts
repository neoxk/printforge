import type { TemplatePreset } from './types'

// ─── Zone factories ────────────────────────────────────────────────────────────

function zone(x: number, y: number, width: number, height: number, enabled = true) {
  return { x, y, width, height, enabled }
}

/**
 * Standard print preset: physicalSize = nominal cut dimensions.
 * bleedArea wraps everything, cutArea is inset by `bleed`, safeZone by `bleed+safe`,
 * allowedPrintArea by `bleed+safe+allowed`.
 */
function makeStandardPreset(
  id: string,
  label: string,
  description: string,
  w: number,
  h: number,
  bleed: number,
  safe: number,
  allowed: number,
): TemplatePreset {
  const b = bleed
  const s = bleed + safe
  const a = bleed + safe + allowed
  return {
    id,
    label,
    description,
    physicalSize: { width: w, height: h },
    fields: {
      bleedArea: zone(0, 0, w, h),
      cutArea: zone(b, b, w - b * 2, h - b * 2),
      safeZone: zone(s, s, w - s * 2, h - s * 2),
      allowedPrintArea: zone(a, a, w - a * 2, h - a * 2),
    },
  }
}

/**
 * Large-format preset: no bleed, wider safe-zone margins.
 */
function makeLargeFormatPreset(
  id: string,
  label: string,
  description: string,
  w: number,
  h: number,
  safe: number,
  allowed: number,
): TemplatePreset {
  return {
    id,
    label,
    description,
    physicalSize: { width: w, height: h },
    fields: {
      bleedArea: { enabled: false },
      cutArea: zone(0, 0, w, h),
      safeZone: zone(safe, safe, w - safe * 2, h - safe * 2),
      allowedPrintArea: zone(safe + allowed, safe + allowed, w - (safe + allowed) * 2, h - (safe + allowed) * 2),
    },
  }
}

// ─── Presets ──────────────────────────────────────────────────────────────────

export const templatePresets: TemplatePreset[] = [
  // ── Sheet / card formats (3 mm bleed) ──────────────────────────────────────
  makeStandardPreset('business-card', 'Business card (85 × 55 mm)', 'Standard business card with 3 mm bleed, cut, and safe zone.', 85, 55, 3, 3, 2),
  makeStandardPreset('a6', 'A6 (105 × 148 mm)', 'A6 postcard or leaflet with 3 mm bleed.', 105, 148, 3, 3, 2),
  makeStandardPreset('dl', 'DL / Flyer (99 × 210 mm)', 'DL envelope-sized flyer with 3 mm bleed.', 99, 210, 3, 3, 2),
  makeStandardPreset('a5', 'A5 (148 × 210 mm)', 'A5 flyer or booklet page with 3 mm bleed.', 148, 210, 3, 3, 2),
  makeStandardPreset('a4', 'A4 (210 × 297 mm)', 'A4 sheet with 3 mm bleed and safe zone.', 210, 297, 3, 3, 2),
  makeStandardPreset('a3', 'A3 (297 × 420 mm)', 'A3 sheet with 3 mm bleed and 5 mm safe zone.', 297, 420, 3, 5, 3),
  makeStandardPreset('a2', 'A2 (420 × 594 mm)', 'A2 sheet with 3 mm bleed and 5 mm safe zone.', 420, 594, 3, 5, 3),
  makeStandardPreset('a1', 'A1 (594 × 841 mm)', 'A1 sheet with 3 mm bleed and 8 mm safe zone.', 594, 841, 3, 8, 5),
  // ── Square formats ─────────────────────────────────────────────────────────
  makeStandardPreset('square-100', 'Square 100 × 100 mm', '100 mm square with 2 mm bleed.', 100, 100, 2, 3, 2),
  makeStandardPreset('square-150', 'Square 150 × 150 mm', '150 mm square with 3 mm bleed.', 150, 150, 3, 3, 2),
  makeStandardPreset('square-200', 'Square 200 × 200 mm', '200 mm square with 3 mm bleed and 5 mm safe zone.', 200, 200, 3, 5, 3),
  // ── Stickers ───────────────────────────────────────────────────────────────
  makeStandardPreset('sticker-50', 'Sticker 50 × 50 mm', 'Small sticker with 2 mm bleed.', 50, 50, 2, 3, 2),
  makeStandardPreset('sticker-100', 'Sticker 100 × 100 mm', 'Standard sticker with 2 mm bleed.', 100, 100, 2, 3, 2),
  // ── Large format / wide print (no bleed, wider margins) ───────────────────
  makeLargeFormatPreset('poster-500x700', 'Poster 500 × 700 mm', 'Large poster with 15 mm safe zone margins.', 500, 700, 15, 10),
  makeLargeFormatPreset('poster-700x1000', 'Poster 700 × 1000 mm', 'Extra-large poster with 20 mm safe zone margins.', 700, 1000, 20, 10),
  makeLargeFormatPreset('banner-600x1600', 'Banner 600 × 1600 mm', 'Wide-format banner with 20 mm safe zone margins.', 600, 1600, 20, 10),
  makeStandardPreset('roll-label', 'Roll label 100 × 150 mm', 'Roll label with 2 mm bleed and safe zone.', 100, 150, 2, 3, 2),
]
