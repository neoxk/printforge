import type { DimensionsState } from './types.js'

type Props = {
  dimensions: DimensionsState
  onChange: (dimensions: DimensionsState) => void
}

export function DimensionsFields({ dimensions, onChange }: Props) {
  return (
    <div className="container-group">
      <div className="container-label">Choose your dimensions</div>
      <div className="dimensions-row">
        <input
          type="number"
          min="1"
          inputMode="decimal"
          aria-label="Width in millimeters"
          placeholder="Width"
          value={dimensions.widthMm}
          onChange={(event) => onChange({ ...dimensions, widthMm: event.target.value })}
        />
        <span className="dimensions-sep">x</span>
        <input
          type="number"
          min="1"
          inputMode="decimal"
          aria-label="Height in millimeters"
          placeholder="Height"
          value={dimensions.heightMm}
          onChange={(event) => onChange({ ...dimensions, heightMm: event.target.value })}
        />
        <span className="dimensions-sep">mm</span>
      </div>
    </div>
  )
}
