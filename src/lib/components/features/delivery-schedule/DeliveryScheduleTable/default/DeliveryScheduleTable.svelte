<!--
  @component DeliveryScheduleTable
  @description Displays a paginated table of sales-order lines awaiting shipment
  (the delivery schedule). Shows the source sales order (linked to its details),
  customer, item, requested/confirmed delivery dates, ordered/remaining quantities
  and a payment-pending indicator. Defaults to outstanding lines only. Consumes
  filter state from page context.
  @keywords delivery, schedule, shipment, to-ship, outstanding, sales-orders, table, list
  @uses ResourceTable
  @api GET /api/legal-entities/{legalEntity}/delivery-schedule -> DeliveryScheduleLine[]
  @route sales-order-delivery-schedule
-->
<script lang="ts" module>
  // eslint-disable-next-line no-import-assign
  export { DeliveryScheduleTableContract as contract } from './DeliveryScheduleTable.contract.js'
</script>

<script lang="ts">
  import { ResourceTable } from '$lib/components/core/ResourceTable'
  import type { ColumnConfig } from '$lib/components/core/ResourceTable/types'
  import { useConsumes } from '$lib/contexts/page-state'
  import * as m from '$lib/paraglide/messages.js'
  import type { DeliveryScheduleLine } from '$lib/types/api-types'
  import { createQueryRequestObject, type FilterQuery, type PaginatedResponse } from '$lib/utils/filters'
  import { apiRequest } from '$lib/utils/request'
  import { createRoute } from '$utils/route-builder.js'
  import type { SnippetProps } from '$utils/runtime'
  import { DeliveryScheduleTableContract } from './DeliveryScheduleTable.contract.js'

  let { legalEntity }: SnippetProps = $props()

  const filtersHandle = useConsumes(DeliveryScheduleTableContract, 'filters')
  const filters = $derived(filtersHandle.get() as FilterQuery | undefined)

  const columns: ColumnConfig<DeliveryScheduleLine>[] = [
    {
      accessorKey: 'sales_order_number',
      header: m.sales_order(),
      renderer: 'link',
      rendererConfig: {
        // From a shipping-oriented list, jump straight to that order's delivery recap
        // (delivered vs remaining), not the generic order overview.
        urlBuilder: (row: DeliveryScheduleLine) =>
          createRoute({ $id: 'sales-order-delivery-schedule', params: { uuid: row.sales_order_id } }),
      },
    },
    {
      accessorKey: 'customer_name',
      header: m.customer(),
      renderer: 'text',
    },
    {
      accessorKey: 'item_code',
      header: m.item_code(),
      renderer: 'text',
    },
    {
      accessorKey: 'description',
      header: m.description(),
      renderer: 'long-text',
    },
    {
      accessorKey: 'uom',
      header: m.unit_of_measure(),
      renderer: 'text',
    },
    {
      accessorKey: 'quantity_ordered',
      header: m.quantity_ordered(),
      renderer: 'text',
    },
    {
      accessorKey: 'quantity_remaining',
      header: m.quantity_remaining(),
      renderer: 'text',
    },
    {
      accessorKey: 'requested_delivery_date',
      header: m.requested_delivery_date(),
      renderer: 'date',
    },
    {
      accessorKey: 'confirmed_delivery_date',
      header: m.confirmed_delivery_date(),
      renderer: 'date',
    },
    {
      accessorKey: 'payment_pending',
      header: m.payment_status(),
      renderer: 'state-indicator',
      rendererConfig: {
        variantMapper: (pending: boolean) => (pending ? 'error' : 'success'),
        labelMapper: (pending: boolean) => (pending ? m.payment_pending() : m.payment_settled()),
      },
    },
  ]

  const apiUrl = $derived(legalEntity?.id ? `/legal-entities/${legalEntity.id}/delivery-schedule` : null)

  // The "to ship" view is intrinsically the outstanding schedule, so `outstanding=true`
  // is baked into the fetch rather than exposed as a filter.
  const fetchLines = $derived(
    apiUrl
      ? (page: number, activeFilters?: FilterQuery): Promise<PaginatedResponse<DeliveryScheduleLine>> =>
          apiRequest<PaginatedResponse<DeliveryScheduleLine>>({
            url: apiUrl,
            queryParams: {
              page,
              outstanding: true,
              ...createQueryRequestObject({ search: activeFilters?.search, query: activeFilters?.query }),
            },
          })
      : null,
  )
</script>

{#if legalEntity && fetchLines}
  <ResourceTable {columns} fetchFunction={fetchLines} {filters} columnsStorageId="delivery-schedule-table" />
{/if}
