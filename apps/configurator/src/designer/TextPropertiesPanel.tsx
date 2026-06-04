import { AlignCenter, AlignLeft, AlignRight, Bold, Italic, Strikethrough, Underline } from 'lucide-react'
import { FONT_OPTIONS, WEIGHT_LABELS } from './fonts.js'

const MM_PER_PT = 25.4 / 72  // 1 point in mm
export const ptToMm = (pt: number) => pt * MM_PER_PT
export const mmToPt = (mm: number) => Math.round(mm / MM_PER_PT)

export type TextProps = {
  text: string
  fontFamily: string
  fontWeight: string
  fontStyle: 'normal' | 'italic'
  fontSize: number      // mm
  fill: string
  textAlign: 'left' | 'center' | 'right'
  charSpacing: number   // Fabric units (thousandths of em)
  lineHeight: number    // multiplier
  underline: boolean
  linethrough: boolean
}

type Props = {
  value: TextProps
  onChange: <K extends keyof TextProps>(key: K, value: TextProps[K]) => void
}

const ALIGN_OPTIONS = [
  { value: 'left'   as const, icon: <AlignLeft size={14} />,    label: 'Align left'    },
  { value: 'center' as const, icon: <AlignCenter size={14} />,  label: 'Align center'  },
  { value: 'right'  as const, icon: <AlignRight size={14} />,   label: 'Align right'   },
]

export function TextPropertiesPanel({ value, onChange }: Readonly<Props>) {
  const fontOption = FONT_OPTIONS.find((f) => f.name === value.fontFamily)
  const availableWeights = fontOption?.weights ?? ['400', '700']
  const supportsItalic = fontOption?.hasItalic ?? true
  const contentId = 'text-prop-content'
  const fontId = 'text-prop-font'
  const weightId = 'text-prop-weight'
  const sizeId = 'text-prop-size'
  const colorId = 'text-prop-color'
  const letterSpacingId = 'text-prop-letter-spacing'
  const lineHeightId = 'text-prop-line-height'

  return (
    <div className="designer-card text-panel">
      <p className="designer-eyebrow">Text</p>

      {/* Text content */}
      <div className="text-prop-group">
        <label className="text-prop-label" htmlFor={contentId}>Content</label>
        <textarea
          id={contentId}
          className="text-prop-textarea"
          value={value.text}
          rows={2}
          onChange={(e) => onChange('text', e.target.value)}
        />
      </div>

      {/* Font family */}
      <div className="text-prop-group">
        <label className="text-prop-label" htmlFor={fontId}>Font</label>
        <select
          id={fontId}
          className="text-prop-select text-prop-select--font"
          value={value.fontFamily}
          style={{ fontFamily: value.fontFamily }}
          onChange={(e) => onChange('fontFamily', e.target.value)}
        >
          {FONT_OPTIONS.map((f) => (
            <option key={f.name} value={f.name} style={{ fontFamily: f.name }}>
              {f.name}
            </option>
          ))}
        </select>
      </div>

      {/* Weight + Italic */}
      <div className="text-prop-row">
        <div className="text-prop-group text-prop-col">
          <label className="text-prop-label" htmlFor={weightId}>Weight</label>
          <select
            id={weightId}
            className="text-prop-select"
            value={value.fontWeight}
            onChange={(e) => onChange('fontWeight', e.target.value)}
          >
            {availableWeights.map((w) => (
              <option key={w} value={w}>
                {WEIGHT_LABELS[w] ?? w}
              </option>
            ))}
          </select>
        </div>

        <div className="text-prop-group text-prop-col text-prop-col--narrow">
          <p className="text-prop-label">Style</p>
          <div className="text-toggle-row">
            <button
              type="button"
              className={value.fontStyle === 'italic' && supportsItalic ? 'text-toggle text-toggle--on' : 'text-toggle'}
              disabled={!supportsItalic}
              onClick={() => onChange('fontStyle', value.fontStyle === 'italic' ? 'normal' : 'italic')}
              title="Italic"
            >
              <Italic size={13} />
            </button>
            <button
              type="button"
              className={value.fontWeight >= '700' ? 'text-toggle text-toggle--on' : 'text-toggle'}
              onClick={() => onChange('fontWeight', value.fontWeight >= '700' ? '400' : '700')}
              title="Bold"
            >
              <Bold size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Size + Color */}
      <div className="text-prop-row">
        <div className="text-prop-group text-prop-col">
          <label className="text-prop-label" htmlFor={sizeId}>Size (pt)</label>
          <input
            id={sizeId}
            type="number"
            className="text-prop-input"
            min={4}
            max={288}
            step={1}
            value={mmToPt(value.fontSize)}
            onChange={(e) => {
              const pt = Math.max(4, Math.min(288, Number(e.target.value)))
              onChange('fontSize', ptToMm(pt))
            }}
          />
        </div>

        <div className="text-prop-group text-prop-col text-prop-col--narrow">
          <label className="text-prop-label" htmlFor={colorId}>Color</label>
          <input
            id={colorId}
            type="color"
            className="text-prop-color"
            value={value.fill.startsWith('#') ? value.fill : '#0f172a'}
            onChange={(e) => onChange('fill', e.target.value)}
          />
        </div>
      </div>

      {/* Alignment */}
      <div className="text-prop-group">
        <p className="text-prop-label">Alignment</p>
        <div className="text-toggle-row">
          {ALIGN_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={value.textAlign === opt.value ? 'text-toggle text-toggle--on text-toggle--wide' : 'text-toggle text-toggle--wide'}
              onClick={() => onChange('textAlign', opt.value)}
              title={opt.label}
            >
              {opt.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Underline + Strikethrough */}
      <div className="text-prop-group">
        <p className="text-prop-label">Decoration</p>
        <div className="text-toggle-row">
          <button
            type="button"
            className={value.underline ? 'text-toggle text-toggle--on' : 'text-toggle'}
            onClick={() => onChange('underline', !value.underline)}
            title="Underline"
          >
            <Underline size={13} />
          </button>
          <button
            type="button"
            className={value.linethrough ? 'text-toggle text-toggle--on' : 'text-toggle'}
            onClick={() => onChange('linethrough', !value.linethrough)}
            title="Strikethrough"
          >
            <Strikethrough size={13} />
          </button>
        </div>
      </div>

      {/* Letter spacing */}
      <div className="text-prop-group">
        <div className="text-prop-label-row">
          <label className="text-prop-label" htmlFor={letterSpacingId}>Letter spacing</label>
          <span className="text-prop-badge">{value.charSpacing}</span>
        </div>
        <input
          id={letterSpacingId}
          type="range"
          className="text-prop-slider"
          min={-200}
          max={800}
          step={10}
          value={value.charSpacing}
          onChange={(e) => onChange('charSpacing', Number(e.target.value))}
        />
      </div>

      {/* Line height */}
      <div className="text-prop-group">
        <div className="text-prop-label-row">
          <label className="text-prop-label" htmlFor={lineHeightId}>Line height</label>
          <span className="text-prop-badge">{value.lineHeight.toFixed(2)}</span>
        </div>
        <input
          id={lineHeightId}
          type="range"
          className="text-prop-slider"
          min={0.8}
          max={3}
          step={0.05}
          value={value.lineHeight}
          onChange={(e) => onChange('lineHeight', Number(e.target.value))}
        />
      </div>
    </div>
  )
}
