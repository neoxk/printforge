import { CalcBasis, DisplayMode } from '@printforge/ui'

export const BASIS_LABEL: Record<CalcBasis, string> = {
  [CalcBasis.YIELD_PCS]: 'Sheet yield',
  [CalcBasis.LINEAR_M]:  'Linear m',
  [CalcBasis.SQM]:       'Sq metre',
  [CalcBasis.PERIMETER]: 'Perimeter',
  [CalcBasis.PCS]:       'Per piece',
  [CalcBasis.ORDER]:     'Per order',
  [CalcBasis.FREE]:      'Free',
}

export const BASIS_UNIT: Record<CalcBasis, string> = {
  [CalcBasis.YIELD_PCS]: '/ sheet',
  [CalcBasis.LINEAR_M]:  '/ m',
  [CalcBasis.SQM]:       '/ m²',
  [CalcBasis.PERIMETER]: '/ m',
  [CalcBasis.PCS]:       '/ pc',
  [CalcBasis.ORDER]:     '/ order',
  [CalcBasis.FREE]:      '',
}

export const BASIS_OPTIONS: { value: CalcBasis; label: string }[] = [
  { value: CalcBasis.YIELD_PCS, label: 'Sheet yield (YIELD_PCS)' },
  { value: CalcBasis.LINEAR_M,  label: 'Linear metre (LINEAR_M)' },
  { value: CalcBasis.SQM,       label: 'Square metre (SQM)' },
  { value: CalcBasis.PERIMETER, label: 'Perimeter (PERIMETER)' },
  { value: CalcBasis.PCS,       label: 'Per piece (PCS)' },
  { value: CalcBasis.ORDER,     label: 'Per order (ORDER)' },
  { value: CalcBasis.FREE,      label: 'Free (FREE)' },
]

export function basisNeedsLength(b: CalcBasis): boolean {
  return b === CalcBasis.YIELD_PCS
}

export function basisNeedsWidth(b: CalcBasis): boolean {
  return b === CalcBasis.YIELD_PCS || b === CalcBasis.LINEAR_M
}

export const DISPLAY_LABEL: Record<string, string> = {
  [DisplayMode.SELECTABLE]: 'Selectable',
  [DisplayMode.REQUIRED]:   'Required',
  [DisplayMode.HIDDEN]:     'Hidden',
}

export const DISPLAY_OPTIONS: { value: string; label: string }[] = [
  { value: DisplayMode.SELECTABLE, label: 'Selectable' },
  { value: DisplayMode.REQUIRED,   label: 'Required' },
  { value: DisplayMode.HIDDEN,     label: 'Hidden' },
]
