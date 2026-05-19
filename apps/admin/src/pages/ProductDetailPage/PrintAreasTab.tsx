import { Layers } from 'lucide-react'
import { SectionCard } from '@printforge/ui'

export function PrintAreasTab() {
  return (
    <SectionCard
      title="Print areas"
      description="Define the printable zones for this product. The designer will be integrated here."
      actions={<Layers className="card-action-icon" aria-hidden="true" />}
    >
      <p className="empty-row muted-copy">
        Print area designer coming soon. This section will let admins define and configure
        printable zones for each product.
      </p>
    </SectionCard>
  )
}
