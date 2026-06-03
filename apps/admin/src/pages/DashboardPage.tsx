import {
  Activity,
  ArrowRight,
  Boxes,
  Database,
  History,
  PlusCircle,
  SlidersHorizontal,
  SwatchBook,
} from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  PageHeader,
  PageStack,
  SectionCard,
  SectionStack,
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
  getProductsRequest,
} from '../lib/Api'
import { Groups, Items } from '../lib/services'

function getConnectionStatusTone(apiStatus: string | null | undefined) {
  const normalized = (apiStatus ?? '').trim().toLowerCase()

  if (normalized === 'healthy' || normalized === 'active') return 'success'
  if (normalized === 'not tested' || normalized === 'pending' || normalized === 'syncing') return 'neutral'
  if (normalized === 'degraded' || normalized === 'warning') return 'warning'
  if (normalized === 'error' || normalized === 'failed' || normalized === 'disconnected') return 'danger'
  return 'info'
}

function getStatusDotClass(tone: ReturnType<typeof getConnectionStatusTone>) {
  if (tone === 'success') return 'bg-emerald-500'
  if (tone === 'warning') return 'bg-amber-500'
  if (tone === 'danger') return 'bg-red-500'
  if (tone === 'info') return 'bg-blue-500'
  return 'bg-slate-400'
}

export function DashboardPage() {
  const { showError } = useAppAlerts()

  const { data, error } = useAsync(() =>
    Promise.all([
      getIntegrationRequest(),
      getProductsRequest(),
      Groups.list(),
      Items.list(),
    ]),
  )

  const integration = data?.[0] ?? null
  const products = data?.[1] ?? []
  const optionGroups = data?.[2] ?? []
  const optionItems = data?.[3] ?? []
  const apiStatusTone = getConnectionStatusTone(integration?.apiStatus)

  useEffect(() => {
    if (error) showError(error.message, 'Dashboard load failed')
  }, [error, showError])

  const derivedMetrics = useMemo(() => {
    const syncedCount = products.length

    return [
      {
        label: 'Synced products',
        value: String(syncedCount).padStart(2, '0'),
        trend: integration ? `Last sync ${integration.lastSync}` : 'Waiting for backend data',
        icon: <Boxes />,
        progress: undefined as number | undefined,
      },
      {
        label: 'Option groups',
        value: String(optionGroups.length).padStart(2, '0'),
        trend: 'Backend pricing library groups',
        icon: <SlidersHorizontal />,
        progress: undefined as number | undefined,
      },
      {
        label: 'Option items',
        value: String(optionItems.length).padStart(2, '0'),
        trend: 'Reusable pricing items in library',
        icon: <SwatchBook />,
        progress: undefined as number | undefined,
      },
      {
        label: 'Connection status',
        value: integration?.apiStatus ?? 'Pending',
        trend: integration?.connectionName ?? 'No integration configured',
        icon: <Activity />,
        progress: undefined as number | undefined,
      },
    ]
  }, [integration, optionGroups.length, optionItems.length, products.length])

  return (
    <PageStack>
      <PageHeader
        eyebrow="Overview"
        title="Dashboard Overview"
        description="Synced product setup, pricing library overview, and WooCommerce readiness."
        className="mt-2 mb-1"
      />

      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
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

      <section className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[2fr_1fr]">
        <SectionCard
          title="Recent products"
          description="Recently synced WooCommerce products persisted by the backend."
          actions={
            <Button asChild variant="link" size="sm" className="gap-1.5">
              <Link to="/products">
                Open catalog
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          }
          contentClassName="pt-4"
        >
          {products.length === 0 ? (
            <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/20 px-6 text-center">
              <Database className="mb-3 size-10 text-muted-foreground/70" />
              <p className="text-sm font-medium text-foreground">No synced products yet</p>
              <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">
                Run a WooCommerce sync to populate the backend product catalog and start configuring products.
              </p>
            </div>
          ) : (
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
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-foreground">{product.name}</span>
                        <span className="text-xs text-muted-foreground">Backend catalog record</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-foreground/80">{product.sku}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell className="font-medium">{product.basePrice}</TableCell>
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
          )}
        </SectionCard>

        <SectionStack>
          <SectionCard
            title="System health"
            description="Integration and platform readiness."
            contentClassName="pt-3"
          >
            <div className="divide-y divide-border/70">
              <div className="flex items-center justify-between gap-3 py-3">
                <span className="text-sm text-muted-foreground">WooCommerce Sync</span>
                <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                  <span
                    className={`inline-block size-2.5 rounded-full ${integration?.lastSync === 'Not synced yet' ? 'bg-slate-400' : 'bg-emerald-500'}`}
                  />
                  {integration?.lastSync === 'Not synced yet' ? 'Idle' : 'Active'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 py-3">
                <span className="text-sm text-muted-foreground">API Status</span>
                <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                  <span className={`inline-block size-2.5 rounded-full ${getStatusDotClass(apiStatusTone)}`} />
                  {integration?.apiStatus ?? 'Pending'}
                </span>
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
              <div className="pt-4">
                <Button asChild variant="link" size="sm" className="gap-1.5">
                  <Link to="/settings">
                    <History className="size-4" />
                    Review integration
                  </Link>
                </Button>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Quick actions"
            description="Frequent admin tasks."
            contentClassName="pt-4"
          >
            <div className="flex flex-col gap-2.5">
              <Button asChild variant="secondary" className="justify-start gap-3">
                <Link to="/products">
                  <PlusCircle />
                  Open catalog
                </Link>
              </Button>
              <Button asChild variant="secondary" className="justify-start gap-3">
                <Link to="/pricing">
                  <SlidersHorizontal />
                  Open pricing library
                </Link>
              </Button>
            </div>
          </SectionCard>
        </SectionStack>
      </section>

      <SectionCard
        title="Sync overview"
        description="Backend persistence now feeds the admin overview instead of browser-only local storage."
        contentClassName="pt-4"
      >
        <div className="grid gap-x-8 gap-y-1 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Storage mode', value: 'PostgreSQL via Fastify API' },
            { label: 'Current store', value: integration?.storeUrl ?? 'Not configured yet' },
            { label: 'Cached products', value: String(products.length) },
            {
              label: 'Source',
              value: integration ? 'Backend sync store' : 'Backend data unavailable',
            },
          ].map(({ label, value }) => (
            <div key={label} className="grid gap-1 border-b border-border/70 py-3 xl:border-b-0 xl:border-l xl:border-border/70 xl:pl-6 first:xl:border-l-0 first:xl:pl-0">
              <span className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {label}
              </span>
              <strong className="text-sm font-medium">{value}</strong>
            </div>
          ))}
        </div>
      </SectionCard>
    </PageStack>
  )
}
