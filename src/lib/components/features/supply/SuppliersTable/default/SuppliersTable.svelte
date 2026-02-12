<!--
  @component SuppliersTable
  @description Displays a paginated table of suppliers with load more functionality.
  Shows supplier name (linked to details), categories, email, phone, VAT, and archive action.
  Consumes filter state from page context to filter displayed data.
  @keywords supply, suppliers, table, list, pagination, load-more, filters, archive
  @uses ResourceTable, CategoryBadges
  @api GET /supplier (supply-api) -> supplierSummary[]
  @api DELETE /supplier/{supplierId} (supply-api)
  @route supplier-details
-->
<script lang="ts" module>
  export { SuppliersTableContract as contract } from './SuppliersTable.contract.js'
</script>

<script lang="ts">
  import { ResourceTable } from '$lib/components/core/ResourceTable'
  import type { ColumnConfig } from '$lib/components/core/ResourceTable/types'
  import * as m from '$lib/paraglide/messages.js'
  import type { SupplierSummary } from '$lib/types/api-types'
  import { createArchiveAction } from '$lib/utils/table-actions'
  import { createApiFetcher } from '$lib/utils/table-fetchers'
  import { createRoute } from '$utils/route-builder.js'
  import CategoryBadges from '../../CategoryBadges.svelte'
  import { SuppliersTableContract } from './SuppliersTable.contract.js'

  // Column configuration - declarative and clean!
  const columns: ColumnConfig<SupplierSummary>[] = [
    {
      accessorKey: 'name',
      header: m.supplier(),
      renderer: 'link',
      rendererConfig: {
        urlBuilder: row =>
          createRoute({
            $id: 'page-kvmrbv',
            params: { uuid: row.id! },
          }),
      },
    },
    {
      accessorKey: 'categories',
      header: m.categories(),
      renderer: 'badges',
      rendererConfig: {
        component: CategoryBadges,
      },
    },
    {
      accessorKey: 'emails',
      header: m.email(),
      renderer: 'email',
    },
    {
      accessorKey: 'phones',
      header: m.phone(),
      renderer: 'phone',
    },
    {
      accessorKey: 'vat_no',
      header: m.vat(),
      renderer: 'text',
    },
    {
      header: '',
      renderer: 'actions',
      rendererConfig: {
        actions: [
          createArchiveAction({
            apiUrl: supplier => `supply/supplier/${supplier.id}`,
            confirmMessage: supplier => m.archive_supplier_confirmation({ name: supplier.name || '' }),
            successMessage: supplier => m.supplier_archived_success({ name: supplier.name || '' }),
            errorMessage: m.supplier_archive_error(),
          }),
        ],
      },
      meta: {
        cellClassName: 'p-0 w-12',
      },
    },
  ]

  // Fetch function - one line!
  const fetchSuppliers = createApiFetcher<SupplierSummary>('supply/supplier')
</script>

<ResourceTable {columns} fetchFunction={fetchSuppliers} filtersContract={SuppliersTableContract} class="mt-4" />
