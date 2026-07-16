<!--
  @component SalesOrderDeliveryScheduleTable
  @description Line-by-line delivery/shipment recap for a single sales order: what has
  been shipped vs what remains. Fetches the delivery schedule scoped to one order
  (no `outstanding` filter, so fully-shipped lines with remaining=0 are also shown).
  Provides the sales order to page state so SalesOrderSidebar renders its header + menu.
  @keywords sales-order, delivery, schedule, shipment, recap, shipped, remaining, table
  @uses ResourceTable
  @api GET /api/legal-entities/{legalEntity}/sales-orders/{salesOrder} -> SalesOrder
  @api GET /api/legal-entities/{legalEntity}/delivery-schedule?sales_order_id={id} -> DeliveryScheduleLine[]
-->
<script lang="ts" module>
  // eslint-disable-next-line no-import-assign
  export { SalesOrderDeliveryScheduleTableContract as contract } from './SalesOrderDeliveryScheduleTable.contract.js'
</script>

<script lang="ts">
  import { ResourceTable } from '$lib/components/core/ResourceTable'
  import type { ColumnConfig } from '$lib/components/core/ResourceTable/types'
  import { useProvides } from '$lib/contexts/page-state'
  import * as m from '$lib/paraglide/messages.js'
  import type { DeliveryScheduleLine, SalesOrder } from '$lib/types/api-types'
  import { useBreadcrumbTitle } from '$lib/utils/breadcrumb-title'
  import type { PaginatedResponse } from '$lib/utils/filters'
  import { apiRequest } from '$lib/utils/request'
  import type { SnippetProps } from '$utils/runtime'
  import { onDestroy, onMount } from 'svelte'
  import { SalesOrderDeliveryScheduleTableContract } from './SalesOrderDeliveryScheduleTable.contract.js'

  let { pageDetails, legalEntity }: SnippetProps = $props()

  const salesOrderId = $derived(pageDetails.params.uuid)
  const legalEntityId = $derived(legalEntity?.id)

  // Feed the sales order into page state so SalesOrderSidebar (which consumes it)
  // renders the order header + subpage menu on this subpage.
  const salesOrderHandle = useProvides(SalesOrderDeliveryScheduleTableContract, 'salesOrder')
  const breadcrumbTitle = useBreadcrumbTitle()

  onMount(async () => {
    if (legalEntityId && salesOrderId) {
      const salesOrder = await apiRequest<SalesOrder>({
        url: `/legal-entities/${legalEntityId}/sales-orders/${salesOrderId}`,
      })
      salesOrderHandle.set(salesOrder)
      breadcrumbTitle.setLabel('sales-order-details', salesOrder.document_number)
    }
  })

  onDestroy(() => {
    salesOrderHandle.unset()
    breadcrumbTitle.clearLabel('sales-order-details')
  })

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
      accessorKey: 'quantity_shipped',
      header: m.quantity_shipped(),
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

  // Scoped to this order, all lines (no `outstanding`) so shipped-and-done lines
  // still show — the recap is "delivered vs remaining", not just the backlog.
  const fetchLines = $derived(
    legalEntityId && salesOrderId
      ? (page: number): Promise<PaginatedResponse<DeliveryScheduleLine>> =>
          apiRequest<PaginatedResponse<DeliveryScheduleLine>>({
            url: `/legal-entities/${legalEntityId}/delivery-schedule`,
            queryParams: { page, sales_order_id: salesOrderId },
          })
      : null,
  )
</script>

{#if legalEntityId && salesOrderId && fetchLines}
  <ResourceTable {columns} fetchFunction={fetchLines} columnsStorageId="sales-order-delivery-schedule-table" />
{/if}
