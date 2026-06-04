type Props = {
  quantity: string
  onChange: (quantity: string) => void
}

export function QuantityField({ quantity, onChange }: Readonly<Props>) {
  return (
    <div className="container-group">
      <div className="container-label">Quantity</div>
      <input
        className="quantity-input"
        type="number"
        min="1"
        step="1"
        inputMode="numeric"
        aria-label="Quantity"
        value={quantity}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}
