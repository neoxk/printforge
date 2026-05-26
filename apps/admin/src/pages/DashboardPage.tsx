import {
  Activity,
  Boxes,
  FolderCheck,
  PlusCircle,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  PageHeader,
  SectionCard,
  StatCard,
  StatusPill,
  useAppAlerts,
  useAsync,
} from '@printforge/ui'
import { Button } from '@printforge/ui/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@printforge/ui/components/ui/table'
import {
  getIntegrationRequest,
  getPricingRulesRequest,
  getProductsRequest,
  getValidationRulesRequest,
} from '../lib/Api'

export function DashboardPage() {
  const { showError } = useAppAlerts()

  const { data, error } = useAsync(() =>
    Promise.all([
      getIntegrationRequest(),
      getProductsRequest(),
      getPricingRulesRequest(),
      getValidationRulesRequest(),
    ]),
  )

  const integration = data?.[0] ?? null
  const products = data?.[1] ?? []
  const pricingRules = data?.[2] ?? []
  const validationRules = data?.[3] ?? []

  useEffect(() => {
    if (error) showError(error.message, 'Dashboard load failed')
  }, [error, showError])

  const derivedMetrics = useMemo(() => {
    const syncedCount = products.length
    const validationCoverage =
      syncedCount === 0
        ? 0
        : Math.min(100, Math.round((validationRules.length / syncedCount) * 100))

    return [
      {
        label: 'Synced products',
        value: String(syncedCount).padStart(2, '0'),
        trend: integration ? `Last sync ${integration.lastSync}` : 'Waiting for backend data',
        icon: <Boxes />,
        progress: undefined as number | undefined,
      },
      {
        label: 'Active pricing rules',
        value: String(pricingRules.length).padStart(2, '0'),
        trend: 'Backend pricing registry',
        icon: <SlidersHorizontal />,
        progress: undefined as number | undefined,
      },
      {
        label: 'Validation rules',
        value: String(validationRules.length).padStart(2, '0'),
        trend: `${validationCoverage}% coverage across synced products`,
        icon: <ShieldCheck />,
        progress: syncedCount > 0 ? validationCoverage : undefined,
      },
      {
        label: 'Connection status',
        value: integration?.apiStatus ?? 'Pending',
        trend: integration?.connectionName ?? 'No integration configured',
        icon: <Activity />,
        progress: undefined as number | undefined,
      },
    ]
  }, [integration, pricingRules.length, products.length, validationRules])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Overview"
        title="Dashboard Overview"
        description="Synced product setup, validation coverage, and WooCommerce readiness."
      />

      {/* Stat cards */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {derivedMetrics.map((metric) => (
          <StatCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            trend={metric.trend}
            icon={metric.icon}
            progress={metric.progress}
          />
        ))}
      </section>

      {/* Main content + sidebar */}
      <section className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[2fr_1fr]">
        <SectionCard
          title="Recent products"
          description="Recently synced WooCommerce products persisted by the backend."
          actions={
            <Button asChild variant="ghost" size="sm">
              <Link to="/products">Open catalog</Link>
            </Button>
          }
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Base price</TableHead>
                <TableHead>Sync status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.slice(0, 4).map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{product.basePrice}</TableCell>
                  <TableCell>
                    <StatusPill
                      label={product.syncStatus}
                      tone={product.syncStatus === 'Live from WooCommerce' ? 'info' : 'neutral'}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </SectionCard>

        <div className="flex flex-col gap-4">
          <SectionCard title="System health" description="Integration and platform readiness.">
            <div className="divide-y divide-border">
              <div className="flex items-center justify-between gap-3 py-3">
                <span className="text-sm text-muted-foreground">WooCommerce Sync</span>
                <StatusPill
                  label={integration?.lastSync === 'Not synced yet' ? 'Idle' : 'Active'}
                  tone={integration?.lastSync === 'Not synced yet' ? 'neutral' : 'success'}
                />
              </div>
              <div className="flex items-center justify-between gap-3 py-3">
                <span className="text-sm text-muted-foreground">API Status</span>
                <StatusPill
                  label={integration?.apiStatus ?? 'Pending'}
                  tone={integration?.apiStatus === 'Healthy' ? 'success' : 'neutral'}
                />
              </div>
              <div className="flex items-center justify-between gap-3 py-3">
                <span className="text-sm text-muted-foreground">Last sync</span>
                <strong className="text-sm">{integration?.lastSync ?? 'Not synced yet'}</strong>
              </div>
              <div className="flex items-center justify-between gap-3 py-3">
                <span className="text-sm text-muted-foreground">Store</span>
                <strong className="text-sm">{integration?.storeUrl ?? 'Not configured yet'}</strong>
              </div>
              <div className="flex items-center justify-between gap-3 py-3">
                <span className="text-sm text-muted-foreground">Connection</span>
                <strong className="text-sm">
                  {integration?.connectionName ?? 'Not configured yet'}
                </strong>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Quick actions" description="Frequent admin tasks.">
            <div className="flex flex-col gap-2">
              <Button asChild variant="outline" className="justify-start">
                <Link to="/products">
                  <PlusCircle />
                  Open catalog
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start">
                <Link to="/pricing">
                  <SlidersHorizontal />
                  New Pricing Rule
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start">
                <Link to="/validation">
                  <FolderCheck />
                  Validation Rules
                </Link>
              </Button>
            </div>
          </SectionCard>
        </div>
      </section>

      {/* Sync overview */}
      <SectionCard
        title="Sync overview"
        description="Backend persistence now feeds the admin overview instead of browser-only local storage."
      >
        <div className="grid grid-cols-2 gap-x-6">
          {[
            { label: 'Storage mode', value: 'PostgreSQL via Fastify API' },
            { label: 'Current store', value: integration?.storeUrl ?? 'Not configured yet' },
            { label: 'Cached products', value: String(products.length) },
            {
              label: 'Source',
              value: integration ? 'Backend sync store' : 'Backend data unavailable',
            },
          ].map(({ label, value }) => (
            <div key={label} className="grid gap-0.5 border-b border-border py-3">
              <span className="text-xs text-muted-foreground">{label}</span>
              <strong className="text-sm font-medium">{value}</strong>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}
