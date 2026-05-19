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
        icon: <Boxes className="stat-icon" />,
        progress: undefined as number | undefined,
      },
      {
        label: 'Active pricing rules',
        value: String(pricingRules.length).padStart(2, '0'),
        trend: 'Backend pricing registry',
        icon: <SlidersHorizontal className="stat-icon" />,
        progress: undefined as number | undefined,
      },
      {
        label: 'Validation rules',
        value: String(validationRules.length).padStart(2, '0'),
        trend: `${validationCoverage}% coverage across synced products`,
        icon: <ShieldCheck className="stat-icon" />,
        progress: syncedCount > 0 ? validationCoverage : undefined,
      },
      {
        label: 'Connection status',
        value: integration?.apiStatus ?? 'Pending',
        trend: integration?.connectionName ?? 'No integration configured',
        icon: <Activity className="stat-icon" />,
        progress: undefined as number | undefined,
      },
    ]
  }, [integration, pricingRules.length, products.length, validationRules])

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Overview"
        title="Dashboard Overview"
        description="Synced product setup, validation coverage, and WooCommerce readiness."
      />

      <section className="stats-grid">
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

      <section className="content-grid">
        <SectionCard
          title="Recent products"
          description="Recently synced WooCommerce products persisted by the backend."
          actions={
            <Link to="/products" className="text-action-button">
              Open catalog
            </Link>
          }
        >
          <div className="table-shell">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Base price</th>
                  <th>Sync status</th>
                </tr>
              </thead>
              <tbody>
                {products.slice(0, 4).map((product) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.sku}</td>
                    <td>{product.category}</td>
                    <td>{product.basePrice}</td>
                    <td>
                      <StatusPill
                        label={product.syncStatus}
                        tone={product.syncStatus === 'Live from WooCommerce' ? 'info' : 'neutral'}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <div className="side-column">
          <SectionCard title="System health" description="Integration and platform readiness.">
            <div className="health-list">
              <div>
                <span>WooCommerce Sync</span>
                <StatusPill
                  label={integration?.lastSync === 'Not synced yet' ? 'Idle' : 'Active'}
                  tone={integration?.lastSync === 'Not synced yet' ? 'neutral' : 'success'}
                />
              </div>
              <div>
                <span>API Status</span>
                <StatusPill
                  label={integration?.apiStatus ?? 'Pending'}
                  tone={integration?.apiStatus === 'Healthy' ? 'success' : 'neutral'}
                />
              </div>
              <div>
                <span>Last sync</span>
                <strong>{integration?.lastSync ?? 'Not synced yet'}</strong>
              </div>
              <div>
                <span>Store</span>
                <strong>{integration?.storeUrl ?? 'Not configured yet'}</strong>
              </div>
              <div>
                <span>Connection</span>
                <strong>{integration?.connectionName ?? 'Not configured yet'}</strong>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Quick actions" description="Frequent admin tasks.">
            <div className="quick-actions">
              <Link to="/products" className="secondary-panel-button">
                <PlusCircle className="button-icon" aria-hidden="true" />
                Open catalog
              </Link>
              <Link to="/pricing" className="secondary-panel-button">
                <SlidersHorizontal className="button-icon" aria-hidden="true" />
                New Pricing Rule
              </Link>
              <Link to="/validation" className="secondary-panel-button">
                <FolderCheck className="button-icon" aria-hidden="true" />
                Validation Rules
              </Link>
            </div>
          </SectionCard>
        </div>
      </section>

      <SectionCard
        title="Sync overview"
        description="Backend persistence now feeds the admin overview instead of browser-only local storage."
      >
        <div className="detail-list compact">
          <div>
            <span>Storage mode</span>
            <strong>PostgreSQL via Fastify API</strong>
          </div>
          <div>
            <span>Current store</span>
            <strong>{integration?.storeUrl ?? 'Not configured yet'}</strong>
          </div>
          <div>
            <span>Cached products</span>
            <strong>{products.length}</strong>
          </div>
          <div>
            <span>Source</span>
            <strong>{integration ? 'Backend sync store' : 'Backend data unavailable'}</strong>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}
