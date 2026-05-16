import { SectionCard } from '@printforge/ui'
import type { ProductConfiguration, ProductField, ProductRecord } from '@printforge/ui'

type Props = {
  product: ProductRecord
  fields: ProductField[]
  savedAt: string
}

export function GeneralInfoTab({ product, fields, savedAt }: Props) {
  const iframeVisibleFields = fields.filter((f) => f.visibleInProductDetails)

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
          description="Fields that will be exposed to the product-details iframe."
        >
          <div className="detail-list">
            <div>
              <span>Visible fields</span>
              <strong>{iframeVisibleFields.length}</strong>
            </div>
            <div>
              <span>Imported from WooCommerce</span>
              <strong>{fields.filter((f) => f.source === 'woocommerce').length}</strong>
            </div>
            <div>
              <span>Custom PrintForge fields</span>
              <strong>{fields.filter((f) => f.source === 'printforge').length}</strong>
            </div>
          </div>
        </SectionCard>
      </section>

      <SectionCard
        title="Saved config model"
        description="The contract the iframe fetches from PrintForge instead of reading WooCommerce directly."
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
