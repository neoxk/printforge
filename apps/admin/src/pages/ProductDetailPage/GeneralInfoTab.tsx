import { SectionCard } from '../../components/SectionCard'
import type { ProductRecord } from '@printforge/ui'

type Props = {
  product: ProductRecord
}

export function GeneralInfoTab({ product }: Props) {
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
          </div>
        </SectionCard>
      </section>
    </div>
  )
}
