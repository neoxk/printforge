import { useState, useEffect } from 'react'
import { useAsync } from '@printforge/ui'
import { fetchProductConfig } from './lib/api.js'
import { ContainerGroup } from './components/ContainerGroup.js'
import type { ProductConfig } from './types.js'

function getProductIdFromPath(): string | null {
  const segments = window.location.pathname.split('/').filter(Boolean)
  return segments[segments.length - 1] ?? null
}

function buildInitialSelection(config: ProductConfig): Record<string, string[]> {
  const selection: Record<string, string[]> = {}
  for (const container of config.containers) {
    if (container.containerType === 'AUTO_APPLIED') continue
    selection[container.id] = container.defaultItemId ? [container.defaultItemId] : []
  }
  return selection
}

export default function App() {
  const productId = getProductIdFromPath()
  const { data: config, isLoading, error } = useAsync(
    () => {
      if (!productId) return Promise.reject(new Error('No product ID in URL'))
      return fetchProductConfig(productId)
    },
    [productId],
  )

  const [selection, setSelection] = useState<Record<string, string[]>>({})

  useEffect(() => {
    if (config) setSelection(buildInitialSelection(config))
  }, [config])

  function handleChange(containerId: string, selected: string[]) {
    setSelection((prev) => ({ ...prev, [containerId]: selected }))
  }

  if (!productId) return <div className="cf-error">No product ID provided.</div>
  if (isLoading) return <div className="cf-loading">Loading…</div>
  if (error) return <div className="cf-error">{error.message}</div>
  if (!config) return null

  const visibleContainers = config.containers.filter(
    (c) => !c.isHidden && c.containerType !== 'AUTO_APPLIED',
  )

  return (
    <form className="configurator-form" onSubmit={(e) => e.preventDefault()}>
      {visibleContainers.map((container) => (
        <ContainerGroup
          key={container.id}
          container={container}
          selected={selection[container.id] ?? []}
          onChange={handleChange}
        />
      ))}
    </form>
  )
}
