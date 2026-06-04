import { getParentTargetOrigin } from '../options/parentMessaging.js'
import type { UserDesignState } from './types.js'

const DESIGNER_CONFIGURATION_MESSAGE_TYPE = 'printforge:designer:change'

type DesignerSyncPayload = {
  productId: string
  routeProductId: string | null
  design: UserDesignState
}

export function postDesignerConfiguration({
  productId,
  routeProductId,
  design,
}: DesignerSyncPayload) {
  if (globalThis.parent === globalThis.window) return

  const targetOrigin = getParentTargetOrigin()
  if (!targetOrigin) return

  globalThis.parent.postMessage(
    {
      type: DESIGNER_CONFIGURATION_MESSAGE_TYPE,
      productId,
      wooProductId: routeProductId && /^\d+$/.test(routeProductId) ? routeProductId : null,
      design,
    },
    targetOrigin,
  )
}
