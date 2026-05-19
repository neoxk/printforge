import { Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { useAppAlerts } from '@printforge/ui'
import { PageHeader } from '../../components/PageHeader'
import { TabBar, TabPanel } from '../../components/TabBar'
import type { CreateViewDraft, DesignerTool, DesignerView, ZoneKey } from '../../../../configurator/src/designer/shared'
import { createEmptyDraft } from '../../../../configurator/src/designer/shared'
import {
  getProductConfigurationRequest,
  getProductsRequest,
  saveProductConfigurationRequest,
} from '../../lib/Api'
import { createCustomField } from '../../lib/ProductFields'
import type { ProductField, ProductRecord } from '../../types/domain'
import { GeneralInfoTab } from './GeneralInfoTab'
import { PricingAndOptionsTab } from './PricingAndOptionsTab'
import { PrintAreasTab } from './PrintAreasTab'

type ProductTab = 'general' | 'pricing' | 'print-areas'

const TABS = [
  { id: 'general' as const, label: 'General Info' },
  { id: 'pricing' as const, label: 'Pricing & Options' },
  { id: 'print-areas' as const, label: 'Print Areas' },
]

function createOptionId(fieldId: string) {
  return `${fieldId}-option-${Date.now()}`
}

export function ProductDetailPage() {
  const { productId } = useParams()
  const { showError, showInfo } = useAppAlerts()
  const [activeTab, setActiveTab] = useState<ProductTab>('general')
  const [product, setProduct] = useState<ProductRecord | null>(null)
  const [fields, setFields] = useState<ProductField[]>([])
  const [savedAt, setSavedAt] = useState('Not saved yet')
  const [isLoading, setIsLoading] = useState(true)
  const [printAreaViews, setPrintAreaViews] = useState<DesignerView[]>([])
  const [selectedPrintAreaViewId, setSelectedPrintAreaViewId] = useState<string | null>(null)
  const [printAreaDraft, setPrintAreaDraft] = useState<CreateViewDraft>(createEmptyDraft())
  const [printAreaTool, setPrintAreaTool] = useState<DesignerTool>('select')
  const [activeDrawTarget, setActiveDrawTarget] = useState<ZoneKey | null>(null)
  const [printAreaZoom, setPrintAreaZoom] = useState(1)
  const [printAreaPan, setPrintAreaPan] = useState({ x: 0, y: 0 })
  const [printAreaStatusMessage, setPrintAreaStatusMessage] = useState(
    'Create a view to start defining print zones.',
  )

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

      <TabBar<ProductTab> tabs={TABS} activeId={activeTab} onChange={setActiveTab} />

      <TabPanel<ProductTab> id="general" activeId={activeTab}>
        <GeneralInfoTab product={product} fields={fields} savedAt={savedAt} />
      </TabPanel>

      <TabPanel<ProductTab> id="pricing" activeId={activeTab}>
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

      <TabPanel<ProductTab> id="print-areas" activeId={activeTab}>
        <PrintAreasTab
          state={{
            views: printAreaViews,
            selectedViewId: selectedPrintAreaViewId,
            draft: printAreaDraft,
            activeTool: printAreaTool,
            activeDrawTarget,
            zoom: printAreaZoom,
            pan: printAreaPan,
            statusMessage: printAreaStatusMessage,
          }}
          actions={{
            setViews: setPrintAreaViews,
            setSelectedViewId: setSelectedPrintAreaViewId,
            setDraft: setPrintAreaDraft,
            setActiveTool: setPrintAreaTool,
            setActiveDrawTarget,
            setZoom: setPrintAreaZoom,
            setPan: setPrintAreaPan,
            setStatusMessage: setPrintAreaStatusMessage,
          }}
        />
      </TabPanel>
    </div>
  )
}
