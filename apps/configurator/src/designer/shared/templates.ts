import type { TemplatePreset } from './types'

export const templatePresets: TemplatePreset[] = [
  {
    id: 'business-card',
    label: 'Business card',
    description: 'Standard two-sided business card setup with bleed and safe zone.',
    physicalSize: { width: 90, height: 50 },
    fields: {
      cutArea: { enabled: true, x: 0, y: 0, width: 90, height: 50 },
      bleedArea: { enabled: true, x: 0, y: 0, width: 90, height: 50 },
      safeZone: { enabled: true, x: 5, y: 5, width: 80, height: 40 },
      allowedPrintArea: { enabled: true, x: 3, y: 3, width: 84, height: 44 },
    },
  },
  {
    id: 'flyer',
    label: 'Flyer',
    description: 'A4 flyer with print-safe placement guides.',
    physicalSize: { width: 210, height: 297 },
    fields: {
      cutArea: { enabled: true, x: 0, y: 0, width: 210, height: 297 },
      bleedArea: { enabled: true, x: 0, y: 0, width: 210, height: 297 },
      safeZone: { enabled: true, x: 10, y: 10, width: 190, height: 277 },
      allowedPrintArea: { enabled: true, x: 5, y: 5, width: 200, height: 287 },
    },
  },
  {
    id: 'mug',
    label: 'Mug wrap',
    description: 'Wraparound mug print surface with optional safe zone.',
    physicalSize: { width: 220, height: 95 },
    fields: {
      safeZone: { enabled: true, x: 12, y: 12, width: 196, height: 71 },
      allowedPrintArea: { enabled: true, x: 8, y: 8, width: 204, height: 79 },
    },
  },
  {
    id: 'tshirt',
    label: 'T-shirt front',
    description: 'Front chest print area for apparel products.',
    physicalSize: { width: 320, height: 420 },
    fields: {
      safeZone: { enabled: true, x: 32, y: 48, width: 256, height: 312 },
      allowedPrintArea: { enabled: true, x: 24, y: 40, width: 272, height: 328 },
    },
  },
]
