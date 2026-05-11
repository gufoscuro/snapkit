<!--
  @component WarehouseOrdersTable
  @description Displays a paginated table of warehouse orders with load more functionality.
  Shows document number (linked to details), customer, state, document date,
  planned ship date, picking status and tags.
  Consumes filter state from page context to filter displayed data.
  @keywords warehouse-orders, table, list, pagination, load-more, filters, warehouse
  @uses ResourceTable
  @api GET /api/legal-entities/{legalEntity}/warehouse-orders -> WarehouseOrder[]
  @api DELETE /api/legal-entities/{legalEntity}/warehouse-orders/{warehouseOrder}
  @route warehouse-order-details
-->
<script lang="ts" module>
  // eslint-disable-next-line no-import-assign
  export { WarehouseOrdersTableContract as contract } from './WarehouseOrdersTable.contract.js'
</script>

<script lang="ts">
  import { ResourceTable } from '$lib/components/core/ResourceTable'
  import type { ColumnConfig } from '$lib/components/core/ResourceTable/types'
  import WarehouseOrderPickingBadge from '$lib/components/features/warehouse-orders/WarehouseOrderPickingBadge.svelte'
  import WarehouseOrderTagBadges from '$lib/components/features/warehouse-orders/WarehouseOrderTagBadges.svelte'
  import { useConsumes } from '$lib/contexts/page-state'
  import * as m from '$lib/paraglide/messages.js'
  import type { WarehouseOrder } from '$lib/types/api-types'
  import { getWarehouseOrderStatusLabel } from '$lib/utils/enum-labels'
  import type { FilterQuery } from '$lib/utils/filters'
  import { createArchiveAction } from '$lib/utils/table-actions'
  import { createApiFetcher } from '$lib/utils/table-fetchers'
  import { createRoute } from '$utils/route-builder.js'
  import type { SnippetProps } from '$utils/runtime'
  import { WarehouseOrdersTableContract } from './WarehouseOrdersTable.contract.js'

  let { legalEntity }: SnippetProps = $props()

  const filtersHandle = useConsumes(WarehouseOrdersTableContract, 'filters')
  const filters = $derived(filtersHandle.get() as FilterQuery | undefined)

  const columns: ColumnConfig<WarehouseOrder>[] = [
    {
      accessorKey: 'state',
      header: '',
      renderer: 'state-indicator',
      rendererConfig: {
        variantMapper: (state: WarehouseOrder['state']) => {
          if (state === 'handed_over') return 'success'
          return 'default'
        },
        labelMapper: (state: WarehouseOrder['state']) => getWarehouseOrderStatusLabel(state),
      },
      meta: { cellClassName: 'w-10 px-0' },
    },
    {
      accessorKey: 'document_number',
      header: m.document_number(),
      renderer: 'link',
      rendererConfig: {
        urlBuilder: (row: WarehouseOrder) =>
          createRoute({ $id: 'warehouse-order-details', params: { uuid: row.id } }),
      },
    },
    {
      accessorKey: 'customer_snapshot',
      header: m.customer(),
      renderer: 'custom',
      rendererConfig: {
        cellRenderer: (row: WarehouseOrder) => {
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
      accessorKey: 'planned_ship_date',
      header: m.planned_ship_date(),
      renderer: 'date',
    },
    {
      accessorKey: 'picking_status',
      header: m.picking_status(),
      renderer: 'component',
      rendererConfig: {
        component: WarehouseOrderPickingBadge,
        propsMapper: (row: WarehouseOrder) => ({ pickingStatus: row.picking_status }),
      },
    },
    {
      accessorKey: 'tags',
      header: '',
      renderer: 'badges',
      rendererConfig: {
        component: WarehouseOrderTagBadges,
      },
    },
    {
      header: '',
      renderer: 'actions',
      rendererConfig: {
        actions: [
          createArchiveAction<WarehouseOrder>({
            apiUrl: order => `/legal-entities/${legalEntity?.id}/warehouse-orders/${order.id}`,
            confirmMessage: order => m.archive_warehouse_order_confirmation({ name: order.document_number }),
            successMessage: order => m.warehouse_order_archived_success({ name: order.document_number }),
            errorMessage: m.warehouse_order_archive_error(),
          }),
        ],
      },
      meta: { cellClassName: 'p-0 h-10 w-12' },
    },
  ]

  const warehouseOrderApiUrl = $derived(
    legalEntity?.id ? `/legal-entities/${legalEntity.id}/warehouse-orders` : null,
  )
  const fetchWarehouseOrders = $derived(
    warehouseOrderApiUrl ? createApiFetcher<WarehouseOrder>(warehouseOrderApiUrl) : null,
  )
</script>

{#if legalEntity && fetchWarehouseOrders}
  <ResourceTable
    {columns}
    fetchFunction={fetchWarehouseOrders}
    {filters}
    columnsStorageId="warehouse-order-table" />
{/if}
