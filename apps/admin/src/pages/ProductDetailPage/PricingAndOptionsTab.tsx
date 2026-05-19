import { PlusCircle } from 'lucide-react'
import { ProductFieldEditor } from '../../components/ProductFieldEditor'
import { SectionCard } from '../../components/SectionCard'
import type { ProductField, ProductRecord } from '../../types/domain'

type Props = {
  product: ProductRecord
  fields: ProductField[]
  onUpdateField: (fieldId: string, updater: (field: ProductField) => ProductField) => void
  onAddCustomField: () => void
  onAddOption: (fieldId: string) => void
  onRemoveOption: (fieldId: string, optionId: string) => void
  onRemoveField: (fieldId: string) => void
}

export function PricingAndOptionsTab({
  product,
  fields,
  onUpdateField,
  onAddCustomField,
  onAddOption,
  onRemoveOption,
  onRemoveField,
}: Props) {
  return (
    <SectionCard
      title={`Field definitions for ${product.name}`}
      description="Imported WooCommerce attributes are prefilled here. Admin-defined fields are added beside them and saved into one normalized config."
      actions={
        <button className="ghost-button" type="button" onClick={onAddCustomField}>
          <PlusCircle className="button-icon" aria-hidden="true" />
          Add field
        </button>
      }
    >
      <div className="field-stack">
        {fields.map((field) => (
          <ProductFieldEditor
            key={field.id}
            field={field}
            onFieldChange={onUpdateField}
            onAddOption={onAddOption}
            onRemoveOption={onRemoveOption}
            onRemoveField={onRemoveField}
          />
        ))}
      </div>
    </SectionCard>
  )
}
