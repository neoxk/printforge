import { Copy, Globe, KeyRound, RefreshCw, ShieldCheck } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { FieldGroup, PageHeader, PageStack, SectionCard, SectionStack, useAppAlerts } from '@printforge/ui'
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
  webhookSecret: '',
  apiStatus: 'Not tested',
  lastSync: 'Not synced yet',
  mode: 'Manual sync with audit trail',
  importPublishedProducts: true,
  importAttributes: true,
  importVariations: true,
}

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
          'Load failed',
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
      showInfo('Connection settings saved.', 'Saved')
    } catch (error) {
      showError(
        error instanceof Error ? error.message : 'Unable to save connection.',
        'Save failed',
      )
    } finally {
      setIsSaving(false)
    }
  }

  async function copyWebhookSecret() {
    if (!settings.webhookSecret) return
    try {
      await navigator.clipboard.writeText(settings.webhookSecret)
      showInfo('Plugin secret copied to clipboard.', 'Copied')
    } catch {
      showError('Could not copy the secret. Copy it manually.', 'Copy failed')
    }
  }

  const statusRows = useMemo(
    () => [
      { label: 'Connection name', value: settings.connectionName || 'Not configured' },
      {
        label: 'Authentication',
        value: usesConsumerKeys ? 'Consumer key / secret' : 'Public Store API',
      },
      { label: 'API status', value: settings.apiStatus },
      { label: 'Last synced', value: savedAtLabel },
      { label: 'Endpoint', value: settings.restApiBase || 'Not configured' },
    ],
    [settings, savedAtLabel, usesConsumerKeys],
  )

  return (
    <PageStack>
      <PageHeader
        eyebrow="WooCommerce"
        title="Integration"
        description="Connect PrintForge to your WooCommerce store to sync products and pricing."
        actions={
          <Button onClick={saveConnection} disabled={isSaving || isLoading}>
            <RefreshCw className={isSaving ? 'animate-spin' : ''} />
            {isSaving ? 'Saving…' : 'Save connection'}
          </Button>
        }
      />

      <section className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[2fr_1fr]">
        <SectionCard
          title="Connection setup"
          description="Configure your WooCommerce store connection."
          actions={<Globe className="size-4 text-primary" aria-hidden="true" />}
        >
          <SectionStack>
            <FieldGroup label={<Label htmlFor="conn-name">Connection name</Label>}>
              <Input
                id="conn-name"
                type="text"
                placeholder="e.g. My Print Shop"
                value={settings.connectionName}
                onChange={(e) => updateSettings('connectionName', e.target.value)}
                disabled={isLoading}
              />
            </FieldGroup>
            <FieldGroup label={<Label htmlFor="store-url">Store URL</Label>}>
              <Input
                id="store-url"
                type="url"
                placeholder="https://store.example.com"
                value={settings.storeUrl}
                onChange={(e) => updateSettings('storeUrl', e.target.value)}
                disabled={isLoading}
              />
            </FieldGroup>
            <FieldGroup label={<Label>Authentication method</Label>}>
              <Select
                value={settings.authMethod}
                onValueChange={(v) =>
                  updateSettings('authMethod', v as IntegrationStatus['authMethod'])
                }
                disabled={isLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public_store_api">Public Store API</SelectItem>
                  <SelectItem value="consumer_keys">Consumer key / secret</SelectItem>
                </SelectContent>
              </Select>
            </FieldGroup>
            <FieldGroup label={<Label htmlFor="api-base">{endpointFieldLabel}</Label>}>
              <Input
                id="api-base"
                type="text"
                placeholder={endpointPlaceholder}
                value={settings.restApiBase}
                onChange={(e) => updateSettings('restApiBase', e.target.value)}
                disabled={isLoading}
              />
            </FieldGroup>
            {usesConsumerKeys && (
              <>
                <FieldGroup label={<Label htmlFor="consumer-key">Consumer key</Label>}>
                  <Input
                    id="consumer-key"
                    type="password"
                    value={settings.consumerKey}
                    onChange={(e) => updateSettings('consumerKey', e.target.value)}
                    disabled={isLoading}
                  />
                </FieldGroup>
                <FieldGroup label={<Label htmlFor="consumer-secret">Consumer secret</Label>}>
                  <Input
                    id="consumer-secret"
                    type="password"
                    value={settings.consumerSecret}
                    onChange={(e) => updateSettings('consumerSecret', e.target.value)}
                    disabled={isLoading}
                  />
                </FieldGroup>
              </>
            )}
          </SectionStack>
        </SectionCard>

        <SectionCard
          title="Connection status"
          description="Current state of the saved connection."
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
        title="Plugin secret"
        description="Paste this secret into the PrintForge WooCommerce plugin settings so it can attach uploaded designs to placed orders. Treat it like a password."
        actions={<KeyRound className="size-4 text-primary" aria-hidden="true" />}
      >
        <FieldGroup label={<Label htmlFor="webhook-secret">Secret</Label>}>
          <div className="flex gap-2">
            <Input
              id="webhook-secret"
              type="text"
              readOnly
              value={settings.webhookSecret}
              placeholder={isLoading ? 'Loading…' : 'Not generated yet'}
              className="font-mono"
              onFocus={(e) => e.currentTarget.select()}
            />
            <Button
              type="button"
              variant="outline"
              onClick={copyWebhookSecret}
              disabled={isLoading || !settings.webhookSecret}
            >
              <Copy />
              Copy
            </Button>
          </div>
        </FieldGroup>
      </SectionCard>

      <SectionCard
        title="Import scope"
        description="Choose what gets pulled from WooCommerce when a sync runs."
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
    </PageStack>
  )
}
