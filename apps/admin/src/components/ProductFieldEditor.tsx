import { Plus, Trash2 } from 'lucide-react'
import type { ProductField } from '../types/domain'

type ProductFieldEditorProps = {
  field: ProductField
  onFieldChange: (fieldId: string, updater: (field: ProductField) => ProductField) => void
  onAddOption: (fieldId: string) => void
  onRemoveOption: (fieldId: string, optionId: string) => void
  onRemoveField: (fieldId: string) => void
}

export function ProductFieldEditor({
  field,
  onFieldChange,
  onAddOption,
  onRemoveOption,
  onRemoveField,
}: ProductFieldEditorProps) {
  const isImported = field.source === 'woocommerce'

  return (
    <article className="field-card">
      <header className="field-card-head">
        <div className="field-card-copy">
          <div className="field-card-title-row">
            <strong>{field.label}</strong>
            <span className={`status-pill ${isImported ? 'status-info' : 'status-neutral'}`}>
              {isImported ? 'Imported' : 'Custom'}
            </span>
          </div>
          <p className="muted-copy">{field.helpText}</p>
        </div>
      </header>

      <div className="field-grid">
        <label>
          <span>Field label</span>
          <input
            type="text"
            value={field.label}
            onChange={(event) => {
              const nextLabel = event.target.value

              onFieldChange(field.id, (currentField) => ({
                ...currentField,
                label: nextLabel,
              }))
            }}
          />
        </label>

        <label>
          <span>Field key</span>
          <input
            type="text"
            value={field.key}
            onChange={(event) => {
              const nextKey = event.target.value

              onFieldChange(field.id, (currentField) => ({
                ...currentField,
                key: nextKey,
              }))
            }}
          />
        </label>

        <label>
          <span>Shown in iframe</span>
          <select
            value={field.visibleInProductDetails ? 'yes' : 'no'}
            onChange={(event) => {
              onFieldChange(field.id, (currentField) => ({
                ...currentField,
                visibleInProductDetails: event.target.value === 'yes',
              }))
            }}
          >
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </label>

        <label>
          <span>Used for pricing</span>
          <select
            value={field.usedForPricing ? 'yes' : 'no'}
            onChange={(event) => {
              onFieldChange(field.id, (currentField) => ({
                ...currentField,
                usedForPricing: event.target.value === 'yes',
              }))
            }}
          >
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        </label>
      </div>

      <div className="field-options">
        <div className="field-options-head">
          <strong>Options</strong>
          <button type="button" className="field-action-button" onClick={() => onAddOption(field.id)}>
            <Plus className="button-icon" aria-hidden="true" />
            Add option
          </button>
        </div>

        <div className="field-options-list">
          {field.options.map((option) => (
            <div
              key={option.id}
              className={
                field.usedForPricing
                  ? 'field-option-row field-option-row-pricing'
                  : 'field-option-row field-option-row-compact'
              }
            >
              <label>
                <span>Option</span>
                <input
                  type="text"
                  value={option.label}
                  onChange={(event) => {
                    const nextLabel = event.target.value

                    onFieldChange(field.id, (currentField) => ({
                      ...currentField,
                      options: currentField.options.map((currentOption) =>
                        currentOption.id === option.id
                          ? {
                              ...currentOption,
                              label: nextLabel,
                              value: nextLabel.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_'),
                            }
                          : currentOption,
                      ),
                    }))
                  }}
                />
              </label>

              <label>
                <span>Description</span>
                <input
                  type="text"
                  value={option.description}
                  onChange={(event) => {
                    const nextDescription = event.target.value

                    onFieldChange(field.id, (currentField) => ({
                      ...currentField,
                      options: currentField.options.map((currentOption) =>
                        currentOption.id === option.id
                          ? {
                              ...currentOption,
                              description: nextDescription,
                            }
                          : currentOption,
                      ),
                    }))
                  }}
                />
              </label>

              {field.usedForPricing ? (
                <label>
                  <span>Price</span>
                  <input
                    type="text"
                    value={option.price}
                    onChange={(event) => {
                      const nextPrice = event.target.value

                      onFieldChange(field.id, (currentField) => ({
                        ...currentField,
                        options: currentField.options.map((currentOption) =>
                          currentOption.id === option.id
                            ? {
                                ...currentOption,
                                price: nextPrice,
                              }
                            : currentOption,
                        ),
                      }))
                    }}
                  />
                </label>
              ) : null}

              <button
                type="button"
                className="field-icon-button field-action-danger"
                onClick={() => onRemoveOption(field.id, option.id)}
              >
                <Trash2 className="button-icon" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {!isImported ? (
        <footer className="field-card-footer">
          <button
            type="button"
            className="field-action-button field-action-danger"
            onClick={() => onRemoveField(field.id)}
          >
            <Trash2 className="button-icon" aria-hidden="true" />
            Remove field
          </button>
        </footer>
      ) : null}
    </article>
  )
}
