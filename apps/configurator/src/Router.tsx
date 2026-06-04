import { useEffect, useMemo, useState } from 'react'
import { UserDesignerPage } from './designer/UserDesignerPage'
import { OptionsPage } from './options/OptionsPage'

type Route = 'configurator' | 'options' | 'not-found'

const BASE_PATH = '/pf'

function normalizePath(pathname: string): string {
  return pathname.replace(/\/+$/, '') || '/'
}

function getRoute(pathname: string): Route {
  const path = normalizePath(pathname)

  if (path === BASE_PATH || path === `${BASE_PATH}/configurator`) {
    return 'configurator'
  }

  if (path.startsWith(`${BASE_PATH}/configurator/`)) {
    return 'configurator'
  }

  if (path === `${BASE_PATH}/options` || path.startsWith(`${BASE_PATH}/options/`)) {
    return 'options'
  }

  return 'not-found'
}

function NotFoundRoute() {
  return (
    <main className="cf-route-state">
      <h1>Not found</h1>
      <p>This PrintForge route does not exist.</p>
    </main>
  )
}

export function Router() {
  const [pathname, setPathname] = useState(() => window.location.pathname)
  // Track which routes have ever been active. Each component mounts only once
  // (on first visit) and is then hidden with CSS rather than unmounted, so that
  // closing the designer panel never destroys its canvas state.
  const [mountedRoutes, setMountedRoutes] = useState<Set<Route>>(() => {
    const initial = getRoute(window.location.pathname)
    return initial === 'not-found' ? new Set() : new Set([initial])
  })

  useEffect(() => {
    const handlePopState = () => setPathname(window.location.pathname)

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    const path = normalizePath(pathname)

    if (path === BASE_PATH) {
      window.history.replaceState(null, '', `${BASE_PATH}/configurator${window.location.search}${window.location.hash}`)
      setPathname(window.location.pathname)
    }
  }, [pathname])

  const route = useMemo(() => getRoute(pathname), [pathname])

  // Lazily add each route to the mounted set on first visit
  useEffect(() => {
    if (route !== 'not-found') {
      setMountedRoutes((prev) => {
        if (prev.has(route)) return prev
        const next = new Set(prev)
        next.add(route)
        return next
      })
    }
  }, [route])

  return (
    <>
      {mountedRoutes.has('configurator') && (
        <div style={{ display: route === 'configurator' ? '' : 'none' }}>
          <UserDesignerPage />
        </div>
      )}
      {mountedRoutes.has('options') && (
        <div style={{ display: route === 'options' ? '' : 'none' }}>
          <OptionsPage />
        </div>
      )}
      {route === 'not-found' && <NotFoundRoute />}
    </>
  )
}
