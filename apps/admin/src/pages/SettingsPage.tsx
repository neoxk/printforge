import { CheckCircle2, Globe, KeyRound, RefreshCw, ShieldCheck } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { PageHeader, SectionCard, useAppAlerts } from '@printforge/ui'
import type { IntegrationStatus } from '@printforge/ui'
import { Button } from '@printforge/ui/components/ui/button'
import { Input } from '@printforge/ui/components/ui/input'
import { Label } from '@printforge/ui/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@printforge/ui/components/ui/select'
import { Switch } from '@printforge/ui/components/ui/switch'
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

  const statusRows = useMemo(
    () => [
      { label: 'Saved connection', value: settings.connectionName || 'Not configured yet' },
      {
        label: 'Authentication',
        value: usesConsumerKeys ? 'WooCommerce consumer key / secret' : 'Public Store API',
      },
      { label: 'API status', value: settings.apiStatus },
      { label: 'Last saved', value: savedAtLabel },
      { label: 'Current endpoint', value: settings.restApiBase || 'No endpoint configured yet' },
    ],
    [settings, savedAtLabel, usesConsumerKeys],
  )

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        eyebrow="WooCommerce"
        title="Integration"
        description="Configure the WooCommerce connection once, then let backend-owned sync and mapping keep your PrintForge catalog current."
        actions={
          <Button onClick={saveConnection} disabled={isSaving || isLoading}>
            <RefreshCw className={isSaving ? 'animate-spin' : ''} />
            {isSaving ? 'Saving…' : 'Save connection'}
          </Button>
        }
      />

      <section className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[2fr_1fr]">
        <SectionCard
          title="Connection setup"
          description="These are the core values needed to connect PrintForge to any WooCommerce store."
          actions={<Globe className="size-4 text-primary" aria-hidden="true" />}
        >
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="conn-name">Connection name</Label>
              <Input
                id="conn-name"
                type="text"
                value={settings.connectionName}
                onChange={(e) => updateSettings('connectionName', e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="store-url">Store URL</Label>
              <Input
                id="store-url"
                type="url"
                placeholder="https://store.example.com"
                value={settings.storeUrl}
                onChange={(e) => updateSettings('storeUrl', e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="api-base">{endpointFieldLabel}</Label>
              <Input
                id="api-base"
                type="text"
                placeholder={endpointPlaceholder}
                value={settings.restApiBase}
                onChange={(e) => updateSettings('restApiBase', e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Authentication method</Label>
              <Select
                value={settings.authMethod}
                onValueChange={(v) =>
                  updateSettings('authMethod', v as IntegrationStatus['authMethod'])
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public_store_api">Public Store API</SelectItem>
                  <SelectItem value="consumer_keys">
                    WooCommerce consumer key / secret
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {usesConsumerKeys && (
              <>
                <div className="grid gap-1.5">
                  <Label htmlFor="consumer-key">Consumer key</Label>
                  <Input
                    id="consumer-key"
                    type="password"
                    value={settings.consumerKey}
                    onChange={(e) => updateSettings('consumerKey', e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="consumer-secret">Consumer secret</Label>
                  <Input
                    id="consumer-secret"
                    type="password"
                    value={settings.consumerSecret}
                    onChange={(e) => updateSettings('consumerSecret', e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </>
            )}
            <div className="grid gap-1.5">
              <Label htmlFor="sync-mode">Sync mode</Label>
              <Input
                id="sync-mode"
                type="text"
                value={settings.mode}
                onChange={(e) => updateSettings('mode', e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Connection status"
          description="Backend-visible state for the currently saved WooCommerce connection."
          actions={<ShieldCheck className="size-4 text-primary" aria-hidden="true" />}
        >
          <div className="divide-y divide-border">
            {statusRows.map(({ label, value }) => (
              <div key={label} className="grid gap-0.5 py-3">
                <span className="text-xs text-muted-foreground">{label}</span>
                <strong className="text-sm font-medium">{value}</strong>
              </div>
            ))}
          </div>
        </SectionCard>
      </section>

      <SectionCard
        title="Import scope"
        description="These options define what should be brought in from WooCommerce when the backend sync runs."
        actions={<CheckCircle2 className="size-4 text-primary" aria-hidden="true" />}
      >
        <div className="grid gap-4">
          {(
            [
              ['importPublishedProducts', 'Published products'],
              ['importAttributes', 'Global and product-level attributes'],
              ['importVariations', 'Variations and option sets'],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <Label htmlFor={key} className="cursor-pointer">
                {label}
              </Label>
              <Switch
                id={key}
                checked={settings[key]}
                onCheckedChange={(checked) => updateSettings(key, checked)}
                disabled={isLoading}
              />
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="What a real connection needs"
        description="For a live WooCommerce store, these are the pieces that matter in practice."
        actions={<KeyRound className="size-4 text-primary" aria-hidden="true" />}
      >
        <div className="divide-y divide-border">
          {connectionChecklist.map((item) => (
            <div key={item.label} className="grid gap-0.5 py-3">
              <span className="text-xs text-muted-foreground">{item.label}</span>
              <strong className="text-sm font-medium">{item.value}</strong>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}
