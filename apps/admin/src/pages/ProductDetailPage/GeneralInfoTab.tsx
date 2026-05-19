import { SectionCard } from '../../components/SectionCard'
import type { ProductField, ProductRecord } from '../../types/domain'

type Props = {
  product: ProductRecord
  fields: ProductField[]
  savedAt: string
}

export function GeneralInfoTab({ product, fields, savedAt }: Props) {
  const iframeVisibleFields = fields.filter((field) => field.visibleInProductDetails)

  return (
    <div className="page-stack">
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
          description="These fields are intended for the future embedded configurator payload."
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
    </div>
  )
}
