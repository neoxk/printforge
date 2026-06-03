import { SectionCard, StatusPill } from '@printforge/ui'
import type { ProductRecord } from '@printforge/ui'

type Props = {
  product: ProductRecord
}

export function GeneralInfoTab({ product }: Readonly<Props>) {
  return (
    <div className="mt-5 grid gap-5 lg:grid-cols-2">
      <SectionCard title="Store data" description="Pulled from WooCommerce — read only.">
        <div className="divide-y divide-border">
          {[
            { label: 'Product name', value: product.name },
            { label: 'Product code', value: product.sku || '—' },
            { label: 'WooCommerce ID', value: product.wooProductId },
            { label: 'Category', value: product.category || '—' },
            { label: 'Base price', value: product.basePrice },
          ].map(({ label, value }) => (
            <div key={label} className="grid gap-0.5 py-3">
              <span className="text-xs text-muted-foreground">{label}</span>
              <strong className="text-sm font-medium">{value}</strong>
            </div>
          ))}
          <div className="grid gap-0.5 py-3">
            <span className="text-xs text-muted-foreground">Status</span>
            <div>
              <StatusPill
                label={product.status === 'publish' ? 'Published' : (product.status || 'Unknown')}
                tone={product.status === 'publish' ? 'success' : 'neutral'}
              />
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="PrintForge setup" description="Configuration specific to this product in PrintForge.">
        <div className="divide-y divide-border">
          <div className="grid gap-0.5 py-3">
            <span className="text-xs text-muted-foreground">Internal ID</span>
            <strong className="text-sm font-mono font-medium text-muted-foreground">{product.id}</strong>
          </div>
          <div className="grid gap-0.5 py-3">
            <span className="text-xs text-muted-foreground">Pricing containers</span>
            <strong className="text-sm font-medium">Configure in the Pricing & Options tab</strong>
          </div>
          <div className="grid gap-0.5 py-3">
            <span className="text-xs text-muted-foreground">Print areas</span>
            <strong className="text-sm font-medium">Configure in the Print Areas tab</strong>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}
