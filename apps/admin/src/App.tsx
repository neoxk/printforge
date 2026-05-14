import { AppAlertsProvider } from '@printforge/ui'
import { AppRouter } from './app/Router'

function App() {
  return (
    <AppAlertsProvider>
      <AppRouter />
    </AppAlertsProvider>
  )
}

export default App
