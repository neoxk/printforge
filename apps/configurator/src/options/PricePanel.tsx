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

function formatPriceParts(value: number): { currency: string; amount: string } {
  const parts = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'EUR',
  }).formatToParts(value)
  const currency = parts.find((part) => part.type === 'currency')?.value ?? '€'
  const amount = parts
    .filter((part) => part.type !== 'currency' && part.type !== 'literal')
    .map((part) => part.value)
    .join('')

  return { currency, amount }
}

export function PricePanel({ price, isLoading, error, basePrice, quantity }: Props) {
  const productTotal = basePrice !== null && Number.isFinite(quantity) && quantity > 0 ? basePrice * quantity : null
  const total = price ? price.total + (productTotal ?? 0) : null
  const displayTotal = total ?? productTotal ?? price?.total ?? null
  const displayTotalParts = displayTotal !== null ? formatPriceParts(displayTotal) : null

  return (
    <div className="price-panel">
      <div className="price-summary">
        <span>
          <span className="price-summary-label">Estimated total</span>
          {isLoading && <span className="price-loading">Calculating...</span>}
          {error && <span className="price-error">{error}</span>}
        </span>
        <strong>
          {displayTotalParts ? (
            <>
              <span className="price-currency">{displayTotalParts.currency}</span>
              <span>{displayTotalParts.amount}</span>
            </>
          ) : (
            '-'
          )}
        </strong>
      </div>

      {price && (
        <details className="price-details">
          <summary>Price breakdown</summary>
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
        </details>
      )}
    </div>
  )
}
