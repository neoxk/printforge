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
