import { useEffect, useMemo, useState } from 'react'
import { AdminDesignerPage } from './designer/admin/AdminDesignerPage'
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

  if (route === 'configurator') {
    return <AdminDesignerPage />
  }

  if (route === 'options') {
    return <OptionsPage />
  }

  return <NotFoundRoute />
}
