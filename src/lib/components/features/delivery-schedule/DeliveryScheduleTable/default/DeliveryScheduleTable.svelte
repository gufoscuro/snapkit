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
  import { goto } from '$app/navigation'
  import { ResourceTable } from '$lib/components/core/ResourceTable'
  import type { ColumnConfig } from '$lib/components/core/ResourceTable/types'
  import RecordCustomerCell from '$lib/components/features/common/RecordCustomerCell.svelte'
  import DeliveryDateCell from '$lib/components/features/delivery-schedule/DeliveryDateCell.svelte'
  import QuantityProgressCell from '$lib/components/features/delivery-schedule/QuantityProgressCell.svelte'
  import { useConsumes } from '$lib/contexts/page-state'
  import * as m from '$lib/paraglide/messages.js'
  import type { DeliveryScheduleLine } from '$lib/types/api-types'
  import { createQueryRequestObject, type FilterQuery, type PaginatedResponse } from '$lib/utils/filters'
  import { apiRequest } from '$lib/utils/request'
  import { createRoute } from '$utils/route-builder.js'
  import type { SnippetProps } from '$utils/runtime'
  import IconTruckDelivery from '@tabler/icons-svelte/icons/truck-delivery'
  import { DeliveryScheduleTableContract } from './DeliveryScheduleTable.contract.js'

  let { legalEntity }: SnippetProps = $props()

  const filtersHandle = useConsumes(DeliveryScheduleTableContract, 'filters')
  const filters = $derived(filtersHandle.get() as FilterQuery | undefined)

  const columns: ColumnConfig<DeliveryScheduleLine>[] = [
    {
      // Order number (linked) + customer stacked into one identity column. The link
      // jumps to that order's delivery recap (delivered vs remaining), not the
      // generic order overview.
      accessorKey: 'sales_order_number',
      header: m.sales_order(),
      renderer: 'component',
      rendererConfig: {
        component: RecordCustomerCell,
        propsMapper: (row: DeliveryScheduleLine) => ({
          code: row.sales_order_number,
          customerName: row.customer_name,
          href: createRoute({ $id: 'sales-order-delivery-schedule', params: { uuid: row.sales_order_id } }),
        }),
      },
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
    {
      header: '',
      renderer: 'actions',
      rendererConfig: {
        actions: [
          {
            icon: IconTruckDelivery,
            variant: 'ghost',
            label: m.create_transport_document_from_order(),
            onClick: (row: DeliveryScheduleLine) => {
              // Jump to a blank DDT with the source order in the URL; the DDT page
              // auto-imports it (mirrors the invoiceable-documents → invoice flow).
              const url = createRoute({
                $id: 'transport-document-details',
                query: { sales_order_id: row.sales_order_id },
              })
              // eslint-disable-next-line svelte/no-navigation-without-resolve
              goto(url)
            },
          },
        ],
      },
      meta: { cellClassName: 'p-0 h-10 w-12' },
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
