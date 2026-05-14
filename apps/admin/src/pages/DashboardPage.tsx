import {
  Activity,
  Boxes,
  FolderCheck,
  PlusCircle,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useAppAlerts } from '@printforge/ui'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { SectionCard } from '../components/SectionCard'
import { StatCard } from '../components/StatCard'
import { StatusPill } from '../components/StatusPill'
import {
  getIntegrationRequest,
  getPricingRulesRequest,
  getProductsRequest,
  getValidationRulesRequest,
} from '../lib/Api'
import type { IntegrationStatus, ProductRecord } from '../types/domain'

export function DashboardPage() {
  const { showError } = useAppAlerts()
  const [integration, setIntegration] = useState<IntegrationStatus | null>(null)
  const [recentProducts, setRecentProducts] = useState<ProductRecord[]>([])
  const [pricingRuleCount, setPricingRuleCount] = useState(0)
  const [validationRuleCount, setValidationRuleCount] = useState(0)

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [integrationResponse, productsResponse] = await Promise.all([
          getIntegrationRequest(),
          getProductsRequest(),
        ])
        const [pricingRulesResponse, validationRulesResponse] = await Promise.all([
          getPricingRulesRequest(),
          getValidationRulesRequest(),
        ])

        setIntegration(integrationResponse)
        setRecentProducts(productsResponse)
        setPricingRuleCount(pricingRulesResponse.length)
        setValidationRuleCount(validationRulesResponse.length)
      } catch (error) {
        setRecentProducts([])
        showError(
          error instanceof Error ? error.message : 'Unable to load dashboard data.',
          'Dashboard load failed',
        )
      }
    }

    void loadDashboardData()
  }, [])

  const derivedMetrics = useMemo(() => {
    const syncedCount = recentProducts.length
    const validationCoverage =
      syncedCount === 0 ? 0 : Math.min(100, Math.round((validationRuleCount / syncedCount) * 100))

    return [
      {
        label: 'Synced products',
        value: String(syncedCount).padStart(2, '0'),
        trend: integration ? `Last sync ${integration.lastSync}` : 'Waiting for backend data',
      },
      {
        label: 'Active pricing rules',
        value: String(pricingRuleCount).padStart(2, '0'),
        trend: 'Backend pricing registry',
      },
      {
        label: 'Validation rules',
        value: String(validationRuleCount).padStart(2, '0'),
        trend: `${validationCoverage}% coverage across synced products`,
      },
      {
        label: 'Connection status',
        value: integration?.apiStatus ?? 'Pending',
        trend: integration?.connectionName ?? 'No integration configured',
      },
    ]
  }, [integration, pricingRuleCount, recentProducts.length, validationRuleCount])

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Overview"
        title="Dashboard Overview"
        description="Synced product setup, validation coverage, and WooCommerce readiness."
      />
      <section className="stats-grid">
        {derivedMetrics.map((metric, index) => (
          <StatCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            trend={metric.trend}
            icon={
              [
                <Boxes className="stat-icon" />,
                <SlidersHorizontal className="stat-icon" />,
                <ShieldCheck className="stat-icon" />,
                <Activity className="stat-icon" />,
              ][index]
            }
            progress={
              metric.label === 'Validation rules' && recentProducts.length > 0
                ? Math.min(100, Math.round((validationRuleCount / recentProducts.length) * 100))
                : undefined
            }
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
                {recentProducts.slice(0, 4).map((product) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.sku}</td>
                    <td>{product.category}</td>
                    <td>{product.basePrice}</td>
                    <td>
                      <StatusPill
                        label={product.syncStatus}
                        tone={
                          product.syncStatus === 'Live from WooCommerce' ? 'info' : 'neutral'
                        }
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
            <strong>{recentProducts.length}</strong>
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
