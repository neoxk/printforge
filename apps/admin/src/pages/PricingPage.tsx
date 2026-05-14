import { PlusCircle, WandSparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAppAlerts } from '@printforge/ui'
import { PageHeader } from '../components/PageHeader'
import { SectionCard } from '../components/SectionCard'
import {
  calculatePriceRequest,
  createPricingRuleRequest,
  getPricingRulesRequest,
  getProductOptionsRequest,
  getProductsRequest,
} from '../lib/Api'
import type { PricingCalculation, PricingRule, ProductField, ProductRecord } from '../types/domain'

function buildInitialOptionState(fields: ProductField[]) {
  return fields.reduce<Record<string, string>>((nextState, field) => {
    nextState[field.key] = field.options[0]?.value ?? ''
    return nextState
  }, {})
}

export function PricingPage() {
  const { showError, showInfo, showWarning } = useAppAlerts()
  const [rules, setRules] = useState<PricingRule[]>([])
  const [products, setProducts] = useState<ProductRecord[]>([])
  const [previewFields, setPreviewFields] = useState<ProductField[]>([])
  const [selectedProductId, setSelectedProductId] = useState('')
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
    async function loadPricingRules() {
      try {
        const [rulesResponse, productsResponse] = await Promise.all([
          getPricingRulesRequest(),
          getProductsRequest(),
        ])

        setRules(rulesResponse)
        setProducts(productsResponse)

        if (productsResponse[0]) {
          setSelectedProductId(productsResponse[0].id)
        }
      } catch (error) {
        showError(
          error instanceof Error ? error.message : 'Unable to load pricing rules.',
          'Pricing load failed',
        )
      }
    }

    void loadPricingRules()
  }, [])

  useEffect(() => {
    if (!selectedProductId) {
      setPreviewFields([])
      setSelectedOptions({})
      setPricePreview(null)
      return
    }

    async function loadPreviewFields() {
      try {
        const fields = await getProductOptionsRequest(selectedProductId)
        setPreviewFields(fields)
        setSelectedOptions(buildInitialOptionState(fields))
        setPricePreview(null)
      } catch (error) {
        showError(
          error instanceof Error ? error.message : 'Unable to load product pricing options.',
          'Product options unavailable',
        )
      }
    }

    void loadPreviewFields()
  }, [selectedProductId])

  function updateFormState<K extends keyof typeof formState>(key: K, value: (typeof formState)[K]) {
    setFormState((currentValue) => ({ ...currentValue, [key]: value }))
  }

  function updatePreviewOption(key: string, value: string) {
    setSelectedOptions((currentValue) => ({ ...currentValue, [key]: value }))
  }

  async function createRule() {
    setIsSubmitting(true)

    try {
      const nextRule = await createPricingRuleRequest(formState)
      setRules((currentValue) => [nextRule, ...currentValue])
      setFormState({
        name: '',
        summary: '',
        trigger: '',
        status: 'Draft',
      })
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
    if (!selectedProductId) {
      showWarning('Select a synced product before calculating pricing.', 'Product required')
      return
    }

    setIsCalculating(true)

    try {
      const nextPreview = await calculatePriceRequest({
        productId: selectedProductId,
        options: selectedOptions,
      })

      setPricePreview(nextPreview)
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
      <PageHeader
        eyebrow="Pricing"
        title="Rule builder"
        description="Pricing rules are now loaded from and saved to the backend instead of using frontend-only placeholders."
        actions={
          <button className="primary-button" type="button" onClick={createRule} disabled={isSubmitting}>
            <PlusCircle className="button-icon" aria-hidden="true" />
            {isSubmitting ? 'Creating...' : 'Create pricing rule'}
          </button>
        }
      />
      <SectionCard title="New pricing rule" description="Create a backend-backed pricing rule shell.">
        <form className="editor-form">
          <label>
            <span>Rule name</span>
            <input
              type="text"
              value={formState.name}
              onChange={(event) => updateFormState('name', event.target.value)}
            />
          </label>
          <label>
            <span>Summary</span>
            <input
              type="text"
              value={formState.summary}
              onChange={(event) => updateFormState('summary', event.target.value)}
            />
          </label>
          <label>
            <span>Trigger</span>
            <input
              type="text"
              value={formState.trigger}
              onChange={(event) => updateFormState('trigger', event.target.value)}
            />
          </label>
          <label>
            <span>Status</span>
            <select
              value={formState.status}
              onChange={(event) => updateFormState('status', event.target.value)}
            >
              <option value="Draft">Draft</option>
              <option value="Active">Active</option>
            </select>
          </label>
        </form>
      </SectionCard>

      <SectionCard
        title="Price preview"
        description="This preview uses the backend product options contract and pricing calculation endpoint."
        actions={
          <button
            className="primary-button"
            type="button"
            onClick={calculatePreview}
            disabled={isCalculating || !selectedProductId}
          >
            <WandSparkles className="button-icon" aria-hidden="true" />
            {isCalculating ? 'Calculating...' : 'Preview price'}
          </button>
        }
      >
        <form className="editor-form">
          <label>
            <span>Product</span>
            <select
              value={selectedProductId}
              onChange={(event) => setSelectedProductId(event.target.value)}
            >
              <option value="">Select a synced product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </label>

          {previewFields.map((field) => (
            <label key={field.id}>
              <span>{field.label}</span>
              {field.type === 'select' ? (
                <select
                  value={selectedOptions[field.key] ?? ''}
                  onChange={(event) => updatePreviewOption(field.key, event.target.value)}
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
                  onChange={(event) => updatePreviewOption(field.key, event.target.value)}
                />
              )}
            </label>
          ))}
        </form>

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
    </div>
  )
}
