import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { PageHeader } from '@printforge/ui'
import type { ProductRecord } from '@printforge/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@printforge/ui/components/ui/tabs'
import type { CreateViewDraft, DesignerTool, DesignerView, ZoneKey } from '@printforge/ui/designer'
import { createEmptyDraft } from '@printforge/ui/designer'
import { getProductsRequest } from '../../lib/Api'
import { GeneralInfoTab } from './GeneralInfoTab'
import { PricingAndOptionsTab } from './PricingAndOptionsTab/index'
import { PrintAreasTab } from './PrintAreasTab'

export function ProductDetailPage() {
  const { productId } = useParams()
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
      <div className="flex flex-col gap-6">
        <PageHeader
          eyebrow="Product Editor"
          title="Loading product"
          description="Fetching the product configuration from the backend."
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Product Editor"
        title={product.name}
        description="Configure pricing rules and print areas for this product."
      />

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General Info</TabsTrigger>
          <TabsTrigger value="pricing-options">Pricing & Options</TabsTrigger>
          <TabsTrigger value="print-areas">Print Areas</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4">
          <GeneralInfoTab product={product} />
        </TabsContent>

        <TabsContent value="pricing-options" className="mt-4">
          <PricingAndOptionsTab product={product} />
        </TabsContent>

        <TabsContent value="print-areas" className="mt-4">
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
