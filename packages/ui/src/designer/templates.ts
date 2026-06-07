import type { TemplatePreset } from './types'

// ─── Zone factories ────────────────────────────────────────────────────────────

function zone(x: number, y: number, width: number, height: number, enabled = true) {
  return { x, y, width, height, enabled }
}

type StandardPresetConfig = {
  id: string
  label: string
  description: string
  size: {
    width: number
    height: number
  }
  margins: {
    bleed: number
    safe: number
    allowed: number
  }
}

/**
 * Standard print preset: physicalSize = nominal cut dimensions.
 * bleedArea wraps everything, cutArea is inset by `bleed`, safeZone by `bleed+safe`,
 * allowedPrintArea by `bleed+safe+allowed`.
 */
function makeStandardPreset({
  id,
  label,
  description,
  size,
  margins,
}: StandardPresetConfig): TemplatePreset {
  const { width, height } = size
  const { bleed, safe, allowed } = margins
  const b = bleed
  const s = bleed + safe
  const a = bleed + safe + allowed
  return {
    id,
    label,
    description,
    physicalSize: { width, height },
    fields: {
      bleedArea: zone(0, 0, width, height),
      cutArea: zone(b, b, width - b * 2, height - b * 2),
      safeZone: zone(s, s, width - s * 2, height - s * 2),
      allowedPrintArea: zone(a, a, width - a * 2, height - a * 2),
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
  makeStandardPreset({ id: 'business-card', label: 'Business card (85 × 55 mm)', description: 'Standard business card with 3 mm bleed, cut, and safe zone.', size: { width: 85, height: 55 }, margins: { bleed: 3, safe: 3, allowed: 2 } }),
  makeStandardPreset({ id: 'a6', label: 'A6 (105 × 148 mm)', description: 'A6 postcard or leaflet with 3 mm bleed.', size: { width: 105, height: 148 }, margins: { bleed: 3, safe: 3, allowed: 2 } }),
  makeStandardPreset({ id: 'dl', label: 'DL / Flyer (99 × 210 mm)', description: 'DL envelope-sized flyer with 3 mm bleed.', size: { width: 99, height: 210 }, margins: { bleed: 3, safe: 3, allowed: 2 } }),
  makeStandardPreset({ id: 'a5', label: 'A5 (148 × 210 mm)', description: 'A5 flyer or booklet page with 3 mm bleed.', size: { width: 148, height: 210 }, margins: { bleed: 3, safe: 3, allowed: 2 } }),
  makeStandardPreset({ id: 'a4', label: 'A4 (210 × 297 mm)', description: 'A4 sheet with 3 mm bleed and safe zone.', size: { width: 210, height: 297 }, margins: { bleed: 3, safe: 3, allowed: 2 } }),
  makeStandardPreset({ id: 'a3', label: 'A3 (297 × 420 mm)', description: 'A3 sheet with 3 mm bleed and 5 mm safe zone.', size: { width: 297, height: 420 }, margins: { bleed: 3, safe: 5, allowed: 3 } }),
  makeStandardPreset({ id: 'a2', label: 'A2 (420 × 594 mm)', description: 'A2 sheet with 3 mm bleed and 5 mm safe zone.', size: { width: 420, height: 594 }, margins: { bleed: 3, safe: 5, allowed: 3 } }),
  makeStandardPreset({ id: 'a1', label: 'A1 (594 × 841 mm)', description: 'A1 sheet with 3 mm bleed and 8 mm safe zone.', size: { width: 594, height: 841 }, margins: { bleed: 3, safe: 8, allowed: 5 } }),
  // ── Square formats ─────────────────────────────────────────────────────────
  makeStandardPreset({ id: 'square-100', label: 'Square 100 × 100 mm', description: '100 mm square with 2 mm bleed.', size: { width: 100, height: 100 }, margins: { bleed: 2, safe: 3, allowed: 2 } }),
  makeStandardPreset({ id: 'square-150', label: 'Square 150 × 150 mm', description: '150 mm square with 3 mm bleed.', size: { width: 150, height: 150 }, margins: { bleed: 3, safe: 3, allowed: 2 } }),
  makeStandardPreset({ id: 'square-200', label: 'Square 200 × 200 mm', description: '200 mm square with 3 mm bleed and 5 mm safe zone.', size: { width: 200, height: 200 }, margins: { bleed: 3, safe: 5, allowed: 3 } }),
  // ── Stickers ───────────────────────────────────────────────────────────────
  makeStandardPreset({ id: 'sticker-50', label: 'Sticker 50 × 50 mm', description: 'Small sticker with 2 mm bleed.', size: { width: 50, height: 50 }, margins: { bleed: 2, safe: 3, allowed: 2 } }),
  makeStandardPreset({ id: 'sticker-100', label: 'Sticker 100 × 100 mm', description: 'Standard sticker with 2 mm bleed.', size: { width: 100, height: 100 }, margins: { bleed: 2, safe: 3, allowed: 2 } }),
  // ── Large format / wide print (no bleed, wider margins) ───────────────────
  makeLargeFormatPreset('poster-500x700', 'Poster 500 × 700 mm', 'Large poster with 15 mm safe zone margins.', 500, 700, 15, 10),
  makeLargeFormatPreset('poster-700x1000', 'Poster 700 × 1000 mm', 'Extra-large poster with 20 mm safe zone margins.', 700, 1000, 20, 10),
  makeLargeFormatPreset('banner-600x1600', 'Banner 600 × 1600 mm', 'Wide-format banner with 20 mm safe zone margins.', 600, 1600, 20, 10),
  makeStandardPreset({ id: 'roll-label', label: 'Roll label 100 × 150 mm', description: 'Roll label with 2 mm bleed and safe zone.', size: { width: 100, height: 150 }, margins: { bleed: 2, safe: 3, allowed: 2 } }),
]
