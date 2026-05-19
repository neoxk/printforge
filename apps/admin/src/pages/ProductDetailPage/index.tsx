import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { PageHeader, TabBar, TabPanel } from '@printforge/ui'
import type { ProductRecord, TabItem } from '@printforge/ui'
import { getProductsRequest } from '../../lib/Api'
import { GeneralInfoTab } from './GeneralInfoTab'
import { PricingAndOptionsTab } from './PricingAndOptionsTab/index'
import { PrintAreasTab } from './PrintAreasTab'

type EditorTabId = 'general' | 'pricing-options' | 'print-areas'

const EDITOR_TABS: readonly TabItem<EditorTabId>[] = [
  { id: 'general', label: 'General Info' },
  { id: 'pricing-options', label: 'Pricing & Options' },
  { id: 'print-areas', label: 'Print Areas' },
]

export function ProductDetailPage() {
  const { productId } = useParams()
  const [activeTab, setActiveTab] = useState<EditorTabId>('general')
  const [product, setProduct] = useState<ProductRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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

      <TabBar tabs={EDITOR_TABS} activeId={activeTab} onChange={setActiveTab} />

      <TabPanel id="general" activeId={activeTab}>
        <GeneralInfoTab product={product} />
      </TabPanel>

      <TabPanel id="pricing-options" activeId={activeTab}>
        <PricingAndOptionsTab product={product} />
      </TabPanel>

      <TabPanel id="print-areas" activeId={activeTab}>
        <PrintAreasTab />
      </TabPanel>
    </div>
  )
}
