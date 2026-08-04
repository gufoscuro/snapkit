<!--
  @component DeliveryScheduleTable
  @description Displays a paginated table of sales-order lines awaiting shipment
  (the delivery schedule), grouped by source sales order: the order (linked to its
  delivery recap), customer and the "create DDT" action sit in the group header,
  while each row shows item, requested/confirmed delivery dates, ordered/remaining
  quantities and a payment-pending indicator. Defaults to outstanding lines only.
  Consumes filter state from page context.
  @keywords delivery, schedule, shipment, to-ship, outstanding, sales-orders, table, list, group
  @uses ResourceTable, TableGroupHeader
  @api GET /api/legal-entities/{legalEntity}/delivery-schedule -> DeliveryScheduleLine[]
  @route sales-order-delivery-schedule
-->
<script lang="ts" module>
  // eslint-disable-next-line no-import-assign
  export { DeliveryScheduleTableContract as contract } from './DeliveryScheduleTable.contract.js'
</script>

<script lang="ts">
  import { goto } from '$app/navigation'
  import ActionButton from '$lib/components/core/ActionButton.svelte'
  import { ResourceTable } from '$lib/components/core/ResourceTable'
  import type { ColumnConfig } from '$lib/components/core/ResourceTable/types'
  import TableGroupHeader from '$lib/components/features/common/TableGroupHeader.svelte'
  import DeliveryDateCell from '$lib/components/features/delivery-schedule/DeliveryDateCell.svelte'
  import QuantityProgressCell from '$lib/components/features/delivery-schedule/QuantityProgressCell.svelte'
  import { useConsumes } from '$lib/contexts/page-state'
  import * as m from '$lib/paraglide/messages.js'
  import type { DeliveryScheduleLine } from '$lib/types/api-types'
  import type { FilterQuery } from '$lib/utils/filters'
  import { createApiFetcher } from '$lib/utils/table-fetchers'
  import { createRoute } from '$utils/route-builder.js'
  import type { SnippetProps } from '$utils/runtime'
  import IconTruckDelivery from '@tabler/icons-svelte/icons/truck-delivery'
  import { DeliveryScheduleTableContract } from './DeliveryScheduleTable.contract.js'
  import { useTableExport } from '$lib/utils/table-export.svelte'

  let { legalEntity }: SnippetProps = $props()

  const filtersHandle = useConsumes(DeliveryScheduleTableContract, 'filters')
  const filters = $derived(filtersHandle.get() as FilterQuery | undefined)

  // Rows are order lines, so a handful of orders can expand into a long flat list.
  // Grouping by order restores the unit the user came from (the dashboard counts
  // orders), while keeping lines addressable individually.
  const groupKey = (row: DeliveryScheduleLine) => row.sales_order_id

  // Creating a DDT consumes the whole source order, so the action belongs to the
  // group, not to each line — on a flat list it was repeated identically per row.
  function createTransportDocument(salesOrderId: string) {
    const url = createRoute({
      $id: 'transport-document-details',
      query: { sales_order_id: salesOrderId },
    })
    // eslint-disable-next-line svelte/no-navigation-without-resolve
    goto(url)
  }

  const columns: ColumnConfig<DeliveryScheduleLine>[] = [
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
      // Ordered / shipped / remaining condensed into one cell (uom folded in) to
      // keep this wide multi-order table readable.
      accessorKey: 'quantity_remaining',
      header: m.quantity(),
      renderer: 'component',
      rendererConfig: {
        component: QuantityProgressCell,
        propsMapper: (row: DeliveryScheduleLine) => ({
          ordered: row.quantity_ordered,
          shipped: row.quantity_shipped,
          remaining: row.quantity_remaining,
          uom: row.uom,
        }),
      },
    },
    {
      // Requested + confirmed dates fused: confirmed wins, requested shown muted
      // with a clock marker when not yet confirmed.
      accessorKey: 'confirmed_delivery_date',
      header: m.delivery_date(),
      renderer: 'component',
      rendererConfig: {
        component: DeliveryDateCell,
        propsMapper: (row: DeliveryScheduleLine) => ({
          requested: row.requested_delivery_date,
          confirmed: row.confirmed_delivery_date,
        }),
      },
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
  // Grouping is client-side over the loaded rows, so a larger page means fewer
  // groups arriving half-loaded on first paint.
  const fetchLines = $derived(
    apiUrl ? createApiFetcher<DeliveryScheduleLine>(apiUrl, { perPage: 50, params: { outstanding: true } }) : null,
  )

  // Publishes the CSV export to the sibling filters component (page-state channel).
  useTableExport(DeliveryScheduleTableContract, () => fetchLines)
</script>

{#snippet groupHeader(rows: DeliveryScheduleLine[])}
  {@const order = rows[0]}
  <TableGroupHeader
    code={order.sales_order_number}
    customerName={order.customer_name}
    href={createRoute({ $id: 'sales-order-delivery-schedule', params: { uuid: order.sales_order_id } })}>
    {#snippet actions()}
      <ActionButton
        tooltip={m.create_transport_document_from_order()}
        variant="ghost"
        size="sm"
        class="h-8 w-8 p-0"
        onclick={() => createTransportDocument(order.sales_order_id)}>
        <IconTruckDelivery class="h-4 w-4" />
      </ActionButton>
    {/snippet}
  </TableGroupHeader>
{/snippet}

{#if legalEntity && fetchLines}
  <ResourceTable
    {columns}
    fetchFunction={fetchLines}
    {filters}
    groupBy={groupKey}
    {groupHeader}
    columnsStorageId="delivery-schedule-table" />
{/if}
