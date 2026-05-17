import { Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { PageHeader, TabBar, TabPanel, useAppAlerts } from '@printforge/ui'
import type { ProductField, ProductRecord, TabItem } from '@printforge/ui'
import {
  getProductConfigurationRequest,
  getProductsRequest,
  saveProductConfigurationRequest,
} from '../../lib/Api'
import { createCustomField } from '../../lib/ProductFields'
import { GeneralInfoTab } from './GeneralInfoTab'
import { PricingAndOptionsTab } from './PricingAndOptionsTab'
import { PrintAreasTab } from './PrintAreasTab'

type EditorTabId = 'general' | 'pricing-options' | 'print-areas'

const EDITOR_TABS: readonly TabItem<EditorTabId>[] = [
  { id: 'general', label: 'General Info' },
  { id: 'pricing-options', label: 'Pricing & Options' },
  { id: 'print-areas', label: 'Print Areas' },
]

function createOptionId(fieldId: string) {
  return `${fieldId}-option-${Date.now()}`
}

export function ProductDetailPage() {
  const { productId } = useParams()
  const { showError, showInfo } = useAppAlerts()
  const [activeTab, setActiveTab] = useState<EditorTabId>('general')
  const [product, setProduct] = useState<ProductRecord | null>(null)
  const [fields, setFields] = useState<ProductField[]>([])
  const [savedAt, setSavedAt] = useState('Not saved yet')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!productId) return

    async function loadProductEditor() {
      try {
        const [productsResponse, configurationResponse] = await Promise.all([
          getProductsRequest(),
          getProductConfigurationRequest(productId!),
        ])
        setProduct(productsResponse.find((p) => p.id === productId) ?? null)
        setFields(configurationResponse.fields)
        setSavedAt(configurationResponse.savedAt)
      } catch {
        setProduct(null)
      } finally {
        setIsLoading(false)
      }
    }

    void loadProductEditor()
  }, [productId])

  function updateField(fieldId: string, updater: (field: ProductField) => ProductField) {
    setFields((current) => current.map((f) => (f.id === fieldId ? updater(f) : f)))
  }

  function addCustomField() {
    if (!product) return
    setFields((current) => [...current, createCustomField(product.id)])
  }

  function addOption(fieldId: string) {
    updateField(fieldId, (field) => ({
      ...field,
      options: [
        ...field.options,
        {
          id: createOptionId(fieldId),
          label: `Option ${field.options.length + 1}`,
          value: `option_${field.options.length + 1}`,
          description: '',
          price: '',
        },
      ],
    }))
  }

  function removeOption(fieldId: string, optionId: string) {
    updateField(fieldId, (field) => ({
      ...field,
      options:
        field.options.length > 1 ? field.options.filter((o) => o.id !== optionId) : field.options,
    }))
  }

  function removeField(fieldId: string) {
    setFields((current) => current.filter((f) => f.id !== fieldId))
  }

  async function saveConfiguration() {
    if (!product) return
    try {
      const response = await saveProductConfigurationRequest(product.id, {
        fields,
        savedAt: new Date().toISOString(),
      })
      setFields(response.fields)
      setSavedAt(response.savedAt)
      showInfo('The product configuration was saved to the backend.', 'Configuration saved')
    } catch (error) {
      showError(
        error instanceof Error ? error.message : 'Unable to save configuration.',
        'Save failed',
      )
    }
  }

  if (!productId) return <Navigate to="/products" replace />
  if (!isLoading && !product) return <Navigate to="/products" replace />

  if (!product) {
    return (
      <div className="page-stack">
        <PageHeader
          eyebrow="Product Editor"
          title="Loading product"
          description="Fetching the product configuration from the backend."
        />
      </div>
    )
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Product Editor"
        title={product.name}
        description="Configure fields, pricing rules, and print areas for this product."
        actions={
          <button className="primary-button" type="button" onClick={saveConfiguration}>
            <Save className="button-icon" aria-hidden="true" />
            Save configuration
          </button>
        }
      />

      <TabBar tabs={EDITOR_TABS} activeId={activeTab} onChange={setActiveTab} />

      <TabPanel id="general" activeId={activeTab}>
        <GeneralInfoTab product={product} fields={fields} savedAt={savedAt} />
      </TabPanel>

      <TabPanel id="pricing-options" activeId={activeTab}>
        <PricingAndOptionsTab
          product={product}
          fields={fields}
          onUpdateField={updateField}
          onAddCustomField={addCustomField}
          onAddOption={addOption}
          onRemoveOption={removeOption}
          onRemoveField={removeField}
        />
      </TabPanel>

      <TabPanel id="print-areas" activeId={activeTab}>
        <PrintAreasTab />
      </TabPanel>
    </div>
  )
}
