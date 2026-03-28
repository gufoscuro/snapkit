<!--
  @component CustomersTable
  @description Displays a paginated table of customers with load more functionality.
  Shows customer name (linked to details), VAT number, email, phone, and type.
  Consumes filter state from page context to filter displayed data.
  @keywords customers, table, list, pagination, load-more, filters
  @uses ResourceTable
  @api GET /api/legal-entities/{legalEntity}/customers (Moddo API) -> Customer[]
  @api DELETE /api/legal-entities/{legalEntity}/customers/{customer} (Moddo API)
  @route customer-details
-->
<script lang="ts" module>
  // eslint-disable-next-line no-import-assign
  export { CustomersTableContract as contract } from './CustomersTable.contract.js'
</script>

<script lang="ts">
  import { ResourceTable } from '$lib/components/core/ResourceTable'
  import type { ColumnConfig } from '$lib/components/core/ResourceTable/types'
  import { useConsumes } from '$lib/contexts/page-state'
  import * as m from '$lib/paraglide/messages.js'
  import type { Customer } from '$lib/types/api-types'
  import CustomerTagBadges from '$lib/components/features/customers/CustomerTagBadges.svelte'
  import { getCustomerCommercialStatusLabel, getCustomerTypeLabel } from '$lib/utils/enum-labels'
  import type { FilterQuery } from '$lib/utils/filters'
  import { createArchiveAction } from '$lib/utils/table-actions'
  import { createApiFetcher } from '$lib/utils/table-fetchers'
  import { createRoute } from '$utils/route-builder.js'
  import type { SnippetProps } from '$utils/runtime'
  import { CustomersTableContract } from './CustomersTable.contract.js'

  let { legalEntity }: SnippetProps = $props()

  const filtersHandle = useConsumes(CustomersTableContract, 'filters')
  const filters = $derived(filtersHandle.get() as FilterQuery | undefined)

  const columns: ColumnConfig<Customer>[] = [
    {
      accessorKey: 'name',
      header: m.customer(),
      renderer: 'link',
      rendererConfig: {
        urlBuilder: row => createRoute({ $id: 'customer-details', params: { uuid: row.id } }),
      },
    },
    {
      accessorKey: 'email',
      header: m.email(),
      renderer: 'text',
    },
    {
      accessorKey: 'phone',
      header: m.phone(),
      renderer: 'text',
    },
    {
      accessorKey: 'type',
      header: m.type(),
      renderer: 'badge',
      rendererConfig: {
        variantMapper: () => 'outline',
        labelMapper: (type: Customer['type']) => getCustomerTypeLabel(type),
      },
    },
    {
      accessorKey: 'commercial_status',
      header: m.status(),
      renderer: 'status',
      rendererConfig: {
        variantMapper: (status: Customer['commercial_status']) => {
          if (status === 'active') return 'active'
          if (status === 'prospect') return 'in-progress'
          return 'neutral'
        },
        labelMapper: (status: Customer['commercial_status']) => getCustomerCommercialStatusLabel(status),
      },
    },
    {
      accessorKey: 'tags',
      header: '',
      renderer: 'badges',
      rendererConfig: {
        component: CustomerTagBadges,
      },
    },
    {
      header: '',
      renderer: 'actions',
      rendererConfig: {
        actions: [
          createArchiveAction({
            apiUrl: customer => `/legal-entities/${legalEntity?.id}/customers/${customer.id}`,
            confirmMessage: customer => m.archive_customer_confirmation({ name: customer.name }),
            successMessage: customer => m.customer_archived_success({ name: customer.name }),
            errorMessage: m.customer_archive_error(),
          }),
        ],
      },
      meta: { cellClassName: 'p-0 h-10 w-12' },
    },
  ]

  // Two-step derivation: string equality on the URL prevents spurious function recreation
  // when legalEntity is a new object reference but the ID hasn't changed (e.g., during navigation).
  const customerApiUrl = $derived(legalEntity?.id ? `/legal-entities/${legalEntity.id}/customers` : null)
  const fetchCustomers = $derived(customerApiUrl ? createApiFetcher<Customer>(customerApiUrl) : null)
</script>

{#if legalEntity && fetchCustomers}
  <ResourceTable {columns} fetchFunction={fetchCustomers} {filters} />
{/if}
