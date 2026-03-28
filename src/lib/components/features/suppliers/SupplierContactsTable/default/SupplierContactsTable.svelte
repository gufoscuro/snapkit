<!--
  @component SupplierContactsTable
  @description Displays a paginated table of supplier contacts with load more functionality.
  Shows contact name, job title, email, phone, mobile, and type.
  Consumes filter state from page context to filter displayed data.
  @keywords suppliers, contacts, table, list, pagination, load-more, filters
  @uses ResourceTable
  @api GET /api/legal-entities/{legalEntity}/suppliers/{supplier}/contacts (Moddo API) -> SupplierContact[]
  @api DELETE /api/legal-entities/{legalEntity}/suppliers/{supplier}/contacts/{contact} (Moddo API)
-->
<script lang="ts" module>
  // eslint-disable-next-line no-import-assign
  export { SupplierContactsTableContract as contract } from './SupplierContactsTable.contract.js'
</script>

<script lang="ts">
  import { ResourceTable } from '$lib/components/core/ResourceTable'
  import type { ColumnConfig } from '$lib/components/core/ResourceTable/types'
  import { useConsumes, useProvides } from '$lib/contexts/page-state'
  import * as m from '$lib/paraglide/messages.js'
  import type { Supplier, SupplierContact } from '$lib/types/api-types'
  import { getSupplierContactTypeLabel, getSupplierContactTypeVariant } from '$lib/utils/enum-labels'
  import type { FilterQuery } from '$lib/utils/filters'
  import { createArchiveAction } from '$lib/utils/table-actions'
  import { createApiFetcher } from '$lib/utils/table-fetchers'
  import { useBreadcrumbTitle } from '$lib/utils/breadcrumb-title'
  import { apiRequest } from '$utils/request.js'
  import { createRoute } from '$utils/route-builder.js'
  import type { SnippetProps } from '$utils/runtime'
  import { onDestroy, onMount } from 'svelte'
  import { SupplierContactsTableContract } from './SupplierContactsTable.contract.js'

  let { legalEntity, pageDetails }: SnippetProps = $props()

  const legalEntityId = $derived(legalEntity?.id)
  const supplierId = $derived(pageDetails.params.uuid)

  const filtersHandle = useConsumes(SupplierContactsTableContract, 'filters')
  const filters = $derived(filtersHandle.get() as FilterQuery | undefined)

  const supplierHandle = useProvides(SupplierContactsTableContract, 'supplier')
  const breadcrumbTitle = useBreadcrumbTitle()

  onMount(async () => {
    if (legalEntityId && supplierId) {
      const supplier = await apiRequest<Supplier>({
        url: `/legal-entities/${legalEntityId}/suppliers/${supplierId}`,
      })
      supplierHandle.set(supplier)
      breadcrumbTitle.setLabel('supplier-details', supplier.name)
    }
  })

  onDestroy(() => {
    breadcrumbTitle.clearLabel('supplier-details')
  })

  const columns: ColumnConfig<SupplierContact>[] = [
    {
      accessorKey: 'name',
      header: m.name(),
      renderer: 'link',
      rendererConfig: {
        urlBuilder: row => createRoute({ $id: 'supplier-contact-details', params: { uuid: supplierId, cid: row.id } }),
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
        variantMapper: (type: SupplierContact['type']) => getSupplierContactTypeVariant(type),
        labelMapper: (type: SupplierContact['type']) => getSupplierContactTypeLabel(type),
      },
    },
    {
      header: '',
      renderer: 'actions',
      rendererConfig: {
        actions: [
          createArchiveAction({
            apiUrl: contact => `/legal-entities/${legalEntity?.id}/suppliers/${supplierId}/contacts/${contact.id}`,
            confirmMessage: contact => m.archive_supplier_contact_confirmation({ name: contact.name }),
            successMessage: contact => m.supplier_contact_archived_success({ name: contact.name }),
            errorMessage: m.supplier_contact_archive_error(),
          }),
        ],
      },
      meta: { cellClassName: 'p-0 h-10 w-12' },
    },
  ]

  const contactApiUrl = $derived(
    legalEntity?.id && supplierId ? `/legal-entities/${legalEntity.id}/suppliers/${supplierId}/contacts` : null,
  )
  const fetchContacts = $derived(contactApiUrl ? createApiFetcher<SupplierContact>(contactApiUrl) : null)
</script>

{#if legalEntity && supplierId && fetchContacts}
  <ResourceTable {columns} fetchFunction={fetchContacts} {filters} />
{/if}
