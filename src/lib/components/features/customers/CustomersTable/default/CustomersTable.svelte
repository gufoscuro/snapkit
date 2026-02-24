<!--
  @component CustomersTable
  @description Displays a paginated table of customers with load more functionality.
  Shows customer name (linked to details), VAT number, email, phone, and type.
  @keywords customers, table, list, pagination, load-more
  @uses ResourceTable
  @api GET /api/legal-entities/{legalEntity}/customers (Moddo API) -> Customer[]
  @api DELETE /api/legal-entities/{legalEntity}/customers/{customer} (Moddo API)
  @route customer-details
-->
<script lang="ts">
  import { ResourceTable } from '$lib/components/core/ResourceTable'
  import type { ColumnConfig } from '$lib/components/core/ResourceTable/types'
  import * as m from '$lib/paraglide/messages.js'
  import type { Customer } from '$lib/types/api-types'
  import { createArchiveAction } from '$lib/utils/table-actions'
  import { createApiFetcher } from '$lib/utils/table-fetchers'
  import { getCustomerTypeLabel } from '$utils/customers'
  import { createRoute } from '$utils/route-builder.js'
  import type { SnippetProps } from '$utils/runtime'

  let { legalEntity, pageDetails }: SnippetProps = $props()

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
      accessorKey: 'vat_number',
      header: m.vat(),
      renderer: 'text',
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
        variantMapper: (type: Customer['type']) => {
          const variants: Record<Customer['type'], 'brand' | 'default' | 'secondary' | 'outline'> = {
            company: 'default',
            individual: 'secondary',
            public_entity: 'secondary',
            consortium: 'secondary',
            association: 'outline',
          }
          return variants[type] ?? 'default'
        },
        labelMapper: (type: Customer['type']) => getCustomerTypeLabel(type),
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
  <ResourceTable {columns} fetchFunction={fetchCustomers} />
{/if}
