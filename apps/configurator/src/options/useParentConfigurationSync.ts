import { useEffect, useRef } from 'react'
import type { PricingResult, ProductConfig } from '../types.js'
import { getSelectedItemIds } from './optionsConfig.js'
import { getParentTargetOrigin } from './parentMessaging.js'
import type { DimensionsState, SelectedByContainer } from './types.js'

const CONFIGURATION_MESSAGE_TYPE = 'printforge:options:change'
const CHANNEL_NAME = 'printforge-config'

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
  // Keep a ref so the BroadcastChannel message handler always sees the latest dims
  const dimensionsRef = useRef(dimensions)
  useEffect(() => { dimensionsRef.current = dimensions }, [dimensions])

  // Open channel once; respond to dims:request from the designer iframe
  useEffect(() => {
    let channel: BroadcastChannel | null = null
    try { channel = new BroadcastChannel(CHANNEL_NAME) } catch { return }

    channel.onmessage = (event: MessageEvent) => {
      if (event.data?.type !== 'printforge:dims:request') return
      channel.postMessage({
        type: 'printforge:dims:update',
        widthMm: Number(dimensionsRef.current.widthMm),
        heightMm: Number(dimensionsRef.current.heightMm),
      })
    }

    return () => { channel.close() }
  }, [])

  // Broadcast whenever dimensions change so the designer updates in real time
  useEffect(() => {
    try {
      const channel = new BroadcastChannel(CHANNEL_NAME)
      channel.postMessage({
        type: 'printforge:dims:update',
        widthMm: Number(dimensions.widthMm),
        heightMm: Number(dimensions.heightMm),
      })
      channel.close()
    } catch { /* BroadcastChannel not supported */ }
  }, [dimensions.widthMm, dimensions.heightMm])

  useEffect(() => {
    if (!config || globalThis.parent === globalThis.window) return

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
