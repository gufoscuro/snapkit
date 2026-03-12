<!--
  @component SupplierAddressesTable
  @description Displays a paginated table of supplier addresses with load more functionality.
  Shows address line, city, postal code, country, type, and default status.
  Consumes filter state from page context to filter displayed data.
  @keywords suppliers, addresses, table, list, pagination, load-more, filters
  @uses ResourceTable
  @api GET /api/legal-entities/{legalEntity}/suppliers/{supplier}/addresses (Moddo API) -> SupplierAddress[]
  @api DELETE /api/legal-entities/{legalEntity}/suppliers/{supplier}/addresses/{address} (Moddo API)
-->
<script lang="ts" module>
  // eslint-disable-next-line no-import-assign
  export { SupplierAddressesTableContract as contract } from './SupplierAddressesTable.contract.js'
</script>

<script lang="ts">
  import { ResourceTable } from '$lib/components/core/ResourceTable'
  import type { ColumnConfig } from '$lib/components/core/ResourceTable/types'
  import { useConsumes, useProvides } from '$lib/contexts/page-state'
  import * as m from '$lib/paraglide/messages.js'
  import type { Supplier, SupplierAddress } from '$lib/types/api-types'
  import { getSupplierAddressTypeLabel, getSupplierAddressTypeVariant } from '$lib/utils/enum-labels'
  import type { FilterQuery } from '$lib/utils/filters'
  import { createArchiveAction } from '$lib/utils/table-actions'
  import { createApiFetcher } from '$lib/utils/table-fetchers'
  import { apiRequest } from '$utils/request.js'
  import { createRoute } from '$utils/route-builder.js'
  import type { SnippetProps } from '$utils/runtime'
  import { onDestroy, onMount } from 'svelte'
  import { SupplierAddressesTableContract } from './SupplierAddressesTable.contract.js'

  let { legalEntity, pageDetails }: SnippetProps = $props()

  const legalEntityId = $derived(legalEntity?.id)
  const supplierId = $derived(pageDetails.params.uuid)

  const filtersHandle = useConsumes(SupplierAddressesTableContract, 'filters')
  const filters = $derived(filtersHandle.get() as FilterQuery | undefined)

  const supplierHandle = useProvides(SupplierAddressesTableContract, 'supplier')

  onMount(async () => {
    if (legalEntityId && supplierId) {
      const supplier = await apiRequest<Supplier>({
        url: `/legal-entities/${legalEntityId}/suppliers/${supplierId}`,
      })
      supplierHandle.set(supplier)
    }
  })

  onDestroy(() => supplierHandle.unset())

  const columns: ColumnConfig<SupplierAddress>[] = [
    {
      accessorKey: 'address_line_1',
      header: m.address_line_1(),
      renderer: 'link',
      rendererConfig: {
        urlBuilder: row => createRoute({ $id: 'supplier-address-details', params: { uuid: supplierId, aid: row.id } }),
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
        variantMapper: (type: SupplierAddress['type']) => getSupplierAddressTypeVariant(type),
        labelMapper: (type: SupplierAddress['type']) => getSupplierAddressTypeLabel(type),
      },
    },
    {
      accessorKey: 'is_default',
      header: m.is_default(),
      renderer: 'status',
      rendererConfig: {
        variantMapper: (isDefault: SupplierAddress['is_default']) => (isDefault ? 'active' : 'neutral'),
        labelMapper: (isDefault: SupplierAddress['is_default']) => (isDefault ? m.default_yes() : '–'),
      },
    },
    {
      header: '',
      renderer: 'actions',
      rendererConfig: {
        actions: [
          createArchiveAction({
            apiUrl: address => `/legal-entities/${legalEntity?.id}/suppliers/${supplierId}/addresses/${address.id}`,
            confirmMessage: () => m.archive_supplier_address_confirmation(),
            successMessage: () => m.supplier_address_archived_success(),
            errorMessage: m.supplier_address_archive_error(),
          }),
        ],
      },
      meta: { cellClassName: 'p-0 h-10 w-12' },
    },
  ]

  const addressApiUrl = $derived(
    legalEntity?.id && supplierId ? `/legal-entities/${legalEntity.id}/suppliers/${supplierId}/addresses` : null,
  )
  const fetchAddresses = $derived(addressApiUrl ? createApiFetcher<SupplierAddress>(addressApiUrl) : null)
</script>

{#if legalEntity && supplierId && fetchAddresses}
  <ResourceTable {columns} fetchFunction={fetchAddresses} {filters} />
{/if}
