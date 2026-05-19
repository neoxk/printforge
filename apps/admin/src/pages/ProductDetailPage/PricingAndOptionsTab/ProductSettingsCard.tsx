import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardAction, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { showError, showInfo } from '@/lib/toast'
import { Products } from '../../../lib/services'
import type { ProductDimensions } from '../../../lib/services'

type Props = { productId: string }

type State = {
  dimensionType: 'fixed' | 'custom'
  widthMm: string
  heightMm: string
}

const EMPTY: State = { dimensionType: 'custom', widthMm: '', heightMm: '' }

function fromDimensions(d: ProductDimensions): State {
  if (d.type === 'fixed') {
    return { dimensionType: 'fixed', widthMm: String(d.widthMm), heightMm: String(d.heightMm) }
  }
  return EMPTY
}

export function ProductSettingsCard({ productId }: Props) {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [state, setState] = useState<State>(EMPTY)

  useEffect(() => {
    Products.getConfig(productId)
      .then((config) => {
        setState(fromDimensions(config.dimensions))
      })
      .catch(() => showError('Could not load product settings.', 'Load failed'))
      .finally(() => setIsLoading(false))
  }, [productId])

  async function handleSave() {
    if (state.dimensionType === 'fixed') {
      const w = parseInt(state.widthMm, 10)
      const h = parseInt(state.heightMm, 10)
      if (!w || !h || w <= 0 || h <= 0) {
        showError('Enter valid positive dimensions in mm.', 'Invalid input')
        return
      }
    }

    setIsSaving(true)
    try {
      const widthMm = state.dimensionType === 'fixed' ? parseInt(state.widthMm, 10) : null
      const heightMm = state.dimensionType === 'fixed' ? parseInt(state.heightMm, 10) : null
      await Products.updateDimensions(productId, widthMm, heightMm)
      setState((s) => ({
        ...s,
        widthMm: widthMm ? String(widthMm) : '',
        heightMm: heightMm ? String(heightMm) : '',
      }))
      showInfo('Settings saved.', 'Saved')
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to save settings.', 'Save failed')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product settings</CardTitle>
        <CardAction>
          <Button disabled={isSaving || isLoading} onClick={() => void handleSave()}>
            {isSaving ? 'Saving…' : 'Save'}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground py-2">Loading…</p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 flex items-center justify-between gap-4">
              <div>
                <Label htmlFor="fixed-dims">Fixed dimensions</Label>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Width and height fixed for all orders.
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
              <>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="width-mm">Width (mm)</Label>
                  <Input
                    id="width-mm"
                    type="number"
                    min={1}
                    placeholder="e.g. 297"
                    value={state.widthMm}
                    onChange={(e) => setState((s) => ({ ...s, widthMm: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="height-mm">Height (mm)</Label>
                  <Input
                    id="height-mm"
                    type="number"
                    min={1}
                    placeholder="e.g. 210"
                    value={state.heightMm}
                    onChange={(e) => setState((s) => ({ ...s, heightMm: e.target.value }))}
                  />
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
