<!--
  @component SupplyOrdersTable
  @description Displays a paginated table of supply orders with load more functionality.
  Shows order name, supplier, status, expected delivery, and total.
  @keywords supply, orders, table, list, pagination, load-more
  @uses DataTable, Badge
  @api GET /order (supply-api) -> orderSummary[]
-->
<script lang="ts">
  import { DataTable } from '$lib/components/core/DataTable'
  import { badgeVariants } from '$lib/components/ui/badge'
  import { renderSnippet } from '$lib/components/ui/data-table'
  import { createQueryRequestObject, DEFAULT_ITEMS_LIMIT } from '$lib/utils/filters'
  import { apiRequest } from '$lib/utils/request'
  import type { ColumnDef } from '@tanstack/table-core'
  import { createRawSnippet } from 'svelte'

  // Type from supply-api orderSummary
  type OrderSummary = {
    id?: string
    name: string
    internal_id?: string
    status: 'draft' | 'sent' | 'accepted' | 'shipped' | 'rejected'
    expected_delivery_time: string
    total_vat_incl: number
    default_currency?: string
    supplier_attr?: {
      id?: string
      name: string
      vat: string
    }
    warehouse_attr?: {
      id: string
      name: string
    }
  }

  // Status badge variants
  const statusVariants: Record<OrderSummary['status'], 'default' | 'secondary' | 'destructive' | 'outline'> = {
    draft: 'secondary',
    sent: 'outline',
    accepted: 'default',
    shipped: 'default',
    rejected: 'destructive',
  }

  // Column definitions
  const columns: ColumnDef<OrderSummary>[] = [
    {
      accessorKey: 'internal_id',
      header: 'ID',
      cell: ({ row }) => row.original.internal_id ?? row.original.id ?? '-',
    },
    {
      accessorKey: 'supplier_attr',
      header: 'Supplier',
      cell: ({ row }) => row.original.supplier_attr?.name ?? '-',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status
        const variant = statusVariants[status]
        const badgeClass = badgeVariants({ variant })
        const snippet = createRawSnippet<[string]>(() => ({
          render: () => `<span class="${badgeClass}">${status}</span>`,
        }))
        return renderSnippet(snippet, status)
      },
    },
    {
      accessorKey: 'expected_delivery_time',
      header: 'Expected Delivery',
      cell: ({ row }) => {
        const date = row.original.expected_delivery_time
        if (!date) return '-'
        return new Date(date).toLocaleDateString()
      },
    },
    {
      accessorKey: 'total_vat_incl',
      header: 'Total',
      cell: ({ row }) => {
        const currency = row.original.default_currency ?? 'EUR'
        const formatter = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency,
        })
        return formatter.format(row.original.total_vat_incl)
      },
    },
  ]

  // State
  let data = $state<OrderSummary[]>([])
  let loading = $state(true)
  let loadingMore = $state(false)
  let hasMore = $state(true)

  // Fetch function
  async function fetchOrders(offset: number = 0): Promise<OrderSummary[]> {
    const response = await apiRequest<OrderSummary[]>({
      url: 'supply/order',
      queryParams: createQueryRequestObject({
        limit: DEFAULT_ITEMS_LIMIT,
        offset,
      }),
    })
    return response ?? []
  }

  // Initial load
  async function loadInitial() {
    loading = true
    try {
      const items = await fetchOrders(0)
      data = items
      hasMore = items.length >= DEFAULT_ITEMS_LIMIT
    } catch (err) {
      console.error('Failed to load orders:', err)
      data = []
      hasMore = false
    } finally {
      loading = false
    }
  }

  // Load more handler
  async function handleLoadMore() {
    loadingMore = true
    try {
      const items = await fetchOrders(data.length)
      data = [...data, ...items]
      hasMore = items.length >= DEFAULT_ITEMS_LIMIT
    } catch (err) {
      console.error('Failed to load more orders:', err)
    } finally {
      loadingMore = false
    }
  }

  // Load on mount
  $effect(() => {
    loadInitial()
  })
</script>

<DataTable {data} {columns} {loading} {loadingMore} {hasMore} onLoadMore={handleLoadMore} class="mt-4" />
