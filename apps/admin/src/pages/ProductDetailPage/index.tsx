import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { PageHeader, PageStack, useAppAlerts } from '@printforge/ui'
import type { ProductRecord } from '@printforge/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@printforge/ui/components/ui/tabs'
import type { CreateViewDraft, DesignerTool, DesignerView, ZoneKey } from '@printforge/ui/designer'
import { createEmptyDraft } from '@printforge/ui/designer'
import { getProductPrintAreasRequest, getProductsRequest, saveProductPrintAreasRequest } from '../../lib/Api'
import { GeneralInfoTab } from './GeneralInfoTab'
import { PrintAreasPreviewModal } from './PrintAreasPreviewModal'
import { PricingAndOptionsTab } from './PricingAndOptionsTab/index'
import { PrintAreasTab } from './PrintAreasTab'

export function ProductDetailPage() {
  const { productId } = useParams()
  const { showError, showInfo } = useAppAlerts()
  const [product, setProduct] = useState<ProductRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPrintAreasSaving, setIsPrintAreasSaving] = useState(false)
  const [isPrintAreasPreviewOpen, setIsPrintAreasPreviewOpen] = useState(false)
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
        const nextProduct = productsResponse.find((p) => p.id === productId) ?? null
        setProduct(nextProduct)

        if (!nextProduct) {
          return
        }

        try {
          const printAreaResponse = await getProductPrintAreasRequest(nextProduct.id)
          const nextViews = Array.isArray(printAreaResponse.views) ? printAreaResponse.views : []

          setPrintAreaViews(nextViews)
          setSelectedPrintAreaViewId(nextViews[0]?.id ?? null)
          setPrintAreaStatusMessage(
            nextViews.length > 0
              ? 'Loaded print area configuration from the backend.'
              : 'Create a view to start defining print zones.',
          )
        } catch (error) {
          setPrintAreaViews([])
          setSelectedPrintAreaViewId(null)
          setPrintAreaStatusMessage('Unable to load saved print areas from the backend.')
          showError(
            error instanceof Error ? error.message : 'Failed to load print area configuration.',
            'Print areas load failed',
          )
        }
      } catch {
        setProduct(null)
      } finally {
        setIsLoading(false)
      }
    }
    void loadProductEditor()
  }, [productId, showError])

  async function handleSavePrintAreas() {
    if (!product) {
      return
    }

    setIsPrintAreasSaving(true)

    try {
      const response = await saveProductPrintAreasRequest(product.id, printAreaViews)
      const nextViews = Array.isArray(response.views) ? response.views : []

      setPrintAreaViews(nextViews)
      setSelectedPrintAreaViewId((current) =>
        nextViews.some((view) => view.id === current) ? current : (nextViews[0]?.id ?? null),
      )
      setPrintAreaStatusMessage('Print area configuration saved to the backend.')
      showInfo('The print area configuration is now stored in the backend.', 'Print areas saved')
    } catch (error) {
      setPrintAreaStatusMessage('Unable to save print area configuration.')
      showError(
        error instanceof Error ? error.message : 'Failed to save print area configuration.',
        'Print areas save failed',
      )
    } finally {
      setIsPrintAreasSaving(false)
    }
  }

  async function handlePreviewPrintAreas() {
    if (!product) {
      return
    }

    setIsPrintAreasSaving(true)

    try {
      const response = await saveProductPrintAreasRequest(product.id, printAreaViews)
      const nextViews = Array.isArray(response.views) ? response.views : []

      setPrintAreaViews(nextViews)
      setSelectedPrintAreaViewId((current) =>
        nextViews.some((view) => view.id === current) ? current : (nextViews[0]?.id ?? null),
      )
      setPrintAreaStatusMessage('Opening the end-user preview using the saved backend configuration.')
      setIsPrintAreasPreviewOpen(true)
    } catch (error) {
      setPrintAreaStatusMessage('Unable to open the preview because saving failed.')
      showError(
        error instanceof Error ? error.message : 'Failed to save print area configuration.',
        'Preview failed',
      )
    } finally {
      setIsPrintAreasSaving(false)
    }
  }

  if (!productId) return <Navigate to="/products" replace />
  if (!isLoading && !product) return <Navigate to="/products" replace />

  if (!product) {
    return (
      <PageStack>
        <PageHeader
          eyebrow="Product Editor"
          title="Loading product"
          description="Fetching the product configuration from the backend."
        />
      </PageStack>
    )
  }

  return (
    <PageStack>
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

        <TabsContent value="general">
          <GeneralInfoTab product={product} />
        </TabsContent>

        <TabsContent value="pricing-options">
          <PricingAndOptionsTab product={product} />
        </TabsContent>

        <TabsContent value="print-areas">
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
            isSaving={isPrintAreasSaving}
            onSave={handleSavePrintAreas}
            onPreview={handlePreviewPrintAreas}
          />
        </TabsContent>
      </Tabs>

      <PrintAreasPreviewModal
        productId={product.id}
        isOpen={isPrintAreasPreviewOpen}
        onClose={() => setIsPrintAreasPreviewOpen(false)}
      />
    </PageStack>
  )
}
