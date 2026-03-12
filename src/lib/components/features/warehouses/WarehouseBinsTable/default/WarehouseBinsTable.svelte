<!--
  @component WarehouseBinsTable
  @description Displays a paginated table of warehouse bins for a specific zone.
  Shows bin code, description, location type, and active status.
  Consumes filter state from page context to filter displayed data.
  @keywords warehouse, bins, zone, table, list, pagination, load-more, filters, settings
  @uses ResourceTable
  @api GET /api/legal-entities/{legalEntity}/warehouses/{warehouse}/zones/{zone}/bins (Moddo API) -> WarehouseBin[]
  @api DELETE /api/legal-entities/{legalEntity}/warehouses/{warehouse}/zones/{zone}/bins/{bin} (Moddo API)
-->
<script lang="ts" module>
  export { WarehouseBinsTableContract as contract } from './WarehouseBinsTable.contract.js'
</script>

<script lang="ts">
  import { page } from '$app/state'
  import { ResourceTable } from '$lib/components/core/ResourceTable'
  import type { ColumnConfig } from '$lib/components/core/ResourceTable/types'
  import { useConsumes } from '$lib/contexts/page-state'
  import * as m from '$lib/paraglide/messages.js'
  import type { WarehouseBin } from '$lib/types/api-types'
  import { getBinLocationTypeLabel } from '$lib/utils/enum-labels'
  import type { FilterQuery } from '$lib/utils/filters'
  import { createArchiveAction } from '$lib/utils/table-actions'
  import { createApiFetcher } from '$lib/utils/table-fetchers'
  import type { SnippetProps } from '$utils/runtime'
  import { WarehouseBinsTableContract } from './WarehouseBinsTable.contract.js'

  let { legalEntity }: SnippetProps = $props()

  const warehouseId = $derived(page.params.uuid)
  const zoneId = $derived(page.params.tid)

  const filtersHandle = useConsumes(WarehouseBinsTableContract, 'filters')
  const filters = $derived(filtersHandle.get() as FilterQuery | undefined)

  const columns: ColumnConfig<WarehouseBin>[] = [
    {
      accessorKey: 'code',
      header: m.code(),
      renderer: 'link',
      rendererConfig: {
        urlBuilder: (row) =>
          `/settings/warehouses/upsert/${warehouseId}/zones/${zoneId}/bins/upsert/${row.id}`,
      },
    },
    {
      accessorKey: 'description',
      header: m.description(),
      renderer: 'text',
    },
    {
      accessorKey: 'location_type',
      header: m.location_type(),
      renderer: 'text',
      rendererConfig: {
        valueAccessor: (row) => getBinLocationTypeLabel(row.location_type),
      },
    },
    {
      accessorKey: 'is_active',
      header: m.is_active(),
      renderer: 'status',
      rendererConfig: {
        variantMapper: (isActive: WarehouseBin['is_active']) => (isActive ? 'active' : 'neutral'),
        labelMapper: (isActive: WarehouseBin['is_active']) => (isActive ? m.is_active() : '–'),
      },
    },
    {
      header: '',
      renderer: 'actions',
      rendererConfig: {
        actions: [
          createArchiveAction({
            apiUrl: (bin) =>
              `/legal-entities/${legalEntity?.id}/warehouses/${warehouseId}/zones/${zoneId}/bins/${bin.id}`,
            confirmMessage: (bin) => m.archive_bin_confirmation({ name: bin.code }),
            successMessage: (bin) => m.bin_archived_success({ name: bin.code }),
            errorMessage: m.bin_archive_error(),
          }),
        ],
      },
      meta: { cellClassName: 'p-0 h-10 w-12' },
    },
  ]

  const binsApiUrl = $derived(
    legalEntity?.id && warehouseId && zoneId
      ? `/legal-entities/${legalEntity.id}/warehouses/${warehouseId}/zones/${zoneId}/bins`
      : null,
  )
  const fetchBins = $derived(binsApiUrl ? createApiFetcher<WarehouseBin>(binsApiUrl) : null)
</script>

{#if legalEntity && fetchBins}
  <ResourceTable {columns} fetchFunction={fetchBins} {filters} />
{/if}
