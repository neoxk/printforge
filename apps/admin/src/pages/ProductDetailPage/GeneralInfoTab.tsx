import { SectionCard } from '@printforge/ui'
import type { ProductRecord } from '@printforge/ui'

type Props = {
  product: ProductRecord
}

export function GeneralInfoTab({ product }: Props) {
  return (
    <SectionCard title="Commerce data" description="Mirrored from the upstream store.">
      <div className="divide-y divide-border">
        {[
          { label: 'SKU', value: product.sku },
          { label: 'Category', value: product.category },
          { label: 'Base price', value: product.basePrice },
          { label: 'Sync state', value: product.syncStatus },
          { label: 'Data source', value: 'Backend product sync store' },
        ].map(({ label, value }) => (
          <div key={label} className="grid gap-0.5 py-3">
            <span className="text-xs text-muted-foreground">{label}</span>
            <strong className="text-sm font-medium">{value}</strong>
          </div>
        ))}
      </div>
    </SectionCard>
  )
}
