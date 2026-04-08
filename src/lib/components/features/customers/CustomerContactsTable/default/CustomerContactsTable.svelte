<!--
  @component CustomerContactsTable
  @description Displays a paginated table of customer contacts with load more functionality.
  Shows contact name, job title, email, phone, mobile, and type.
  Consumes filter state from page context to filter displayed data.
  @keywords customers, contacts, table, list, pagination, load-more, filters
  @uses ResourceTable
  @api GET /api/legal-entities/{legalEntity}/customers/{customer}/contacts (Moddo API) -> CustomerContact[]
  @api DELETE /api/legal-entities/{legalEntity}/customers/{customer}/contacts/{contact} (Moddo API)
-->
<script lang="ts" module>
  // eslint-disable-next-line no-import-assign
  export { CustomerContactsTableContract as contract } from './CustomerContactsTable.contract.js'
</script>

<script lang="ts">
  import { ResourceTable } from '$lib/components/core/ResourceTable'
  import type { ColumnConfig } from '$lib/components/core/ResourceTable/types'
  import { useConsumes, useProvides } from '$lib/contexts/page-state'
  import * as m from '$lib/paraglide/messages.js'
  import type { Customer, CustomerContact } from '$lib/types/api-types'
  import { getContactTypeLabel, getContactTypeVariant } from '$lib/utils/enum-labels'
  import type { FilterQuery } from '$lib/utils/filters'
  import { createArchiveAction } from '$lib/utils/table-actions'
  import { createApiFetcher } from '$lib/utils/table-fetchers'
  import { useBreadcrumbTitle } from '$lib/utils/breadcrumb-title'
  import { apiRequest } from '$utils/request.js'
  import { createRoute } from '$utils/route-builder.js'
  import type { SnippetProps } from '$utils/runtime'
  import { onDestroy, onMount } from 'svelte'
  import { CustomerContactsTableContract } from './CustomerContactsTable.contract.js'

  let { legalEntity, pageDetails }: SnippetProps = $props()

  const legalEntityId = $derived(legalEntity?.id)
  const customerId = $derived(pageDetails.params.uuid)

  const filtersHandle = useConsumes(CustomerContactsTableContract, 'filters')
  const filters = $derived(filtersHandle.get() as FilterQuery | undefined)

  const customerHandle = useProvides(CustomerContactsTableContract, 'customer')
  const breadcrumbTitle = useBreadcrumbTitle()

  onMount(async () => {
    if (legalEntityId && customerId) {
      const customer = await apiRequest<Customer>({
        url: `/legal-entities/${legalEntityId}/customers/${customerId}`,
      })
      customerHandle.set(customer)
      breadcrumbTitle.setLabel('customer-details', customer.name)
    }
  })

  onDestroy(() => {
    breadcrumbTitle.clearLabel('customer-details')
  })

  const columns: ColumnConfig<CustomerContact>[] = [
    {
      accessorKey: 'name',
      header: m.name(),
      renderer: 'link',
      rendererConfig: {
        urlBuilder: row => createRoute({ $id: 'customer-contact-details', params: { uuid: customerId, cid: row.id } }),
      },
    },
    {
      accessorKey: 'job_title',
      header: m.job_title(),
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
      accessorKey: 'mobile_phone',
      header: m.mobile_phone(),
      renderer: 'text',
    },
    {
      accessorKey: 'type',
      header: m.type(),
      renderer: 'badge',
      rendererConfig: {
        variantMapper: (type: CustomerContact['type']) => getContactTypeVariant(type),
        labelMapper: (type: CustomerContact['type']) => getContactTypeLabel(type),
      },
    },
    {
      header: '',
      renderer: 'actions',
      rendererConfig: {
        actions: [
          createArchiveAction({
            apiUrl: contact => `/legal-entities/${legalEntity?.id}/customers/${customerId}/contacts/${contact.id}`,
            confirmMessage: contact => m.archive_customer_contact_confirmation({ name: contact.name }),
            successMessage: contact => m.customer_contact_archived_success({ name: contact.name }),
            errorMessage: m.customer_contact_archive_error(),
          }),
        ],
      },
      meta: { cellClassName: 'p-0 h-10 w-12' },
    },
  ]

  const contactApiUrl = $derived(
    legalEntity?.id && customerId ? `/legal-entities/${legalEntity.id}/customers/${customerId}/contacts` : null,
  )
  const fetchContacts = $derived(contactApiUrl ? createApiFetcher<CustomerContact>(contactApiUrl) : null)
</script>

{#if legalEntity && customerId && fetchContacts}
  <ResourceTable {columns} fetchFunction={fetchContacts} {filters} columnsStorageId="customer-contacts-table" />
{/if}
