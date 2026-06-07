import { useState, useEffect } from 'react'
import { SectionCard } from '@printforge/ui'
import { Button } from '@printforge/ui/components/ui/button'
import { Input } from '@printforge/ui/components/ui/input'
import { Label } from '@printforge/ui/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@printforge/ui/components/ui/select'
import { Switch } from '@printforge/ui/components/ui/switch'
import { showError, showInfo } from '@/lib/toast'
import { Products } from '../../../lib/services'
import type { ProductDimensions } from '../../../lib/services'

type Props = {
  productId: string
  onPresetApplied?: (templateId: string, presetLabel: string) => void
  onBlankViewRequested?: (widthMm: number, heightMm: number) => void
}

type State = {
  dimensionType: 'fixed' | 'custom'
  widthMm: string
  heightMm: string
}

const EMPTY: State = { dimensionType: 'custom', widthMm: '', heightMm: '' }

const SIZE_PRESETS = [
  { label: 'Business card (85 × 55 mm)',  width: 85,  height: 55,   templateId: 'business-card'   },
  { label: 'A6 (105 × 148 mm)',           width: 105, height: 148,  templateId: 'a6'               },
  { label: 'DL / Flyer (99 × 210 mm)',    width: 99,  height: 210,  templateId: 'dl'               },
  { label: 'A5 (148 × 210 mm)',           width: 148, height: 210,  templateId: 'a5'               },
  { label: 'A4 (210 × 297 mm)',           width: 210, height: 297,  templateId: 'a4'               },
  { label: 'A3 (297 × 420 mm)',           width: 297, height: 420,  templateId: 'a3'               },
  { label: 'A2 (420 × 594 mm)',           width: 420, height: 594,  templateId: 'a2'               },
  { label: 'A1 (594 × 841 mm)',           width: 594, height: 841,  templateId: 'a1'               },
  { label: 'Square 100 × 100 mm',         width: 100, height: 100,  templateId: 'square-100'       },
  { label: 'Square 150 × 150 mm',         width: 150, height: 150,  templateId: 'square-150'       },
  { label: 'Square 200 × 200 mm',         width: 200, height: 200,  templateId: 'square-200'       },
  { label: 'Sticker 50 × 50 mm',          width: 50,  height: 50,   templateId: 'sticker-50'       },
  { label: 'Sticker 100 × 100 mm',        width: 100, height: 100,  templateId: 'sticker-100'      },
  { label: 'Poster 500 × 700 mm',         width: 500, height: 700,  templateId: 'poster-500x700'   },
  { label: 'Poster 700 × 1000 mm',        width: 700, height: 1000, templateId: 'poster-700x1000'  },
  { label: 'Banner 600 × 1600 mm',        width: 600, height: 1600, templateId: 'banner-600x1600'  },
  { label: 'Roll label 100 × 150 mm',     width: 100, height: 150,  templateId: 'roll-label'       },
]

function fromDimensions(d: ProductDimensions): State {
  if (d.type === 'fixed') {
    return { dimensionType: 'fixed', widthMm: String(d.widthMm), heightMm: String(d.heightMm) }
  }
  return EMPTY
}

export function ProductSettingsCard({ productId, onPresetApplied, onBlankViewRequested }: Readonly<Props>) {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [state, setState] = useState<State>(EMPTY)
  const [pendingPreset, setPendingPreset] = useState<{ templateId: string; label: string } | null>(null)
  const [pendingManual, setPendingManual] = useState(false)

  useEffect(() => {
    Products.getConfig(productId)
      .then((config) => setState(fromDimensions(config.dimensions)))
      .catch(() => showError('Could not load product settings.', 'Load failed'))
      .finally(() => setIsLoading(false))
  }, [productId])

  function applyPreset(label: string) {
    const preset = SIZE_PRESETS.find((p) => p.label === label)
    if (!preset) return
    setState((s) => ({ ...s, widthMm: String(preset.width), heightMm: String(preset.height) }))
    setPendingPreset({ templateId: preset.templateId, label: preset.label })
    setPendingManual(false)
  }

  function handleDimensionChange(field: 'widthMm' | 'heightMm', value: string) {
    setState((s) => ({ ...s, [field]: value }))
    setPendingPreset(null)
    setPendingManual(true)
  }

  async function handleSave() {
    if (state.dimensionType === 'fixed') {
      const w = Number.parseInt(state.widthMm, 10)
      const h = Number.parseInt(state.heightMm, 10)
      if (!w || !h || w <= 0 || h <= 0) {
        showError('Enter valid positive dimensions in mm.', 'Invalid input')
        return
      }
    }

    setIsSaving(true)
    try {
      const widthMm = state.dimensionType === 'fixed' ? Number.parseInt(state.widthMm, 10) : null
      const heightMm = state.dimensionType === 'fixed' ? Number.parseInt(state.heightMm, 10) : null
      await Products.updateDimensions(productId, widthMm, heightMm)
      setState((s) => ({
        ...s,
        widthMm: widthMm ? String(widthMm) : '',
        heightMm: heightMm ? String(heightMm) : '',
      }))
      showInfo('Product dimensions saved.', 'Saved')
      if (pendingPreset) {
        onPresetApplied?.(pendingPreset.templateId, pendingPreset.label)
        setPendingPreset(null)
      } else if (pendingManual && widthMm && heightMm) {
        onBlankViewRequested?.(widthMm, heightMm)
        setPendingManual(false)
      }
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to save settings.', 'Save failed')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <SectionCard
      title="Product dimensions"
      description="Set fixed dimensions when this product has a single defined size."
      actions={
        <Button disabled={isSaving || isLoading} onClick={() => void handleSave()}>
          {isSaving ? 'Saving…' : 'Save'}
        </Button>
      }
    >
      {isLoading ? (
        <p className="text-sm text-muted-foreground py-2">Loading…</p>
      ) : (
        <div className="grid gap-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label htmlFor="fixed-dims">Fixed dimensions</Label>
              <p className="text-sm text-muted-foreground mt-0.5">
                Lock width and height for all orders of this product.
              </p>
            </div>
            <Switch
              id="fixed-dims"
              checked={state.dimensionType === 'fixed'}
              onCheckedChange={(checked) =>
                setState((s) => ({ ...s, dimensionType: checked ? 'fixed' : 'custom' }))
              }
            />
          </div>

          {state.dimensionType === 'fixed' && (
            <div className="grid gap-4 rounded-lg border border-dashed border-border bg-muted/20 p-4">
              <div className="grid gap-1.5">
                <Label>Size preset</Label>
                <Select onValueChange={applyPreset}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a preset to auto-fill…" />
                  </SelectTrigger>
                  <SelectContent>
                    {SIZE_PRESETS.map((p) => (
                      <SelectItem key={p.label} value={p.label}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="width-mm">Width (mm)</Label>
                  <Input
                    id="width-mm"
                    type="number"
                    min={1}
                    placeholder="e.g. 210"
                    value={state.widthMm}
                    onChange={(e) => handleDimensionChange('widthMm', e.target.value)}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="height-mm">Height (mm)</Label>
                  <Input
                    id="height-mm"
                    type="number"
                    min={1}
                    placeholder="e.g. 297"
                    value={state.heightMm}
                    onChange={(e) => handleDimensionChange('heightMm', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </SectionCard>
  )
}
