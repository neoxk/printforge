import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { PageHeader } from '@printforge/ui'
import type { ProductRecord } from '@printforge/ui'
import { TabBar, TabPanel } from '../../components/TabBar'
import type { CreateViewDraft, DesignerTool, DesignerView, ZoneKey } from '../../../../configurator/src/designer/shared'
import { createEmptyDraft } from '../../../../configurator/src/designer/shared'
import { getProductsRequest } from '../../lib/Api'
import { GeneralInfoTab } from './GeneralInfoTab'
import { PricingAndOptionsTab } from './PricingAndOptionsTab/index'
import { PrintAreasTab } from './PrintAreasTab'

type ProductTab = 'general' | 'pricing-options' | 'print-areas'

const TABS = [
  { id: 'general' as const, label: 'General Info' },
  { id: 'pricing-options' as const, label: 'Pricing & Options' },
  { id: 'print-areas' as const, label: 'Print Areas' },
]

export function ProductDetailPage() {
  const { productId } = useParams()
  const [activeTab, setActiveTab] = useState<ProductTab>('general')
  const [product, setProduct] = useState<ProductRecord | null>(null)
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
        const productsResponse = await getProductsRequest()
        setProduct(productsResponse.find((p) => p.id === productId) ?? null)
      } catch {
        setProduct(null)
      } finally {
        setIsLoading(false)
      }
    }

    void loadProductEditor()
  }, [productId])

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
        description="Configure pricing rules and print areas for this product."
      />

      <TabBar<ProductTab> tabs={TABS} activeId={activeTab} onChange={setActiveTab} />

      <TabPanel<ProductTab> id="general" activeId={activeTab}>
        <GeneralInfoTab product={product} />
      </TabPanel>

      <TabPanel<ProductTab> id="pricing-options" activeId={activeTab}>
        <PricingAndOptionsTab product={product} />
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
