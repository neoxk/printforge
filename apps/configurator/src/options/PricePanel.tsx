import type { PricingResult } from '../types.js'

type Props = {
  price: PricingResult | null
  isLoading: boolean
  error: string | null
  basePrice: number | null
  quantity: number
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'EUR',
  }).format(value)
}

function formatLineCost(calculationBasis: string, cost: number): string {
  return calculationBasis === 'FREE' ? 'FREE' : formatPrice(cost)
}

export function PricePanel({ price, isLoading, error, basePrice, quantity }: Props) {
  const productTotal = basePrice !== null && Number.isFinite(quantity) && quantity > 0 ? basePrice * quantity : null
  const total = price ? price.total + (productTotal ?? 0) : null

  return (
    <div className="price-panel">
      {isLoading && <div className="price-loading">Calculating price...</div>}
      {error && <div className="price-error">{error}</div>}

      {price && (
        <>
          <div className="price-breakdown">
            {productTotal !== null && (
              <div className="price-line">
                <span>Base price</span>
                <span className="price-line-cost">{formatPrice(productTotal)}</span>
              </div>
            )}
            {price.breakdown.map((line) => (
              <div key={line.itemId} className="price-line">
                <span>{line.name}</span>
                <span className="price-line-cost">{formatLineCost(line.calculationBasis, line.cost)}</span>
              </div>
            ))}
          </div>
          <div className="price-total">
            <span>Total</span>
            <span>{formatPrice(total ?? price.total)}</span>
          </div>
        </>
      )}
    </div>
  )
}
