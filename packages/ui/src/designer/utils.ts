import type { DesignerView } from './types'

/** Clamps a zoom value to the designer's allowed range. */
export function clampZoom(value: number, min = 0.35, max = 3): number {
  return Math.max(min, Math.min(max, Number(value.toFixed(2))))
}

/** Reads a file as a data URL string. */
export function readMockupFile(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve(typeof reader.result === 'string' ? reader.result : '')
    }
    reader.onerror = () => reject(new Error(reader.error?.message ?? 'Failed to read file'))
    reader.readAsDataURL(file)
  })
}

/**
 * Returns a new views array with the view matching `selectedViewId`
 * replaced by the result of `updater`. All other views are unchanged.
 */
export function updateViewCollection(
  views: DesignerView[],
  selectedViewId: string | null,
  updater: (view: DesignerView) => DesignerView,
): DesignerView[] {
  return views.map((view) => (view.id === selectedViewId ? updater(view) : view))
}
