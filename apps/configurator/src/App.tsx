import { useState, useEffect, useRef } from 'react'
import { useAsync } from '@printforge/ui'
import { fetchProductConfig, calculatePrice } from './lib/api.js'
import { ContainerGroup } from './components/ContainerGroup.js'
import type { ProductConfig, PricingResult } from './types.js'

function getProductIdFromPath(): string | null {
  const segments = window.location.pathname.split('/').filter(Boolean)
  return segments[segments.length - 1] ?? null
}

function buildInitialSelection(config: ProductConfig): Record<string, string[]> {
  const selection: Record<string, string[]> = {}
  for (const container of config.containers) {
    if (container.containerType === 'AUTO_APPLIED') continue
    selection[container.id] = container.defaultItemId ? [container.defaultItemId] : []
  }
  return selection
}

export default function App() {
  const productId = getProductIdFromPath()
  const { data: config, isLoading, error } = useAsync(
    () => {
      if (!productId) return Promise.reject(new Error('No product ID in URL'))
      return fetchProductConfig(productId)
    },
    [productId],
  )

  const [selection, setSelection] = useState<Record<string, string[]>>({})
  const [dimensions, setDimensions] = useState({ widthMm: '', heightMm: '' })
  const [quantity, setQuantity] = useState('1')
  const [priceResult, setPriceResult] = useState<PricingResult | null>(null)
  const [priceLoading, setPriceLoading] = useState(false)
  const [priceError, setPriceError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (config) setSelection(buildInitialSelection(config))
  }, [config])

  useEffect(() => {
    if (!config || !productId) return

    const widthMm =
      config.dimensions.type === 'fixed'
        ? config.dimensions.widthMm
        : parseInt(dimensions.widthMm, 10)
    const heightMm =
      config.dimensions.type === 'fixed'
        ? config.dimensions.heightMm
        : parseInt(dimensions.heightMm, 10)
    const qty = parseInt(quantity, 10)

    if (!widthMm || !heightMm || !qty || widthMm <= 0 || heightMm <= 0 || qty <= 0) {
      setPriceResult(null)
      setPriceError(null)
      return
    }

    const selectedItemIds = Object.values(selection).flat()

    const timer = setTimeout(async () => {
      abortRef.current?.abort()
      abortRef.current = new AbortController()
      setPriceLoading(true)
      setPriceError(null)
      try {
        const result = await calculatePrice(productId, selectedItemIds, { widthMm, heightMm, quantity: qty })
        setPriceResult(result)
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setPriceError('Could not calculate price.')
          setPriceResult(null)
        }
      } finally {
        setPriceLoading(false)
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [config, productId, selection, dimensions, quantity])

  function handleChange(containerId: string, selected: string[]) {
    setSelection((prev) => ({ ...prev, [containerId]: selected }))
  }

  if (!productId) return <div className="cf-error">No product ID provided.</div>
  if (isLoading) return <div className="cf-loading">Loading…</div>
  if (error) return <div className="cf-error">{error.message}</div>
  if (!config) return null

  const visibleContainers = config.containers.filter(
    (c) => !c.isHidden && c.containerType !== 'AUTO_APPLIED',
  )

  return (
    <form className="configurator-form" onSubmit={(e) => e.preventDefault()}>
      {config.dimensions.type === 'custom' && (
        <div className="container-group">
          <div className="container-label">Size (mm)</div>
          <div className="dimensions-row">
            <input
              type="number"
              min={1}
              placeholder="Width"
              value={dimensions.widthMm}
              onChange={(e) => setDimensions((d) => ({ ...d, widthMm: e.target.value }))}
            />
            <span className="dimensions-sep">×</span>
            <input
              type="number"
              min={1}
              placeholder="Height"
              value={dimensions.heightMm}
              onChange={(e) => setDimensions((d) => ({ ...d, heightMm: e.target.value }))}
            />
          </div>
        </div>
      )}
      <div className="container-group">
        <div className="container-label">Quantity</div>
        <input
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="quantity-input"
        />
      </div>
      {visibleContainers.map((container) => (
        <ContainerGroup
          key={container.id}
          container={container}
          selected={selection[container.id] ?? []}
          onChange={handleChange}
        />
      ))}

      <div className="price-panel">
        {priceLoading && <span className="price-loading">Calculating…</span>}
        {priceError && <span className="price-error">{priceError}</span>}
        {!priceLoading && priceResult && (
          <>
            <div className="price-breakdown">
              {priceResult.breakdown.map((line) => (
                <div key={line.itemId} className="price-line">
                  <span className="price-line-name">{line.name}</span>
                  <span className="price-line-cost">{line.cost.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="price-total">
              <span>Total</span>
              <span>{priceResult.total.toFixed(2)}</span>
            </div>
          </>
        )}
      </div>
    </form>
  )
}
