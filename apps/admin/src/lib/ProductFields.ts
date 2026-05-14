import type { ProductField } from '../types/domain'

function createFieldId(productId: string) {
  return `${productId}-custom-${Date.now()}`
}

function createOptionId(fieldId: string) {
  return `${fieldId}-option-1`
}

export function createCustomField(productId: string): ProductField {
  const fieldId = createFieldId(productId)

  return {
    id: fieldId,
    key: `custom_field_${Date.now()}`,
    label: 'New field',
    type: 'select',
    source: 'printforge',
    sourceAttributeId: null,
    options: [
      {
        id: createOptionId(fieldId),
        label: 'Option 1',
        value: 'option_1',
        description: '',
        price: '',
      },
    ],
    visibleInProductDetails: true,
    usedForPricing: false,
    helpText: 'Defined in PrintForge and saved to the backend product configuration.',
  }
}
