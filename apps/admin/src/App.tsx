import { AppAlertsProvider } from '@printforge/ui'
import { Toaster } from '@printforge/ui/components/ui/sonner'
import { AppRouter } from './app/Router'

function App() {
  return (
    <AppAlertsProvider>
      <AppRouter />
      <Toaster />
    </AppAlertsProvider>
  )
}

export default App
