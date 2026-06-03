import { useEffect, useMemo, useRef, useState } from 'react'
import { ContainerGroup } from '../components/ContainerGroup.js'
import { calculatePrice } from '../lib/api.js'
import type { PricingResult, ProductConfig } from '../types.js'
import { DimensionsFields } from './DimensionsFields.js'
import {
  DEFAULT_DIMENSIONS_STATE,
  fetchOptionsConfig,
  getBasePriceFromSearch,
  getDefaultSelections,
  getDimensionsState,
  getProductIdFromPath,
  getSelectedItemIds,
  isValidProductId,
} from './optionsConfig.js'
import { getParentTargetOrigin } from './parentMessaging.js'
import { PricePanel } from './PricePanel.js'
import type { DimensionsState, SelectedByContainer } from './types.js'
import { useIframeResize } from './useIframeResize.js'
import { useParentConfigurationSync } from './useParentConfigurationSync.js'
import { useParentQuantitySync } from './useParentQuantitySync.js'
import './options-ui.css'

const CONFIGURATOR_OPEN_MESSAGE_TYPE = 'printforge:configurator:open'

function getOptionHeading(name: string): string {
  const normalizedName = name.trim()
  if (!normalizedName) return 'Choose your option'

  return `Choose your ${normalizedName.toLocaleLowerCase()}`
}

export function OptionsPage() {
  const pageRef = useRef<HTMLElement | null>(null)
  const productId = useMemo(() => getProductIdFromPath(window.location.pathname), [])
  const basePrice = useMemo(() => getBasePriceFromSearch(window.location.search), [])
  const [config, setConfig] = useState<ProductConfig | null>(null)
  const [selectedByContainer, setSelectedByContainer] = useState<SelectedByContainer>({})
  const [dimensions, setDimensions] = useState<DimensionsState>(DEFAULT_DIMENSIONS_STATE)
  const [price, setPrice] = useState<PricingResult | null>(null)
  const [priceError, setPriceError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useIframeResize(pageRef)
  useParentQuantitySync(setDimensions)
  useParentConfigurationSync({
    config,
    routeProductId: productId,
    selectedByContainer,
    dimensions,
    price,
  })

  useEffect(() => {
    document.body.classList.add('cf-options-route')

    return () => {
      document.body.classList.remove('cf-options-route')
    }
  }, [])

  useEffect(() => {
    if (!productId) {
      setIsLoading(false)
      setError('Missing product id.')
      return
    }

    if (!isValidProductId(productId)) {
      setIsLoading(false)
      setError('Invalid product id.')
      return
    }

    let isCancelled = false

    setIsLoading(true)
    setError(null)

    fetchOptionsConfig(productId)
      .then((nextConfig) => {
        if (isCancelled) return

        setConfig(nextConfig)
        setSelectedByContainer(getDefaultSelections(nextConfig))
        setDimensions(getDimensionsState(nextConfig))
      })
      .catch((nextError: unknown) => {
        if (isCancelled) return

        setConfig(null)
        setSelectedByContainer({})
        setPrice(null)
        setError(nextError instanceof Error ? nextError.message : 'Failed to load product options.')
      })
      .finally(() => {
        if (!isCancelled) setIsLoading(false)
      })

    return () => {
      isCancelled = true
    }
  }, [productId])

  useEffect(() => {
    if (!config) return

    const widthMm = Number(dimensions.widthMm)
    const heightMm = Number(dimensions.heightMm)
    const quantity = Number(dimensions.quantity)

    if (widthMm <= 0 || heightMm <= 0 || quantity <= 0 || !Number.isInteger(quantity)) {
      setPrice(null)
      setPriceError('Enter dimensions to calculate price.')
      return
    }

    let isCancelled = false

    setPriceError(null)

    calculatePrice(config.productId, getSelectedItemIds(selectedByContainer), {
      widthMm,
      heightMm,
      quantity,
    })
      .then((nextPrice) => {
        if (!isCancelled) setPrice(nextPrice)
      })
      .catch((nextError: unknown) => {
        if (isCancelled) return

        setPrice(null)
        setPriceError(nextError instanceof Error ? nextError.message : 'Failed to calculate price.')
      })

    return () => {
      isCancelled = true
    }
  }, [config, dimensions.heightMm, dimensions.quantity, dimensions.widthMm, selectedByContainer])

  function handleContainerChange(containerId: string, selected: string[]) {
    setSelectedByContainer((current) => ({
      ...current,
      [containerId]: selected,
    }))
  }

  function handleCustomizeDesign() {
    if (!productId) return

    if (window.parent === window) {
      window.location.href = `/pf/configurator/${encodeURIComponent(productId)}`
      return
    }

    const targetOrigin = getParentTargetOrigin()
    if (!targetOrigin) return

    window.parent.postMessage(
      {
        type: CONFIGURATOR_OPEN_MESSAGE_TYPE,
        productId,
      },
      targetOrigin,
    )
  }

  if (isLoading) {
    return <main className="cf-loading">Loading product options...</main>
  }

  if (error) {
    return <main className="cf-error">{error}</main>
  }

  if (!config) {
    return <main className="cf-error">Product options are unavailable.</main>
  }

  const visibleContainers = config.containers.filter(
    (container) => !container.isHidden && container.containerType !== 'AUTO_APPLIED',
  )

  if (visibleContainers.length === 0) {
    return <main className="cf-loading">No configurable options are available for this product.</main>
  }

  return (
    <main ref={pageRef}>
      <form className="configurator-form">
        {config.dimensions.type === 'custom' && (
          <DimensionsFields dimensions={dimensions} onChange={setDimensions} />
        )}

        {visibleContainers.map((container) => (
          <ContainerGroup
            key={container.id}
            container={{ ...container, name: getOptionHeading(container.name) }}
            selected={selectedByContainer[container.id] ?? []}
            onChange={handleContainerChange}
          />
        ))}

        <PricePanel
          price={price}
          error={priceError}
          basePrice={basePrice}
          quantity={Number(dimensions.quantity)}
        />

        <button className="design-button" type="button" onClick={handleCustomizeDesign}>
          Customize design
        </button>
      </form>
    </main>
  )
}
