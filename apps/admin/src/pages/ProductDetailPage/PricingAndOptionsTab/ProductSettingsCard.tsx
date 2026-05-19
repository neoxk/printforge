import { useState, useEffect } from 'react'
import { SectionCard, useAppAlerts } from '@printforge/ui'
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
  const { showError, showInfo } = useAppAlerts()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [state, setState] = useState<State>(EMPTY)

  useEffect(() => {
    Products.getConfig(productId)
      .then((config) => {
        const s = fromDimensions(config.dimensions)
        setState(s)
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

      const next: State = {
        dimensionType: state.dimensionType,
        widthMm: widthMm ? String(widthMm) : '',
        heightMm: heightMm ? String(heightMm) : '',
      }
      setState(next)
      showInfo('Settings saved.', 'Saved')
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to save settings.', 'Save failed')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <SectionCard
      title="Product settings"
      actions={
        <button
          className="primary-button"
          type="button"
          disabled={isSaving || isLoading}
          onClick={() => void handleSave()}
        >
          {isSaving ? 'Saving…' : 'Save'}
        </button>
      }
    >
      {isLoading ? (
        <p className="empty-row muted-copy">Loading…</p>
      ) : (
        <div className="product-settings-grid">
          <div className="product-setting">
            <label className="toggle-row">
              <div>
                <span>Fixed dimensions</span>
                <p className="muted-copy" style={{ margin: '0.15rem 0 0' }}>Width and height fixed for all orders.</p>
              </div>
              <input
                type="checkbox"
                checked={state.dimensionType === 'fixed'}
                onChange={(e) =>
                  setState((s) => ({ ...s, dimensionType: e.target.checked ? 'fixed' : 'custom' }))
                }
              />
            </label>
          </div>

          {state.dimensionType === 'fixed' && (
            <>
              <div className="product-setting">
                <label>
                  <span>Width (mm)</span>
                  <input
                    type="number"
                    min={1}
                    placeholder="e.g. 297"
                    value={state.widthMm}
                    onChange={(e) => setState((s) => ({ ...s, widthMm: e.target.value }))}
                  />
                </label>
              </div>
              <div className="product-setting">
                <label>
                  <span>Height (mm)</span>
                  <input
                    type="number"
                    min={1}
                    placeholder="e.g. 210"
                    value={state.heightMm}
                    onChange={(e) => setState((s) => ({ ...s, heightMm: e.target.value }))}
                  />
                </label>
              </div>
            </>
          )}
        </div>
      )}
    </SectionCard>
  )
}
