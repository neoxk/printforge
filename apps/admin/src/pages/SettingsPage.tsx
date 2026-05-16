import { CheckCircle2, Globe, KeyRound, RefreshCw, ShieldCheck } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { PageHeader, SectionCard, useAppAlerts } from '@printforge/ui'
import type { IntegrationStatus } from '@printforge/ui'
import { getIntegrationRequest, saveIntegrationRequest } from '../lib/Api'

const emptyIntegration: IntegrationStatus = {
  connectionName: '',
  storeUrl: '',
  restApiBase: '',
  authMethod: 'public_store_api',
  consumerKey: '',
  consumerSecret: '',
  apiStatus: 'Not tested',
  lastSync: 'Not synced yet',
  mode: 'Manual sync with audit trail',
  importPublishedProducts: true,
  importAttributes: true,
  importVariations: true,
}

const connectionChecklist = [
  {
    label: 'Store base URL',
    value: 'The public store root, for example https://example.com',
  },
  {
    label: 'WooCommerce REST credentials',
    value: 'A consumer key and consumer secret generated in WooCommerce with read permissions.',
  },
  {
    label: 'REST API endpoint',
    value: 'PrintForge should call /wp-json/wc/v3 through the backend, not directly from the browser.',
  },
  {
    label: 'Sync scope',
    value: 'Choose whether to import products, attributes, and variations from the connected store.',
  },
  {
    label: 'Connection test',
    value: 'The backend should validate API access, permissions, SSL, and endpoint reachability before first sync.',
  },
]

export function SettingsPage() {
  const { showError, showInfo } = useAppAlerts()
  const [settings, setSettings] = useState<IntegrationStatus>(emptyIntegration)
  const [savedAtLabel, setSavedAtLabel] = useState(emptyIntegration.lastSync)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const usesConsumerKeys = settings.authMethod === 'consumer_keys'
  const endpointFieldLabel = usesConsumerKeys ? 'REST API base' : 'Store API base'
  const endpointPlaceholder = usesConsumerKeys
    ? 'https://store.example.com/wp-json/wc/v3/products'
    : 'https://store.example.com/wp-json/wc/store/v1/products'

  useEffect(() => {
    async function loadIntegration() {
      try {
        const nextSettings = await getIntegrationRequest()
        setSettings(nextSettings)
        setSavedAtLabel(nextSettings.lastSync)
      } catch (error) {
        showError(
          error instanceof Error ? error.message : 'Unable to load integration.',
          'Integration load failed',
        )
      } finally {
        setIsLoading(false)
      }
    }

    void loadIntegration()
  }, [])

  function updateSettings<K extends keyof IntegrationStatus>(key: K, value: IntegrationStatus[K]) {
    setSettings((current) => ({ ...current, [key]: value }))
  }

  async function saveConnection() {
    setIsSaving(true)

    try {
      const nextSettings = await saveIntegrationRequest(settings)
      setSettings(nextSettings)
      setSavedAtLabel(nextSettings.lastSync)
      showInfo('WooCommerce connection settings were saved.', 'Connection saved')
    } catch (error) {
      showError(
        error instanceof Error ? error.message : 'Unable to save connection.',
        'Save failed',
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="WooCommerce"
        title="Integration"
        description="Configure the WooCommerce connection once, then let backend-owned sync and mapping keep your PrintForge catalog current."
        actions={
          <button
            className="primary-button"
            type="button"
            onClick={saveConnection}
            disabled={isSaving || isLoading}
          >
            <RefreshCw className="button-icon" aria-hidden="true" />
            {isSaving ? 'Saving...' : 'Save connection'}
          </button>
        }
      />

      <section className="content-grid">
        <SectionCard
          title="Connection setup"
          description="These are the core values needed to connect PrintForge to any WooCommerce store."
          actions={<Globe className="card-action-icon" aria-hidden="true" />}
        >
          <form className="editor-form">
            <label>
              <span>Connection name</span>
              <input
                type="text"
                value={settings.connectionName}
                onChange={(e) => updateSettings('connectionName', e.target.value)}
                disabled={isLoading}
              />
            </label>

            <label>
              <span>Store URL</span>
              <input
                type="url"
                placeholder="https://store.example.com"
                value={settings.storeUrl}
                onChange={(e) => updateSettings('storeUrl', e.target.value)}
                disabled={isLoading}
              />
            </label>

            <label>
              <span>{endpointFieldLabel}</span>
              <input
                type="text"
                placeholder={endpointPlaceholder}
                value={settings.restApiBase}
                onChange={(e) => updateSettings('restApiBase', e.target.value)}
                disabled={isLoading}
              />
            </label>

            <label>
              <span>Authentication method</span>
              <select
                value={settings.authMethod}
                onChange={(e) =>
                  updateSettings('authMethod', e.target.value as IntegrationStatus['authMethod'])
                }
                disabled={isLoading}
              >
                <option value="public_store_api">Public Store API</option>
                <option value="consumer_keys">WooCommerce consumer key / secret</option>
              </select>
            </label>

            {usesConsumerKeys ? (
              <>
                <label>
                  <span>Consumer key</span>
                  <input
                    type="password"
                    value={settings.consumerKey}
                    onChange={(e) => updateSettings('consumerKey', e.target.value)}
                    disabled={isLoading}
                  />
                </label>

                <label>
                  <span>Consumer secret</span>
                  <input
                    type="password"
                    value={settings.consumerSecret}
                    onChange={(e) => updateSettings('consumerSecret', e.target.value)}
                    disabled={isLoading}
                  />
                </label>
              </>
            ) : null}

            <label>
              <span>Sync mode</span>
              <input
                type="text"
                value={settings.mode}
                onChange={(e) => updateSettings('mode', e.target.value)}
                disabled={isLoading}
              />
            </label>
          </form>
        </SectionCard>

        <SectionCard
          title="Connection status"
          description="Backend-visible state for the currently saved WooCommerce connection."
          actions={<ShieldCheck className="card-action-icon" aria-hidden="true" />}
        >
          <div className="detail-list">
            <div>
              <span>Saved connection</span>
              <strong>{settings.connectionName || 'Not configured yet'}</strong>
            </div>
            <div>
              <span>Authentication</span>
              <strong>
                {usesConsumerKeys ? 'WooCommerce consumer key / secret' : 'Public Store API'}
              </strong>
            </div>
            <div>
              <span>API status</span>
              <strong>{settings.apiStatus}</strong>
            </div>
            <div>
              <span>Last saved</span>
              <strong>{savedAtLabel}</strong>
            </div>
            <div>
              <span>Current endpoint</span>
              <strong>{settings.restApiBase || 'No endpoint configured yet'}</strong>
            </div>
          </div>
        </SectionCard>
      </section>

      <SectionCard
        title="Import scope"
        description="These options define what should be brought in from WooCommerce when the backend sync runs."
        actions={<CheckCircle2 className="card-action-icon" aria-hidden="true" />}
      >
        <form className="editor-form">
          <label className="toggle-row">
            <span>Published products</span>
            <input
              type="checkbox"
              checked={settings.importPublishedProducts}
              onChange={(e) => updateSettings('importPublishedProducts', e.target.checked)}
              disabled={isLoading}
            />
          </label>

          <label className="toggle-row">
            <span>Global and product-level attributes</span>
            <input
              type="checkbox"
              checked={settings.importAttributes}
              onChange={(e) => updateSettings('importAttributes', e.target.checked)}
              disabled={isLoading}
            />
          </label>

          <label className="toggle-row">
            <span>Variations and option sets</span>
            <input
              type="checkbox"
              checked={settings.importVariations}
              onChange={(e) => updateSettings('importVariations', e.target.checked)}
              disabled={isLoading}
            />
          </label>
        </form>
      </SectionCard>

      <SectionCard
        title="What a real connection needs"
        description="For a live WooCommerce store, these are the pieces that matter in practice."
        actions={<KeyRound className="card-action-icon" aria-hidden="true" />}
      >
        <div className="detail-list">
          {connectionChecklist.map((item) => (
            <div key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}
