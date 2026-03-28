<!--
  @component SuppliersTable
  @description Displays a paginated table of suppliers with load more functionality.
  Shows supplier name (linked to details), VAT number, email, phone, and type.
  Consumes filter state from page context to filter displayed data.
  @keywords suppliers, table, list, pagination, load-more, filters
  @uses ResourceTable
  @api GET /api/legal-entities/{legalEntity}/suppliers (Moddo API) -> Supplier[]
  @api DELETE /api/legal-entities/{legalEntity}/suppliers/{supplier} (Moddo API)
  @route supplier-details
-->
<script lang="ts" module>
  // eslint-disable-next-line no-import-assign
  export { SuppliersTableContract as contract } from './SuppliersTable.contract.js'
</script>

<script lang="ts">
  import { ResourceTable } from '$lib/components/core/ResourceTable'
  import type { ColumnConfig } from '$lib/components/core/ResourceTable/types'
  import { useConsumes } from '$lib/contexts/page-state'
  import * as m from '$lib/paraglide/messages.js'
  import type { Supplier } from '$lib/types/api-types'
  import { getSupplierTypeLabel } from '$lib/utils/enum-labels'
  import SupplierTagBadges from '$lib/components/features/suppliers/SupplierTagBadges.svelte'
  import type { FilterQuery } from '$lib/utils/filters'
  import { createArchiveAction } from '$lib/utils/table-actions'
  import { createApiFetcher } from '$lib/utils/table-fetchers'
  import { createRoute } from '$utils/route-builder.js'
  import type { SnippetProps } from '$utils/runtime'
  import { SuppliersTableContract } from './SuppliersTable.contract.js'

  let { legalEntity }: SnippetProps = $props()

  const filtersHandle = useConsumes(SuppliersTableContract, 'filters')
  const filters = $derived(filtersHandle.get() as FilterQuery | undefined)

  const columns: ColumnConfig<Supplier>[] = [
    {
      accessorKey: 'name',
      header: m.supplier(),
      renderer: 'link',
      rendererConfig: {
        urlBuilder: row => createRoute({ $id: 'supplier-details', params: { uuid: row.id } }),
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
        variantMapper: () => 'outline',
        labelMapper: (type: Supplier['type']) => getSupplierTypeLabel(type),
      },
    },
    {
      accessorKey: 'tags',
      header: '',
      renderer: 'badges',
      rendererConfig: {
        component: SupplierTagBadges,
      },
    },
    {
      header: '',
      renderer: 'actions',
      rendererConfig: {
        actions: [
          createArchiveAction({
            apiUrl: supplier => `/legal-entities/${legalEntity?.id}/suppliers/${supplier.id}`,
            confirmMessage: supplier => m.archive_supplier_confirmation({ name: supplier.name }),
            successMessage: supplier => m.supplier_archived_success({ name: supplier.name }),
            errorMessage: m.supplier_archive_error(),
          }),
        ],
      },
      meta: { cellClassName: 'p-0 h-10 w-12' },
    },
  ]

  // Two-step derivation: string equality on the URL prevents spurious function recreation
  // when legalEntity is a new object reference but the ID hasn't changed (e.g., during navigation).
  const supplierApiUrl = $derived(legalEntity?.id ? `/legal-entities/${legalEntity.id}/suppliers` : null)
  const fetchSuppliers = $derived(supplierApiUrl ? createApiFetcher<Supplier>(supplierApiUrl) : null)
</script>

{#if legalEntity && fetchSuppliers}
  <ResourceTable {columns} fetchFunction={fetchSuppliers} {filters} />
{/if}
