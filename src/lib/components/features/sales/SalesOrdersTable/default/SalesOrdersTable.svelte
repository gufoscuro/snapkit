<!--
  @component SalesOrdersTable
  @description Displays a paginated table of sales orders with load more functionality.
  Shows order ID (linked to details), customer (linked to details), sales channel, status, shipping status, expected shipping, and total.
  Consumes filter state from page context to filter displayed data.
  @keywords sales, orders, table, list, pagination, load-more, filters
  @uses ResourceTable
  @api GET /order (sales-api) -> SalesOrderSummary[]
  @route sales-order-detail, customer-details
-->
<script lang="ts" module>
  export { SalesOrdersTableContract as contract } from './SalesOrdersTable.contract.js'
</script>

<script lang="ts">
  import { ResourceTable } from '$lib/components/core/ResourceTable'
  import type { ColumnConfig } from '$lib/components/core/ResourceTable/types'
  import * as m from '$lib/paraglide/messages.js'
  import type { SalesOrderSummary } from '$lib/types/api-types'
  import {
    getSalesShippedLabel,
    getSalesShippedVariant,
    getSalesStatusLabel,
    getSalesStatusVariant,
  } from '$lib/utils/enum-labels'
  import { createApiFetcher } from '$lib/utils/table-fetchers'
  import { createRoute } from '$utils/route-builder.js'
  import { SalesOrdersTableContract } from './SalesOrdersTable.contract.js'

  // Column configuration - declarative and clean!
  const columns: ColumnConfig<SalesOrderSummary>[] = [
    {
      accessorKey: 'internal_id',
      header: m.id(),
      renderer: 'link',
      rendererConfig: {
        urlBuilder: row => {
          const orderId = row.id

          // Only create link if we have a valid order ID
          if (!orderId) {
            return ''
          }

          return createRoute({
            $id: 'sales-order-detail',
            params: { uuid: orderId },
          })
        },
        valueAccessor: row => row.internal_id ?? row.id ?? '-',
      },
    },
    {
      accessorKey: 'customer_attr',
      header: m.customer(),
      renderer: 'link',
      rendererConfig: {
        urlBuilder: row => {
          const customerId = row.customer_attr?.id

          // Only create link if we have a valid customer ID
          if (!customerId) {
            return ''
          }

          return createRoute({
            $id: 'customer-details',
            params: { uuid: customerId },
          })
        },
        valueAccessor: row => row.customer_attr?.name,
      },
    },
    {
      accessorKey: 'sales_channel_attr',
      header: m.sales_channel(),
      renderer: 'text',
      rendererConfig: {
        valueAccessor: row => row.sales_channel_attr?.name,
      },
    },
    {
      accessorKey: 'status',
      header: m.status(),
      renderer: 'badge',
      rendererConfig: {
        labelMapper: getSalesStatusLabel,
        variantMapper: getSalesStatusVariant,
      },
    },
    {
      accessorKey: 'shipped',
      header: m.shipping(),
      renderer: 'badge',
      rendererConfig: {
        labelMapper: (value: any) => {
          if (!value) return '-'
          return getSalesShippedLabel(value)
        },
        variantMapper: (value: any) => {
          if (!value) return 'secondary'
          return getSalesShippedVariant(value)
        },
      },
    },
    {
      accessorKey: 'expected_shipping_time',
      header: m.expected_shipping(),
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
  const fetchOrders = createApiFetcher<SalesOrderSummary>('sales/order')
</script>

<ResourceTable {columns} fetchFunction={fetchOrders} filtersContract={SalesOrdersTableContract} class="mt-4" />
