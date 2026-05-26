import {
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
  Search,
} from 'lucide-react'
import {
  startTransition,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { Link } from 'react-router-dom'
import { PageHeader, SectionCard, StatusPill, useAppAlerts } from '@printforge/ui'
import type { IntegrationStatus, ProductRecord } from '@printforge/ui'
import { Button } from '@printforge/ui/components/ui/button'
import { Input } from '@printforge/ui/components/ui/input'
import { Label } from '@printforge/ui/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@printforge/ui/components/ui/popover'
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
  syncProductsRequest,
} from '../lib/Api'

const PAGE_SIZE = 8

type FilterKey = 'category' | 'status' | 'sync'

const FILTER_OPTIONS: Array<[FilterKey, string]> = [
  ['category', 'Category'],
  ['status', 'Status'],
  ['sync', 'Sync status'],
]

function getFilterLabel(key: FilterKey) {
  if (key === 'category') return 'Category filter'
  if (key === 'status') return 'Status filter'
  return 'Sync status filter'
}

function matchesFilter(product: ProductRecord, key: FilterKey, value: string) {
  if (key === 'category') return product.category.toLowerCase().includes(value)
  if (key === 'status') return product.status.toLowerCase().includes(value)
  return product.syncStatus.toLowerCase().includes(value)
}

export function ProductsPage() {
  const { showError, showInfo } = useAppAlerts()
  const [products, setProducts] = useState<ProductRecord[]>([])
  const [integration, setIntegration] = useState<IntegrationStatus | null>(null)
  const [search, setSearch] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<FilterKey>('category')
  const [filterValue, setFilterValue] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [page, setPage] = useState(1)
  const [sourceLabel, setSourceLabel] = useState('Loading backend product catalog...')
  const deferredSearch = useDeferredValue(search)
  const deferredFilterValue = useDeferredValue(filterValue)

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
        showError(
          error instanceof Error ? error.message : 'Unable to load products.',
          'Load failed',
        )
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
        setIntegration({ ...integration, lastSync: result.syncedAt, apiStatus: 'Healthy' })
      }
      showInfo(
        `${result.products.length} products were synced from ${result.connectionName}.`,
        'Sync complete',
      )
    } catch (error) {
      setSourceLabel(
        `Connection unavailable for ${integration?.connectionName ?? 'the configured store'}. Showing current cached data.`,
      )
      showError(
        error instanceof Error ? error.message : 'Unable to load WooCommerce products.',
        'Sync failed',
      )
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
        !normalizedFilterValue || matchesFilter(product, selectedFilter, normalizedFilterValue)
      return matchesSearch && matchesContextualFilter
    })
  }, [deferredFilterValue, deferredSearch, products, selectedFilter])

  useEffect(() => {
    setPage(1)
  }, [deferredFilterValue, deferredSearch, selectedFilter])

  const totalPages = Math.max(1, Math.ceil(visibleProducts.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE
    return visibleProducts.slice(startIndex, startIndex + PAGE_SIZE)
  }, [currentPage, visibleProducts])

  const visibleRangeStart = visibleProducts.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1
  const visibleRangeEnd =
    visibleProducts.length === 0
      ? 0
      : Math.min(currentPage * PAGE_SIZE, visibleProducts.length)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Products"
        title="Product Management"
        description={`Products are loaded from backend sync storage until you run a manual sync for ${integration?.connectionName ?? 'the configured WooCommerce connection'}.`}
        actions={
          <Button onClick={() => void syncProducts()} disabled={isSyncing}>
            <RefreshCw className={isSyncing ? 'animate-spin' : ''} />
            {isSyncing ? 'Syncing…' : 'Sync Products'}
          </Button>
        }
      />

      {/* Toolbar */}
      <div className="grid grid-cols-[1fr_auto] items-center gap-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products…"
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <Filter />
              Filter
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-3" align="end">
            <div className="mb-3 flex gap-1">
              {FILTER_OPTIONS.map(([value, label]) => (
                <Button
                  key={value}
                  variant={selectedFilter === value ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedFilter(value)}
                >
                  {label}
                </Button>
              ))}
            </div>
            <div className="grid gap-1.5">
              <Label>{getFilterLabel(selectedFilter)}</Label>
              <Input
                type="text"
                placeholder="Type a filter value…"
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <SectionCard
        title="Catalog"
        description={`This admin catalog reads from the backend sync layer for ${integration?.storeUrl ?? 'the configured WooCommerce store'}.`}
      >
        <p className="mb-3 text-sm text-muted-foreground">{sourceLabel}</p>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Base Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sync</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedProducts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  No products matched the current filters.
                </TableCell>
              </TableRow>
            ) : (
              paginatedProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.sku}</p>
                  </TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{product.basePrice}</TableCell>
                  <TableCell>
                    <StatusPill
                      label={product.status}
                      tone={product.syncStatus === 'Live from WooCommerce' ? 'info' : 'neutral'}
                    />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {product.syncStatus}
                  </TableCell>
                  <TableCell>
                    <Button asChild variant="link" size="sm">
                      <Link to={`/products/${product.id}`}>Open editor</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="mt-3 flex items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">
            Showing {visibleRangeStart}–{visibleRangeEnd} of {visibleProducts.length} products
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage((v) => Math.max(1, v - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
              <Button
                key={pageNumber}
                variant={currentPage === pageNumber ? 'default' : 'outline'}
                size="icon"
                onClick={() => setPage(pageNumber)}
              >
                {pageNumber}
              </Button>
            ))}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage((v) => Math.min(totalPages, v + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}
