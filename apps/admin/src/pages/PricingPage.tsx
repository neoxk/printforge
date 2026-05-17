import { PageHeader, SectionCard } from '@printforge/ui'

export function PricingPage() {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Definitions"
        title="General Definitions"
        description="Product groups and global option sets will be configured here."
      />
      <SectionCard
        title="Coming soon"
        description="Group-level configuration is not yet implemented."
      >
        <p className="empty-row muted-copy">
          This page will contain global product group definitions.
        </p>
      </SectionCard>
    </div>
  )
}
