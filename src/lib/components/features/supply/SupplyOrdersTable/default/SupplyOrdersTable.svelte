<!--
  @component SupplyOrdersTable
  @description Displays a paginated table of supply orders with load more functionality.
  Shows order internal ID (linked to details), supplier (linked to details), status, expected delivery, and total price.
  Consumes filter state from page context to filter displayed data.
  @keywords supply, orders, table, list, pagination, load-more, filters
  @uses ResourceTable
  @api GET /order (supply-api) -> SupplyOrderSummary[]
  @route order-details, supplier-details
-->
<script lang="ts" module>
  export { SupplyOrdersTableContract as contract } from './SupplyOrdersTable.contract.js'
</script>

<script lang="ts">
  import { ResourceTable } from '$lib/components/core/ResourceTable'
  import type { ColumnConfig } from '$lib/components/core/ResourceTable/types'
  import { useConsumes } from '$lib/contexts/page-state'
  import type { FilterQuery } from '$lib/utils/filters'
  import * as m from '$lib/paraglide/messages.js'
  import type { SupplyOrderSummary } from '$lib/types/api-types'
  import { getSupplyStatusLabel, getSupplyStatusVariant } from '$lib/utils/enum-labels'
  import { createApiFetcher } from '$lib/utils/table-fetchers'
  import { createRoute } from '$utils/route-builder.js'
  import { SupplyOrdersTableContract } from './SupplyOrdersTable.contract.js'

  const filtersHandle = useConsumes(SupplyOrdersTableContract, 'filters')
  const filters = $derived(filtersHandle.get() as FilterQuery | undefined)

  // Column configuration - declarative and clean!
  const columns: ColumnConfig<SupplyOrderSummary>[] = [
    {
      accessorKey: 'internal_id',
      header: m.id(),
      renderer: 'link',
      rendererConfig: {
        urlBuilder: row => {
          const displayId = row.internal_id ?? row.id ?? '-'
          const orderId = row.id

          // Only create link if we have a valid order ID
          if (!orderId || displayId === '-') {
            return ''
          }

          return createRoute({
            $id: 'order-details',
            params: { uuid: orderId },
          })
        },
        valueAccessor: row => row.internal_id ?? row.id ?? '-',
      },
    },
    {
      accessorKey: 'supplier_attr',
      header: m.supplier(),
      renderer: 'link',
      rendererConfig: {
        urlBuilder: row => {
          const supplierId = row.supplier_attr?.id

          // Only create link if we have a valid supplier ID
          if (!supplierId) {
            return ''
          }

          return createRoute({
            $id: 'supplier-details',
            params: { uuid: supplierId },
          })
        },
        valueAccessor: row => row.supplier_attr?.name,
      },
    },
    {
      accessorKey: 'status',
      header: m.status(),
      renderer: 'badge',
      rendererConfig: {
        labelMapper: getSupplyStatusLabel,
        variantMapper: getSupplyStatusVariant,
      },
    },
    {
      accessorKey: 'expected_delivery_time',
      header: m.expected_delivery(),
      renderer: 'date',
    },
    {
      accessorKey: 'total_vat_incl',
      header: m.total(),
      renderer: 'currency',
      rendererConfig: {
        currencyAccessor: row => row.default_currency as string,
      },
    },
  ]

  // Fetch function - one line!
  const fetchOrders = createApiFetcher<SupplyOrderSummary>('supply/order')
</script>

<ResourceTable {columns} fetchFunction={fetchOrders} {filters} class="mt-4" />
