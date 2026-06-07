import { useEffect } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { getParentTargetOrigin } from './parentMessaging.js'
import type { DimensionsState } from './types.js'

const QUANTITY_MESSAGE_TYPE = 'printforge:quantity:change'

export function useParentQuantitySync(setDimensions: Dispatch<SetStateAction<DimensionsState>>) {
  useEffect(() => {
    const parentOrigin = getParentTargetOrigin()
    if (!parentOrigin) return

    function handleMessage(event: MessageEvent) {
      if (event.origin !== parentOrigin) return
      if (event.data?.type !== QUANTITY_MESSAGE_TYPE) return

      const quantity = Number(event.data.quantity)
      if (!Number.isInteger(quantity) || quantity <= 0) return

      setDimensions((current) => ({
        ...current,
        quantity: String(quantity),
      }))
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [setDimensions])
}
