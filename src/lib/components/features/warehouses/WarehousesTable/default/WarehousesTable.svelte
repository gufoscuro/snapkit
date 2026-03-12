<!--
  @component WarehousesTable
  @description Displays a paginated table of warehouses with load more functionality.
  Shows warehouse code, description, type, valuation method, and active status.
  Consumes filter state from page context to filter displayed data.
  @keywords warehouses, table, list, pagination, load-more, filters, settings
  @uses ResourceTable
  @api GET /api/legal-entities/{legalEntity}/warehouses (Moddo API) -> LegalEntityWarehouse[]
  @api DELETE /api/legal-entities/{legalEntity}/warehouses/{warehouse} (Moddo API)
-->
<script lang="ts" module>
  export { WarehousesTableContract as contract } from './WarehousesTable.contract.js'
</script>

<script lang="ts">
  import { ResourceTable } from '$lib/components/core/ResourceTable'
  import type { ColumnConfig } from '$lib/components/core/ResourceTable/types'
  import { useConsumes } from '$lib/contexts/page-state'
  import * as m from '$lib/paraglide/messages.js'
  import type { LegalEntityWarehouse } from '$lib/types/api-types'
  import type { FilterQuery } from '$lib/utils/filters'
  import { createArchiveAction } from '$lib/utils/table-actions'
  import { createApiFetcher } from '$lib/utils/table-fetchers'
  import { getWarehouseTypeLabel, getValuationMethodLabel } from '$lib/utils/enum-labels'
  import type { SnippetProps } from '$utils/runtime'
  import { WarehousesTableContract } from './WarehousesTable.contract.js'

  let { legalEntity }: SnippetProps = $props()

  const filtersHandle = useConsumes(WarehousesTableContract, 'filters')
  const filters = $derived(filtersHandle.get() as FilterQuery | undefined)

  const columns: ColumnConfig<LegalEntityWarehouse>[] = [
    {
      accessorKey: 'code',
      header: m.code(),
      renderer: 'link',
      rendererConfig: {
        urlBuilder: (row) => `/settings/warehouses/upsert/${row.id}`,
      },
    },
    {
      accessorKey: 'description',
      header: m.description(),
      renderer: 'text',
    },
    {
      accessorKey: 'warehouse_type',
      header: m.warehouse_type(),
      renderer: 'text',
      rendererConfig: {
        valueAccessor: (row) => getWarehouseTypeLabel(row.warehouse_type),
      },
    },
    {
      accessorKey: 'valuation_method',
      header: m.valuation_method(),
      renderer: 'text',
      rendererConfig: {
        valueAccessor: (row) => getValuationMethodLabel(row.valuation_method),
      },
    },
    {
      header: '',
      renderer: 'actions',
      rendererConfig: {
        actions: [
          createArchiveAction({
            apiUrl: (warehouse) => `/legal-entities/${legalEntity?.id}/warehouses/${warehouse.id}`,
            confirmMessage: (warehouse) => m.archive_warehouse_confirmation({ name: warehouse.description }),
            successMessage: (warehouse) => m.warehouse_archived_success({ name: warehouse.description }),
            errorMessage: m.warehouse_archive_error(),
          }),
        ],
      },
      meta: { cellClassName: 'p-0 h-10 w-12' },
    },
  ]

  const warehousesApiUrl = $derived(
    legalEntity?.id ? `/legal-entities/${legalEntity.id}/warehouses` : null,
  )
  const fetchWarehouses = $derived(
    warehousesApiUrl ? createApiFetcher<LegalEntityWarehouse>(warehousesApiUrl) : null,
  )
</script>

{#if legalEntity && fetchWarehouses}
  <ResourceTable {columns} fetchFunction={fetchWarehouses} {filters} />
{/if}
