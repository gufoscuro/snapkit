<!--
  @component CustomerAddressesTable
  @description Displays a paginated table of customer addresses with load more functionality.
  Shows address line, city, postal code, country, type, and default status.
  Consumes filter state from page context to filter displayed data.
  @keywords customers, addresses, table, list, pagination, load-more, filters
  @uses ResourceTable
  @api GET /api/legal-entities/{legalEntity}/customers/{customer}/addresses (Moddo API) -> CustomerAddress[]
  @api DELETE /api/legal-entities/{legalEntity}/customers/{customer}/addresses/{address} (Moddo API)
-->
<script lang="ts" module>
  // eslint-disable-next-line no-import-assign
  export { CustomerAddressesTableContract as contract } from './CustomerAddressesTable.contract.js'
</script>

<script lang="ts">
  import { ResourceTable } from '$lib/components/core/ResourceTable'
  import type { ColumnConfig } from '$lib/components/core/ResourceTable/types'
  import { useConsumes, useProvides } from '$lib/contexts/page-state'
  import * as m from '$lib/paraglide/messages.js'
  import type { Customer, CustomerAddress } from '$lib/types/api-types'
  import { getAddressTypeLabel, getAddressTypeVariant } from '$lib/utils/enum-labels'
  import type { FilterQuery } from '$lib/utils/filters'
  import { createArchiveAction } from '$lib/utils/table-actions'
  import { createApiFetcher } from '$lib/utils/table-fetchers'
  import { apiRequest } from '$utils/request.js'
  import { createRoute } from '$utils/route-builder.js'
  import type { SnippetProps } from '$utils/runtime'
  import { onDestroy, onMount } from 'svelte'
  import { CustomerAddressesTableContract } from './CustomerAddressesTable.contract.js'

  let { legalEntity, pageDetails }: SnippetProps = $props()

  const legalEntityId = $derived(legalEntity?.id)
  const customerId = $derived(pageDetails.params.uuid)

  const filtersHandle = useConsumes(CustomerAddressesTableContract, 'filters')
  const filters = $derived(filtersHandle.get() as FilterQuery | undefined)

  const customerHandle = useProvides(CustomerAddressesTableContract, 'customer')

  onMount(async () => {
    if (legalEntityId && customerId) {
      const customer = await apiRequest<Customer>({
        url: `/legal-entities/${legalEntityId}/customers/${customerId}`,
      })
      customerHandle.set(customer)
    }
  })

  onDestroy(() => customerHandle.unset())

  const columns: ColumnConfig<CustomerAddress>[] = [
    {
      accessorKey: 'address_line_1',
      header: m.address_line_1(),
      renderer: 'link',
      rendererConfig: {
        urlBuilder: row => createRoute({ $id: 'customer-address-details', params: { uuid: customerId, aid: row.id } }),
      },
    },
    {
      accessorKey: 'city',
      header: m.city(),
      renderer: 'text',
    },
    {
      accessorKey: 'postal_code',
      header: m.postal_code(),
      renderer: 'text',
    },
    {
      accessorKey: 'country_code',
      header: m.country_code(),
      renderer: 'text',
    },
    {
      accessorKey: 'type',
      header: m.type(),
      renderer: 'badge',
      rendererConfig: {
        variantMapper: (type: CustomerAddress['type']) => getAddressTypeVariant(type),
        labelMapper: (type: CustomerAddress['type']) => getAddressTypeLabel(type),
      },
    },
    {
      accessorKey: 'is_default',
      header: m.is_default(),
      renderer: 'status',
      rendererConfig: {
        variantMapper: (isDefault: CustomerAddress['is_default']) => (isDefault ? 'active' : 'neutral'),
        labelMapper: (isDefault: CustomerAddress['is_default']) => (isDefault ? m.default_yes() : '–'),
      },
    },
    {
      header: '',
      renderer: 'actions',
      rendererConfig: {
        actions: [
          createArchiveAction({
            apiUrl: address => `/legal-entities/${legalEntity?.id}/customers/${customerId}/addresses/${address.id}`,
            confirmMessage: () => m.archive_customer_address_confirmation(),
            successMessage: () => m.customer_address_archived_success(),
            errorMessage: m.customer_address_archive_error(),
          }),
        ],
      },
      meta: { cellClassName: 'p-0 h-10 w-12' },
    },
  ]

  const addressApiUrl = $derived(
    legalEntity?.id && customerId ? `/legal-entities/${legalEntity.id}/customers/${customerId}/addresses` : null,
  )
  const fetchAddresses = $derived(addressApiUrl ? createApiFetcher<CustomerAddress>(addressApiUrl) : null)
</script>

{#if legalEntity && customerId && fetchAddresses}
  <ResourceTable {columns} fetchFunction={fetchAddresses} {filters} />
{/if}
