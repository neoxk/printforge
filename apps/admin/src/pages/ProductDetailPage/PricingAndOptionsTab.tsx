import { PlusCircle, WandSparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { SectionCard, useAppAlerts } from '@printforge/ui'
import type { PricingCalculation, PricingRule, ProductField, ProductRecord } from '@printforge/ui'
import { ProductFieldEditor } from '../../components/ProductFieldEditor'
import {
  calculatePriceRequest,
  createPricingRuleRequest,
  getPricingRulesRequest,
  getProductOptionsRequest,
} from '../../lib/Api'

type Props = {
  product: ProductRecord
  fields: ProductField[]
  onUpdateField: (fieldId: string, updater: (field: ProductField) => ProductField) => void
  onAddCustomField: () => void
  onAddOption: (fieldId: string) => void
  onRemoveOption: (fieldId: string, optionId: string) => void
  onRemoveField: (fieldId: string) => void
}

function buildInitialOptionState(fields: ProductField[]): Record<string, string> {
  return fields.reduce<Record<string, string>>((acc, field) => {
    acc[field.key] = field.options[0]?.value ?? ''
    return acc
  }, {})
}

export function PricingAndOptionsTab({
  product,
  fields,
  onUpdateField,
  onAddCustomField,
  onAddOption,
  onRemoveOption,
  onRemoveField,
}: Props) {
  const { showError, showInfo } = useAppAlerts()
  const [rules, setRules] = useState<PricingRule[]>([])
  const [previewFields, setPreviewFields] = useState<ProductField[]>([])
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [pricePreview, setPricePreview] = useState<PricingCalculation | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formState, setFormState] = useState({
    name: '',
    summary: '',
    trigger: '',
    status: 'Draft',
  })

  useEffect(() => {
    async function loadPricingData() {
      try {
        const [rulesResponse, optionsResponse] = await Promise.all([
          getPricingRulesRequest(),
          getProductOptionsRequest(product.id),
        ])
        setRules(rulesResponse)
        setPreviewFields(optionsResponse)
        setSelectedOptions(buildInitialOptionState(optionsResponse))
      } catch (error) {
        showError(
          error instanceof Error ? error.message : 'Unable to load pricing data.',
          'Pricing load failed',
        )
      }
    }

    void loadPricingData()
  }, [product.id])

  function updateFormState<K extends keyof typeof formState>(key: K, value: (typeof formState)[K]) {
    setFormState((current) => ({ ...current, [key]: value }))
  }

  function updatePreviewOption(key: string, value: string) {
    setSelectedOptions((current) => ({ ...current, [key]: value }))
  }

  async function createRule() {
    setIsSubmitting(true)
    try {
      const nextRule = await createPricingRuleRequest(formState)
      setRules((current) => [nextRule, ...current])
      setFormState({ name: '', summary: '', trigger: '', status: 'Draft' })
      showInfo('The pricing rule was created in the backend.', 'Pricing rule created')
    } catch (error) {
      showError(
        error instanceof Error ? error.message : 'Unable to create pricing rule.',
        'Create failed',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function calculatePreview() {
    setIsCalculating(true)
    try {
      setPricePreview(
        await calculatePriceRequest({ productId: product.id, options: selectedOptions }),
      )
    } catch (error) {
      showError(
        error instanceof Error ? error.message : 'Unable to calculate price.',
        'Calculation failed',
      )
    } finally {
      setIsCalculating(false)
    }
  }

  return (
    <div className="page-stack">
      <SectionCard
        title="Field definitions"
        description="Imported WooCommerce attributes are prefilled here. Admin-defined fields are added beside them and saved into one normalized config."
        actions={
          <button className="ghost-button" type="button" onClick={onAddCustomField}>
            <PlusCircle className="button-icon" aria-hidden="true" />
            Add field
          </button>
        }
      >
        <div className="field-stack">
          {fields.map((field) => (
            <ProductFieldEditor
              key={field.id}
              field={field}
              onFieldChange={onUpdateField}
              onAddOption={onAddOption}
              onRemoveOption={onRemoveOption}
              onRemoveField={onRemoveField}
            />
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="New pricing rule"
        description="Create a backend-backed pricing rule for this product."
        actions={
          <button
            className="primary-button"
            type="button"
            onClick={createRule}
            disabled={isSubmitting}
          >
            <PlusCircle className="button-icon" aria-hidden="true" />
            {isSubmitting ? 'Creating...' : 'Create rule'}
          </button>
        }
      >
        <form className="editor-form">
          <label>
            <span>Rule name</span>
            <input
              type="text"
              value={formState.name}
              onChange={(e) => updateFormState('name', e.target.value)}
            />
          </label>
          <label>
            <span>Summary</span>
            <input
              type="text"
              value={formState.summary}
              onChange={(e) => updateFormState('summary', e.target.value)}
            />
          </label>
          <label>
            <span>Trigger</span>
            <input
              type="text"
              value={formState.trigger}
              onChange={(e) => updateFormState('trigger', e.target.value)}
            />
          </label>
          <label>
            <span>Status</span>
            <select
              value={formState.status}
              onChange={(e) => updateFormState('status', e.target.value)}
            >
              <option value="Draft">Draft</option>
              <option value="Active">Active</option>
            </select>
          </label>
        </form>
      </SectionCard>

      <SectionCard
        title="Price preview"
        description="Preview pricing for this product using the backend calculation endpoint."
        actions={
          <button
            className="primary-button"
            type="button"
            onClick={calculatePreview}
            disabled={isCalculating}
          >
            <WandSparkles className="button-icon" aria-hidden="true" />
            {isCalculating ? 'Calculating...' : 'Preview price'}
          </button>
        }
      >
        {previewFields.length > 0 ? (
          <form className="editor-form">
            {previewFields.map((field) => (
              <label key={field.id}>
                <span>{field.label}</span>
                {field.type === 'select' ? (
                  <select
                    value={selectedOptions[field.key] ?? ''}
                    onChange={(e) => updatePreviewOption(field.key, e.target.value)}
                  >
                    {field.options.map((option) => (
                      <option key={option.id} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type === 'number' ? 'number' : 'text'}
                    value={selectedOptions[field.key] ?? ''}
                    onChange={(e) => updatePreviewOption(field.key, e.target.value)}
                  />
                )}
              </label>
            ))}
          </form>
        ) : (
          <p className="empty-row muted-copy">No configurable options for this product yet.</p>
        )}

        {pricePreview ? (
          <div className="detail-list compact">
            <div>
              <span>Total price</span>
              <strong>{pricePreview.price.toFixed(2)}</strong>
            </div>
            <div>
              <span>Applied rules</span>
              <strong>{pricePreview.breakdown.length}</strong>
            </div>
            <div>
              <span>Selected options</span>
              <strong>{Object.keys(pricePreview.options).length}</strong>
            </div>
          </div>
        ) : null}

        {pricePreview?.breakdown.length ? (
          <div className="table-shell">
            <table>
              <thead>
                <tr>
                  <th>Rule</th>
                  <th>Trigger</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {pricePreview.breakdown.map((item) => (
                  <tr key={item.ruleId}>
                    <td>{item.label}</td>
                    <td>{item.trigger}</td>
                    <td>{item.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </SectionCard>

      {rules.length > 0 ? (
        <section className="rule-grid">
          {rules.map((rule) => (
            <SectionCard
              key={rule.id}
              title={rule.name}
              description={rule.summary}
              actions={
                <div className="card-tag-row">
                  <WandSparkles className="inline-icon" aria-hidden="true" />
                  <span className="inline-tag">{rule.status}</span>
                </div>
              }
            >
              <div className="detail-list compact">
                <div>
                  <span>Trigger</span>
                  <strong>{rule.trigger}</strong>
                </div>
                <div>
                  <span>Persistence</span>
                  <strong>Backend database</strong>
                </div>
              </div>
            </SectionCard>
          ))}
        </section>
      ) : null}
    </div>
  )
}
