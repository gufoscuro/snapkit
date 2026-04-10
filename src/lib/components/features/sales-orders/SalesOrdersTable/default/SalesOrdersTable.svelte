<!--
  @component SalesOrdersTable
  @description Displays a paginated table of sales orders with load more functionality.
  Shows document number (linked to details), customer, status, document date,
  requested delivery date, currency, net value, fulfillment status and tags.
  Consumes filter state from page context to filter displayed data.
  @keywords sales-orders, table, list, pagination, load-more, filters, sales
  @uses ResourceTable
  @api GET /api/legal-entities/{legalEntity}/sales-orders -> SalesOrder[]
  @api DELETE /api/legal-entities/{legalEntity}/sales-orders/{salesOrder}
  @route sales-order-details
-->
<script lang="ts" module>
  // eslint-disable-next-line no-import-assign
  export { SalesOrdersTableContract as contract } from './SalesOrdersTable.contract.js'
</script>

<script lang="ts">
  import { ResourceTable } from '$lib/components/core/ResourceTable'
  import type { ColumnConfig } from '$lib/components/core/ResourceTable/types'
  import SalesOrderTagBadges from '$lib/components/features/sales-orders/SalesOrderTagBadges.svelte'
  import { useConsumes } from '$lib/contexts/page-state'
  import * as m from '$lib/paraglide/messages.js'
  import type { SalesOrder } from '$lib/types/api-types'
  import { getSalesOrderFulfillmentStatusLabel, getSalesOrderStatusLabel } from '$lib/utils/enum-labels'
  import type { FilterQuery } from '$lib/utils/filters'
  import { createArchiveAction } from '$lib/utils/table-actions'
  import { createApiFetcher } from '$lib/utils/table-fetchers'
  import { createRoute } from '$utils/route-builder.js'
  import type { SnippetProps } from '$utils/runtime'
  import { SalesOrdersTableContract } from './SalesOrdersTable.contract.js'

  let { legalEntity }: SnippetProps = $props()

  const filtersHandle = useConsumes(SalesOrdersTableContract, 'filters')
  const filters = $derived(filtersHandle.get() as FilterQuery | undefined)

  const columns: ColumnConfig<SalesOrder>[] = [
    {
      accessorKey: 'state',
      header: '',
      renderer: 'state-indicator',
      rendererConfig: {
        variantMapper: (state: SalesOrder['state']) => {
          if (state === 'approved') return 'success'
          if (state === 'rejected') return 'error'
          return 'default'
        },
        labelMapper: (state: SalesOrder['state']) => getSalesOrderStatusLabel(state),
      },
      meta: { cellClassName: 'w-10 px-0' },
    },
    {
      accessorKey: 'document_number',
      header: m.document_number(),
      renderer: 'link',
      rendererConfig: {
        urlBuilder: (row: SalesOrder) => createRoute({ $id: 'sales-order-details', params: { uuid: row.id } }),
      },
    },
    {
      accessorKey: 'customer_snapshot',
      header: m.customer(),
      renderer: 'custom',
      rendererConfig: {
        cellRenderer: (row: SalesOrder) => {
          const snapshot = row.customer_snapshot
          if (Array.isArray(snapshot) && snapshot.length > 0) {
            return ((snapshot[0] as Record<string, unknown>)?.name as string) ?? '-'
          }
          if (snapshot && !Array.isArray(snapshot)) {
            return ((snapshot as Record<string, unknown>)?.name as string) ?? '-'
          }
          return '-'
        },
      },
    },
    {
      accessorKey: 'document_date',
      header: m.document_date(),
      renderer: 'date',
    },
    {
      accessorKey: 'requested_delivery_date',
      header: m.requested_delivery_date(),
      renderer: 'date',
    },
    {
      accessorKey: 'net_value',
      header: m.net_total(),
      renderer: 'currency',
      rendererConfig: {
        currencyAccessor: (row: SalesOrder) => row.currency,
      },
    },
    {
      accessorKey: 'fulfillment_status',
      header: m.fulfillment_status(),
      renderer: 'custom',
      rendererConfig: {
        cellRenderer: (row: SalesOrder) => {
          if (!row.fulfillment_status) return '-'
          return getSalesOrderFulfillmentStatusLabel(row.fulfillment_status)
        },
      },
    },
    {
      accessorKey: 'tags',
      header: '',
      renderer: 'badges',
      rendererConfig: {
        component: SalesOrderTagBadges,
      },
    },
    {
      header: '',
      renderer: 'actions',
      rendererConfig: {
        actions: [
          createArchiveAction<SalesOrder>({
            apiUrl: order => `/legal-entities/${legalEntity?.id}/sales-orders/${order.id}`,
            confirmMessage: order => m.archive_sales_order_confirmation({ name: order.document_number }),
            successMessage: order => m.sales_order_archived_success({ name: order.document_number }),
            errorMessage: m.sales_order_archive_error(),
          }),
        ],
      },
      meta: { cellClassName: 'p-0 h-10 w-12' },
    },
  ]

  const salesOrderApiUrl = $derived(legalEntity?.id ? `/legal-entities/${legalEntity.id}/sales-orders` : null)
  const fetchSalesOrders = $derived(salesOrderApiUrl ? createApiFetcher<SalesOrder>(salesOrderApiUrl) : null)
</script>

{#if legalEntity && fetchSalesOrders}
  <ResourceTable {columns} fetchFunction={fetchSalesOrders} {filters} columnsStorageId="sales-order-table" />
{/if}
