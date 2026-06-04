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
import { PageHeader, PageStack, SectionCard, StatusPill, Toolbar, useAppAlerts } from '@printforge/ui'
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

type FilterKey = 'category' | 'status'

const FILTER_OPTIONS: Array<[FilterKey, string]> = [
  ['category', 'Category'],
  ['status', 'Status'],
]

function getFilterLabel(key: FilterKey) {
  if (key === 'category') return 'Filter by category'
  return 'Filter by status'
}

function matchesFilter(product: ProductRecord, key: FilterKey, value: string) {
  if (key === 'category') return (product.category ?? '').toLowerCase().includes(value)
  return (product.status ?? '').toLowerCase().includes(value)
}

function getProductStatusLabel(product: ProductRecord) {
  return product.status ?? 'Unknown'
}

function getProductStatusTone(product: ProductRecord) {
  return product.status === 'publish' ? 'success' : 'neutral'
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
  const [isLoading, setIsLoading] = useState(true)
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
      } catch (error) {
        setProducts([])
        showError(
          error instanceof Error ? error.message : 'Unable to load products.',
          'Load failed',
        )
      } finally {
        setIsLoading(false)
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
      })
      if (integration) {
        setIntegration({ ...integration, lastSync: result.syncedAt, apiStatus: 'Healthy' })
      }
      showInfo(
        `${result.products.length} products synced from ${result.connectionName}.`,
        'Sync complete',
      )
    } catch (error) {
      showError(
        error instanceof Error ? error.message : 'Unable to sync products.',
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
        (product.name ?? '').toLowerCase().includes(normalizedSearch) ||
        (product.sku ?? '').toLowerCase().includes(normalizedSearch)
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
  const emptyStateMessage =
    products.length === 0
      ? 'No products synced yet. Use the Sync button to pull from WooCommerce.'
      : 'No products matched your search or filter.'

  const visibleRangeStart = visibleProducts.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1
  const visibleRangeEnd =
    visibleProducts.length === 0
      ? 0
      : Math.min(currentPage * PAGE_SIZE, visibleProducts.length)
  const resultsSummary =
    visibleProducts.length === 0
      ? 'No results'
      : `${visibleRangeStart}–${visibleRangeEnd} of ${visibleProducts.length} products`

  let syncLabel = 'Not synced yet'
  if (integration?.lastSync && integration.lastSync !== 'Not synced yet') {
    syncLabel = `Last synced ${integration.lastSync}`
  }

  const tableContent = isLoading ? (
    <TableRow>
      <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
        Loading products…
      </TableCell>
    </TableRow>
  ) : paginatedProducts.length === 0 ? (
    <TableRow>
      <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
        {emptyStateMessage}
      </TableCell>
    </TableRow>
  ) : (
    paginatedProducts.map((product) => (
      <TableRow key={product.id}>
        <TableCell className="font-medium">{product.name}</TableCell>
        <TableCell className="tabular-nums text-muted-foreground">{product.sku}</TableCell>
        <TableCell>{product.category ?? '—'}</TableCell>
        <TableCell className="tabular-nums">{product.basePrice}</TableCell>
        <TableCell>
          <StatusPill
            label={getProductStatusLabel(product)}
            tone={getProductStatusTone(product)}
          />
        </TableCell>
        <TableCell className="text-right">
          <Button asChild variant="outline" size="sm">
            <Link to={`/products/${product.id}`}>Configure</Link>
          </Button>
        </TableCell>
      </TableRow>
    ))
  )

  return (
    <PageStack>
      <PageHeader
        eyebrow="Products"
        title="Products"
        description={`Manage and configure your WooCommerce products. ${syncLabel}.`}
        actions={
          <Button onClick={() => void syncProducts()} disabled={isSyncing}>
            <RefreshCw className={isSyncing ? 'animate-spin' : ''} />
            {isSyncing ? 'Syncing…' : 'Sync products'}
          </Button>
        }
      />

      <Toolbar className="sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Search by name or SKU…"
            className="w-full pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <Filter />
              Filter
              {filterValue && (
                <span className="ml-1 size-2 rounded-full bg-primary" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72" align="end">
            <div className="mb-3 flex gap-1">
              {FILTER_OPTIONS.map(([value, label]) => (
                <Button
                  key={value}
                  variant={selectedFilter === value ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    setSelectedFilter(value)
                    setFilterValue('')
                  }}
                >
                  {label}
                </Button>
              ))}
            </div>
            <div className="grid gap-1.5">
              <Label>{getFilterLabel(selectedFilter)}</Label>
              <Input
                type="text"
                placeholder="Type to filter…"
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
              />
            </div>
            {filterValue && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 w-full"
                onClick={() => setFilterValue('')}
              >
                Clear filter
              </Button>
            )}
          </PopoverContent>
        </Popover>
      </Toolbar>

      <SectionCard title="Product catalog">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Base price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                  Loading products…
                </TableCell>
              </TableRow>
            ) : paginatedProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                  {emptyStateMessage}
                </TableCell>
              </TableRow>
            ) : (
              paginatedProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">{product.sku}</TableCell>
                  <TableCell>{product.category ?? '—'}</TableCell>
                  <TableCell className="tabular-nums">{product.basePrice}</TableCell>
                  <TableCell>
                    <StatusPill
                      label={getProductStatusLabel(product)}
                      tone={getProductStatusTone(product)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/products/${product.id}`}>Configure</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="mt-3 flex items-center justify-between gap-4 border-t border-border/60 pt-3">
          <span className="text-sm text-muted-foreground">{resultsSummary}</span>
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
    </PageStack>
  )
}
