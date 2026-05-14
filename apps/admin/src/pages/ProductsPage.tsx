import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Filter,
  RefreshCw,
  Search,
} from 'lucide-react'
import { useAppAlerts } from '@printforge/ui'
import {
  startTransition,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { SectionCard } from '../components/SectionCard'
import { StatusPill } from '../components/StatusPill'
import {
  getIntegrationRequest,
  getProductsRequest,
  syncProductsRequest,
} from '../lib/Api'
import type { IntegrationStatus, ProductRecord } from '../types/domain'

export function ProductsPage() {
  const { showError, showInfo } = useAppAlerts()
  const pageSize = 8
  const [products, setProducts] = useState<ProductRecord[]>([])
  const [integration, setIntegration] = useState<IntegrationStatus | null>(null)
  const [search, setSearch] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<'category' | 'status' | 'sync'>('category')
  const [filterValue, setFilterValue] = useState('')
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [page, setPage] = useState(1)
  const [sourceLabel, setSourceLabel] = useState('Loading backend product catalog...')
  const deferredSearch = useDeferredValue(search)
  const deferredFilterValue = useDeferredValue(filterValue)
  const filterMenuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!filterMenuRef.current?.contains(event.target as Node)) {
        setIsFilterMenuOpen(false)
      }
    }

    window.addEventListener('mousedown', handlePointerDown)
    return () => window.removeEventListener('mousedown', handlePointerDown)
  }, [])

  useEffect(() => {
    async function loadProducts() {
      try {
        const [integrationResponse, productsResponse] = await Promise.all([
          getIntegrationRequest(),
          getProductsRequest(),
        ])

        setIntegration(integrationResponse)
        setProducts(productsResponse)

        setSourceLabel(
          productsResponse.length > 0
            ? `${integrationResponse.connectionName} via backend sync storage. Last sync ${integrationResponse.lastSync}.`
            : `No synced products found yet for ${integrationResponse.connectionName}.`,
        )
      } catch (error) {
        setProducts([])
        setSourceLabel('Backend products unavailable.')
        showError(error instanceof Error ? error.message : 'Unable to load products.', 'Load failed')
      }
    }

    void loadProducts()
  }, [])

  async function syncProducts() {
    setIsSyncing(true)

    try {
      const result = await syncProductsRequest()

      startTransition(() => {
        setProducts(result.products)
        setSourceLabel(
          `${result.connectionName} via ${result.authMethod === 'public_store_api' ? 'public Store API' : 'WooCommerce REST API'}. Last synced ${result.syncedAt}.`,
        )
      })

      if (integration) {
        setIntegration({
          ...integration,
          lastSync: result.syncedAt,
          apiStatus: 'Healthy',
        })
      }

      showInfo(
        `${result.products.length} products were synced from ${result.connectionName}.`,
        'Sync complete',
      )
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to load WooCommerce products.'

      setSourceLabel(
        `Connection unavailable for ${integration?.connectionName ?? 'the configured store'}. Showing current cached data.`,
      )
      showError(message, 'Sync failed')
    } finally {
      setIsSyncing(false)
    }
  }

  const visibleProducts = useMemo(() => {
    const normalizedSearch = deferredSearch.trim().toLowerCase()
    const normalizedFilterValue = deferredFilterValue.trim().toLowerCase()

    return products.filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        product.sku.toLowerCase().includes(normalizedSearch)

      const matchesContextualFilter =
        !normalizedFilterValue ||
        (() => {
          if (selectedFilter === 'category') {
            return product.category.toLowerCase().includes(normalizedFilterValue)
          }

          if (selectedFilter === 'status') {
            return product.status.toLowerCase().includes(normalizedFilterValue)
          }

          return product.syncStatus.toLowerCase().includes(normalizedFilterValue)
        })()

      return matchesSearch && matchesContextualFilter
    })
  }, [deferredFilterValue, deferredSearch, products, selectedFilter])

  useEffect(() => {
    setPage(1)
  }, [deferredFilterValue, deferredSearch, selectedFilter])

  const totalPages = Math.max(1, Math.ceil(visibleProducts.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return visibleProducts.slice(startIndex, startIndex + pageSize)
  }, [currentPage, visibleProducts])

  const visibleRangeStart = visibleProducts.length === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const visibleRangeEnd =
    visibleProducts.length === 0 ? 0 : Math.min(currentPage * pageSize, visibleProducts.length)

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Products"
        title="Product Management"
        description={`Products are loaded from backend sync storage until you run a manual sync for ${integration?.connectionName ?? 'the configured WooCommerce connection'}.`}
        actions={
          <div className="button-row">
            <button
              className="primary-button"
              type="button"
              onClick={() => {
                void syncProducts()
              }}
              disabled={isSyncing}
            >
              <RefreshCw
                className={isSyncing ? 'button-icon is-spinning' : 'button-icon'}
                aria-hidden="true"
              />
              {isSyncing ? 'Syncing...' : 'Sync Products'}
            </button>
          </div>
        }
      />

      <section className="toolbar-row">
        <label className="input-shell">
          <Search className="input-icon" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search products..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <div className="filter-menu-shell" ref={filterMenuRef}>
          <button
            type="button"
            className="filter-trigger"
            onClick={() => setIsFilterMenuOpen((currentValue) => !currentValue)}
          >
            <Filter className="button-icon" aria-hidden="true" />
            Filter
            {isFilterMenuOpen ? (
              <ChevronUp className="button-icon" aria-hidden="true" />
            ) : (
              <ChevronDown className="button-icon" aria-hidden="true" />
            )}
          </button>

          {isFilterMenuOpen ? (
            <div className="filter-menu">
              <div className="filter-menu-list">
                {[
                  ['category', 'Category'],
                  ['status', 'Status'],
                  ['sync', 'Sync status'],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    className={
                      selectedFilter === value
                        ? 'filter-menu-item filter-menu-item-active'
                        : 'filter-menu-item'
                    }
                    onClick={() => setSelectedFilter(value as 'category' | 'status' | 'sync')}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <label className="filter-menu-input">
                <span>
                  {selectedFilter === 'category'
                    ? 'Category filter'
                    : selectedFilter === 'status'
                      ? 'Status filter'
                      : 'Sync status filter'}
                </span>
                <input
                  type="text"
                  placeholder="Type a filter value"
                  value={filterValue}
                  onChange={(event) => setFilterValue(event.target.value)}
                />
              </label>
            </div>
          ) : null}
        </div>
      </section>

      <SectionCard
        title="Catalog"
        description={`This admin catalog now reads from the backend sync layer for ${integration?.storeUrl ?? 'the configured WooCommerce store'}.`}
      >
        <div className="panel-meta-row">
          <p className="muted-copy">{sourceLabel}</p>
        </div>

        <div className="table-shell">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Base Price</th>
                <th>Status</th>
                <th>Sync</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty-row">
                    No products matched the current filters.
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <strong>{product.name}</strong>
                      <span>{product.sku}</span>
                    </td>
                    <td>{product.category}</td>
                    <td>{product.basePrice}</td>
                    <td>
                      <StatusPill
                        label={product.status}
                        tone={product.syncStatus === 'Live from WooCommerce' ? 'info' : 'neutral'}
                      />
                    </td>
                    <td>{product.syncStatus}</td>
                    <td>
                      <Link to={`/products/${product.id}`} className="table-link">
                        Open editor
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination-row">
          <span className="muted-copy">
            Showing {visibleRangeStart}-{visibleRangeEnd} of {visibleProducts.length} filtered
            products
          </span>
          <div className="pagination-controls">
            <button
              type="button"
              className="pagination-button"
              onClick={() => setPage((currentValue) => Math.max(1, currentValue - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="button-icon" aria-hidden="true" />
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                className={
                  currentPage === pageNumber
                    ? 'pagination-button pagination-button-active'
                    : 'pagination-button'
                }
                onClick={() => setPage(pageNumber)}
              >
                {pageNumber}
              </button>
            ))}
            <button
              type="button"
              className="pagination-button"
              onClick={() => setPage((currentValue) => Math.min(totalPages, currentValue + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="button-icon" aria-hidden="true" />
            </button>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}
