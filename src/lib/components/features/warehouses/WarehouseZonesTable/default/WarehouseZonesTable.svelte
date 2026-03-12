<!--
  @component WarehouseZonesTable
  @description Displays a paginated table of warehouse zones with load more functionality.
  Shows zone code, description, and type.
  Consumes filter state from page context to filter displayed data.
  @keywords warehouse, zones, table, list, pagination, load-more, filters, settings
  @uses ResourceTable
  @api GET /api/legal-entities/{legalEntity}/warehouses/{warehouse}/zones (Moddo API) -> WarehouseZone[]
  @api DELETE /api/legal-entities/{legalEntity}/warehouses/{warehouse}/zones/{zone} (Moddo API)
-->
<script lang="ts" module>
  export { WarehouseZonesTableContract as contract } from './WarehouseZonesTable.contract.js'
</script>

<script lang="ts">
  import { page } from '$app/state'
  import { ResourceTable } from '$lib/components/core/ResourceTable'
  import type { ColumnConfig } from '$lib/components/core/ResourceTable/types'
  import { useConsumes } from '$lib/contexts/page-state'
  import * as m from '$lib/paraglide/messages.js'
  import type { WarehouseZone } from '$lib/types/api-types'
  import { getZoneTypeLabel } from '$lib/utils/enum-labels'
  import type { FilterQuery } from '$lib/utils/filters'
  import { createArchiveAction } from '$lib/utils/table-actions'
  import { createApiFetcher } from '$lib/utils/table-fetchers'
  import type { SnippetProps } from '$utils/runtime'
  import { WarehouseZonesTableContract } from './WarehouseZonesTable.contract.js'

  let { legalEntity }: SnippetProps = $props()

  const warehouseId = $derived(page.params.uuid)

  const filtersHandle = useConsumes(WarehouseZonesTableContract, 'filters')
  const filters = $derived(filtersHandle.get() as FilterQuery | undefined)

  const columns: ColumnConfig<WarehouseZone>[] = [
    {
      accessorKey: 'code',
      header: m.code(),
      renderer: 'link',
      rendererConfig: {
        urlBuilder: (row) => `/settings/warehouses/upsert/${warehouseId}/zones/upsert/${row.id}`,
      },
    },
    {
      accessorKey: 'description',
      header: m.description(),
      renderer: 'text',
    },
    {
      accessorKey: 'zone_type',
      header: m.zone_type(),
      renderer: 'text',
      rendererConfig: {
        valueAccessor: (row) => getZoneTypeLabel(row.zone_type),
      },
    },
    {
      header: '',
      renderer: 'actions',
      rendererConfig: {
        actions: [
          createArchiveAction({
            apiUrl: (zone) => `/legal-entities/${legalEntity?.id}/warehouses/${warehouseId}/zones/${zone.id}`,
            confirmMessage: (zone) => m.archive_zone_confirmation({ name: zone.description }),
            successMessage: (zone) => m.zone_archived_success({ name: zone.description }),
            errorMessage: m.zone_archive_error(),
          }),
        ],
      },
      meta: { cellClassName: 'p-0 h-10 w-12' },
    },
  ]

  const zonesApiUrl = $derived(
    legalEntity?.id && warehouseId
      ? `/legal-entities/${legalEntity.id}/warehouses/${warehouseId}/zones`
      : null,
  )
  const fetchZones = $derived(zonesApiUrl ? createApiFetcher<WarehouseZone>(zonesApiUrl) : null)
</script>

{#if legalEntity && fetchZones}
  <ResourceTable {columns} fetchFunction={fetchZones} {filters} />
{/if}
