<!--
  @component CommodityCodesTable
  @description Displays a paginated table of commodity codes with load more functionality.
  Shows commodity code, name, description, and active status.
  Consumes filter state from page context to filter displayed data.
  @keywords commodity-codes, table, list, pagination, load-more, filters, settings
  @uses ResourceTable
  @api GET /api/legal-entities/{legalEntity}/commodity-codes (Moddo API) -> CommodityCode[]
  @api DELETE /api/legal-entities/{legalEntity}/commodity-codes/{commodityCode} (Moddo API)
-->
<script lang="ts" module>
  export { CommodityCodesTableContract as contract } from './CommodityCodesTable.contract.js'
</script>

<script lang="ts">
  import { ResourceTable } from '$lib/components/core/ResourceTable'
  import type { ColumnConfig } from '$lib/components/core/ResourceTable/types'
  import { useConsumes } from '$lib/contexts/page-state'
  import * as m from '$lib/paraglide/messages.js'
  import type { CommodityCode } from '$lib/types/api-types'
  import type { FilterQuery } from '$lib/utils/filters'
  import { createArchiveAction } from '$lib/utils/table-actions'
  import { createApiFetcher } from '$lib/utils/table-fetchers'
  import type { SnippetProps } from '$utils/runtime'
  import { CommodityCodesTableContract } from './CommodityCodesTable.contract.js'

  let { legalEntity }: SnippetProps = $props()

  const filtersHandle = useConsumes(CommodityCodesTableContract, 'filters')
  const filters = $derived(filtersHandle.get() as FilterQuery | undefined)

  const columns: ColumnConfig<CommodityCode>[] = [
    {
      accessorKey: 'code',
      header: m.code(),
      renderer: 'link',
      rendererConfig: {
        urlBuilder: (row) => `/settings/commodity-codes/upsert/${row.id}`,
      },
    },
    {
      accessorKey: 'name',
      header: m.name(),
      renderer: 'text',
    },
    {
      accessorKey: 'description',
      header: m.description(),
      renderer: 'text',
    },
    {
      accessorKey: 'is_active',
      header: m.status(),
      renderer: 'status',
      rendererConfig: {
        variantMapper: (isActive: CommodityCode['is_active']) => isActive ? 'active' : 'neutral',
        labelMapper: (isActive: CommodityCode['is_active']) => isActive ? m.active() : m.inactive(),
      },
    },
    {
      header: '',
      renderer: 'actions',
      rendererConfig: {
        actions: [
          createArchiveAction({
            apiUrl: code => `/legal-entities/${legalEntity?.id}/commodity-codes/${code.id}`,
            confirmMessage: code => m.archive_commodity_code_confirmation({ name: code.name }),
            successMessage: code => m.commodity_code_archived_success({ name: code.name }),
            errorMessage: m.commodity_code_archive_error(),
          }),
        ],
      },
      meta: { cellClassName: 'p-0 h-10 w-12' },
    },
  ]

  const commodityCodesApiUrl = $derived(
    legalEntity?.id ? `/legal-entities/${legalEntity.id}/commodity-codes` : null
  )
  const fetchCommodityCodes = $derived(
    commodityCodesApiUrl ? createApiFetcher<CommodityCode>(commodityCodesApiUrl) : null
  )
</script>

{#if legalEntity && fetchCommodityCodes}
  <ResourceTable {columns} fetchFunction={fetchCommodityCodes} {filters} />
{/if}
