import { useEffect } from 'react'
import type { PricingResult, ProductConfig } from '../types.js'
import { getSelectedItemIds } from './optionsConfig.js'
import { getParentTargetOrigin } from './parentMessaging.js'
import type { DimensionsState, SelectedByContainer } from './types.js'

const CONFIGURATION_MESSAGE_TYPE = 'printforge:options:change'

type ConfigurationSyncProps = {
  config: ProductConfig | null
  routeProductId: string | null
  selectedByContainer: SelectedByContainer
  dimensions: DimensionsState
  price: PricingResult | null
}

export function useParentConfigurationSync({
  config,
  routeProductId,
  selectedByContainer,
  dimensions,
  price,
}: ConfigurationSyncProps) {
  useEffect(() => {
    if (!config || window.parent === window) return

    const targetOrigin = getParentTargetOrigin()
    if (!targetOrigin) return

    window.parent.postMessage(
      {
        type: CONFIGURATION_MESSAGE_TYPE,
        productId: config.productId,
        wooProductId: routeProductId && /^\d+$/.test(routeProductId) ? routeProductId : null,
        selectedItemIds: getSelectedItemIds(selectedByContainer),
        context: {
          widthMm: Number(dimensions.widthMm),
          heightMm: Number(dimensions.heightMm),
          quantity: Number(dimensions.quantity),
        },
        price,
      },
      targetOrigin,
    )
  }, [config, dimensions.heightMm, dimensions.quantity, dimensions.widthMm, price, routeProductId, selectedByContainer])
}
