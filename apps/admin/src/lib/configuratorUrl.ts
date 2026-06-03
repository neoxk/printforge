function resolveConfiguratorOrigin() {
  const configuredOrigin = import.meta.env.VITE_CONFIGURATOR_ORIGIN?.trim()

  if (configuredOrigin) {
    return configuredOrigin.replace(/\/+$/g, '')
  }

  const currentUrl = new URL(globalThis.location.href)

  if (currentUrl.port === '5173') {
    currentUrl.port = '5174'
    return currentUrl.origin
  }

  return currentUrl.origin
}

export function buildConfiguratorUrl(path: string) {
  return new URL(path, `${resolveConfiguratorOrigin()}/`).toString()
}
