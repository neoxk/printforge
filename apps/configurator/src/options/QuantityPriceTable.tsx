import type { QuantityPriceRow } from '../types.js'

type Props = {
  rows: QuantityPriceRow[]
  basePrice: number | null
  selectedQuantity: number
  error: string | null
  onSelect: (quantity: number) => void
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'EUR',
  }).format(value)
}

function getPackPrice(row: QuantityPriceRow, basePrice: number | null): number {
  return row.optionsTotal + (basePrice ?? 0) * row.quantity
}

export function QuantityPriceTable({ rows, basePrice, selectedQuantity, error, onSelect }: Readonly<Props>) {
  const visibleRows = rows.slice(0, 7)

  return (
    <div className="quantity-table-group">
      <div className="container-label">Choose your quantity</div>
      <div className="quantity-table-wrap">
        <table className="quantity-price-table">
          <colgroup>
            <col className="quantity-col" />
            <col className="unit-price-col" />
            <col className="pack-price-col" />
          </colgroup>
          <thead>
            <tr>
              <th>Quantity</th>
              <th>Unit price</th>
              <th>Pack price</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => {
              const packPrice = getPackPrice(row, basePrice)
              const isSelected = row.quantity === selectedQuantity

              return (
                <tr
                  key={row.quantity}
                  className={isSelected ? 'selected' : undefined}
                  tabIndex={0}
                  onClick={() => onSelect(row.quantity)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      onSelect(row.quantity)
                    }
                  }}
                >
                  <td>{row.quantity}</td>
                  <td>{formatPrice(packPrice / row.quantity)}</td>
                  <td className="quantity-pack-price">
                    <span>{formatPrice(packPrice)}</span>
                    <span className="quantity-selected-mark" aria-hidden={!isSelected}>
                      {isSelected ? '✓' : ''}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {error && <div className="price-error quantity-table-error">{error}</div>}
      </div>
    </div>
  )
}
