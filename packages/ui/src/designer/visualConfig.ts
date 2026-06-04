import type { CSSProperties } from 'react'
import type { ZoneKey } from './types'

/** Swatch styles for the canvas legend — one entry per zone key. */
export const ZONE_SWATCH_STYLE: Record<string, CSSProperties> = {
  physicalSize:    { background: 'rgba(49,65,95,0.12)',   border: '2px solid #31415f' },
  cutArea:         { background: '#ffffff',               border: '2px dashed #050809' },
  bleedArea:       { background: 'rgba(255,90,90,0.28)',  border: '2px dashed #ba1a1a' },
  safeZone:        { background: 'rgba(67,160,71,0.22)',  border: '2px dashed #2e7d32' },
  allowedPrintArea:{ background: 'rgba(2,102,255,0.18)',  border: '2px solid #0050cc' },
}

/** Order in which zones are drawn onto the canvas (back to front). */
export const ZONE_RENDER_ORDER: ZoneKey[] = [
  'physicalSize',
  'cutArea',
  'bleedArea',
  'safeZone',
  'allowedPrintArea',
]

/** Order in which zones appear in the canvas legend overlay. */
export const ZONE_LEGEND_ORDER: ZoneKey[] = [
  'cutArea',
  'bleedArea',
  'safeZone',
  'allowedPrintArea',
  'physicalSize',
]

/** Background style for the designer canvas viewport. */
export const VIEWPORT_BG: CSSProperties = {
  background:
    'linear-gradient(rgba(118,119,124,0.08) 1px,transparent 1px),' +
    'linear-gradient(90deg,rgba(118,119,124,0.08) 1px,transparent 1px),' +
    'oklch(0.964 0.005 60)',
  backgroundSize: '24px 24px, 24px 24px, auto',
}
