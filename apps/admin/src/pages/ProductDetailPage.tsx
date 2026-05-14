import { PlusCircle, Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { useAppAlerts } from '@printforge/ui'
import { ProductFieldEditor } from '../components/ProductFieldEditor'
import { PageHeader } from '../components/PageHeader'
import { SectionCard } from '../components/SectionCard'
import {
  getProductConfigurationRequest,
  getProductsRequest,
  saveProductConfigurationRequest,
} from '../lib/Api'
import { createCustomField } from '../lib/ProductFields'
import type { ProductConfiguration, ProductField, ProductRecord } from '../types/domain'

function createOptionId(fieldId: string) {
  return `${fieldId}-option-${Date.now()}`
}

export function ProductDetailPage() {
  const { productId } = useParams()
  const { showError, showInfo } = useAppAlerts()
  const [product, setProduct] = useState<ProductRecord | null>(null)
  const [fields, setFields] = useState<ProductField[]>([])
  const [savedAt, setSavedAt] = useState('Not saved yet')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!productId) {
      return
    }

    async function loadProductEditor() {
      try {
        const [productsResponse, configurationResponse] = await Promise.all([
          getProductsRequest(),
          getProductConfigurationRequest(productId),
        ])

        const matchedProduct = productsResponse.find((entry) => entry.id === productId) ?? null

        setProduct(matchedProduct)
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

  if (!productId) {
    return <Navigate to="/products" replace />
  }

  if (!isLoading && !product) {
    return <Navigate to="/products" replace />
  }

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

  function updateField(fieldId: string, updater: (field: ProductField) => ProductField) {
    setFields((currentFields) =>
      currentFields.map((field) => (field.id === fieldId ? updater(field) : field)),
    )
  }

  function addCustomField() {
    setFields((currentFields) => [...currentFields, createCustomField(product.id)])
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
        field.options.length > 1
          ? field.options.filter((option) => option.id !== optionId)
          : field.options,
    }))
  }

  function removeField(fieldId: string) {
    setFields((currentFields) => currentFields.filter((field) => field.id !== fieldId))
  }

  async function saveConfiguration() {
    const nextSavedAt = new Date().toISOString()

    try {
      const response = await saveProductConfigurationRequest(product.id, {
        fields,
        savedAt: nextSavedAt,
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

  const iframeVisibleFields = fields.filter((field) => field.visibleInProductDetails)

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Product Editor"
        title={product.name}
        description="The admin defines the product fields here, and the future product-details iframe can fetch this saved configuration directly from the backend."
        actions={
          <div className="button-row">
            <button className="primary-button" type="button" onClick={saveConfiguration}>
              <Save className="button-icon" aria-hidden="true" />
              Save configuration
            </button>
          </div>
        }
      />
      <section className="content-grid">
        <SectionCard title="Commerce data" description="Mirrored from the upstream store.">
          <div className="detail-list">
            <div>
              <span>SKU</span>
              <strong>{product.sku}</strong>
            </div>
            <div>
              <span>Category</span>
              <strong>{product.category}</strong>
            </div>
            <div>
              <span>Base price</span>
              <strong>{product.basePrice}</strong>
            </div>
            <div>
              <span>Sync state</span>
              <strong>{product.syncStatus}</strong>
            </div>
            <div>
              <span>Data source</span>
              <strong>Backend product sync store</strong>
            </div>
            <div>
              <span>Configuration saved</span>
              <strong>{savedAt}</strong>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Iframe payload preview"
          description="These are the fields that would be exposed to the product-details iframe."
        >
          <div className="detail-list">
            <div>
              <span>Visible fields</span>
              <strong>{iframeVisibleFields.length}</strong>
            </div>
            <div>
              <span>Imported from WooCommerce</span>
              <strong>{fields.filter((field) => field.source === 'woocommerce').length}</strong>
            </div>
            <div>
              <span>Custom PrintForge fields</span>
              <strong>{fields.filter((field) => field.source === 'printforge').length}</strong>
            </div>
          </div>
        </SectionCard>
      </section>

      <SectionCard
        title="Field definitions"
        description="Imported WooCommerce attributes are prefilled here. Admin-defined fields are added beside them and saved into one normalized config."
        actions={
          <button className="ghost-button" type="button" onClick={addCustomField}>
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
              onFieldChange={updateField}
              onAddOption={addOption}
              onRemoveOption={removeOption}
              onRemoveField={removeField}
            />
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Saved config model"
        description="This is the contract the iframe should later fetch from PrintForge instead of reading WooCommerce directly."
      >
        <pre className="code-block">
          {JSON.stringify(
            {
              productId: product.id,
              fields: iframeVisibleFields,
              savedAt,
            } satisfies ProductConfiguration,
            null,
            2,
          )}
        </pre>
      </SectionCard>
    </div>
  )
}
