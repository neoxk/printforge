const QUANTITY_SET_MESSAGE_TYPE = 'printforge:quantity:set'

export function getParentTargetOrigin(): string | null {
  const ancestorOrigin = window.location.ancestorOrigins?.[0]
  if (ancestorOrigin) return ancestorOrigin

  if (!document.referrer) return null

  try {
    return new URL(document.referrer).origin
  } catch {
    return null
  }
}

export function setParentQuantity(quantity: number): void {
  if (window.parent === window) return

  const targetOrigin = getParentTargetOrigin()
  if (!targetOrigin) return

  window.parent.postMessage(
    {
      type: QUANTITY_SET_MESSAGE_TYPE,
      quantity,
    },
    targetOrigin,
  )
}
