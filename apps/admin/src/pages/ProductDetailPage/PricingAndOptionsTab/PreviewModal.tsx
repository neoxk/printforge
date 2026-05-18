import { X } from 'lucide-react'

// TODO: replace with env variable or derive from deployment config
const CONFIGURATOR_URL = 'http://localhost:5174'

type Props = {
  productId: string
  isOpen: boolean
  onClose: () => void
}

export function PreviewModal({ productId, isOpen, onClose }: Props) {
  if (!isOpen) return null

  const src = `${CONFIGURATOR_URL}?productId=${productId}`

  return (
    <div className="preview-modal-backdrop" onClick={onClose} aria-hidden="true">
      <div
        className="preview-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Customer preview"
      >
        <div className="preview-modal-header">
          <span className="preview-modal-title">Customer Preview</span>
          <button className="icon-button-sm" type="button" onClick={onClose} aria-label="Close">
            <X size={16} aria-hidden="true" />
          </button>
        </div>
        <div className="preview-modal-body">
          <iframe
            src={src}
            title="Configurator preview"
            className="preview-modal-iframe"
            allow="same-origin"
          />
        </div>
      </div>
    </div>
  )
}
