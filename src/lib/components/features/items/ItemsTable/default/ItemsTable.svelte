<!--
  @component ItemsTable
  @description Displays a paginated table of items with load more functionality.
  Shows item code (linked to details), name, category, status, primary UoM and product family.
  Consumes filter state from page context to filter displayed data.
  @keywords items, table, list, pagination, load-more, filters
  @uses ResourceTable
  @api GET /api/legal-entities/{legalEntity}/items (Moddo API) -> Item[]
  @api DELETE /api/legal-entities/{legalEntity}/items/{item} (Moddo API)
  @route item-details
-->
<script lang="ts" module>
  // eslint-disable-next-line no-import-assign
  export { ItemsTableContract as contract } from './ItemsTable.contract.js'
</script>

<script lang="ts">
  import { ResourceTable } from '$lib/components/core/ResourceTable'
  import type { ColumnConfig } from '$lib/components/core/ResourceTable/types'
  import { useConsumes } from '$lib/contexts/page-state'
  import * as m from '$lib/paraglide/messages.js'
  import type { Item } from '$lib/types/api-types'
  import { getItemCategoryLabel, getItemStatusLabel } from '$lib/utils/enum-labels'
  import type { FilterQuery } from '$lib/utils/filters'
  import { createArchiveAction } from '$lib/utils/table-actions'
  import { createApiFetcher } from '$lib/utils/table-fetchers'
  import { createRoute } from '$utils/route-builder.js'
  import type { SnippetProps } from '$utils/runtime'
  import { ItemsTableContract } from './ItemsTable.contract.js'

  let { legalEntity }: SnippetProps = $props()

  const filtersHandle = useConsumes(ItemsTableContract, 'filters')
  const filters = $derived(filtersHandle.get() as FilterQuery | undefined)

  const columns: ColumnConfig<Item>[] = [
    {
      accessorKey: 'code',
      header: m.code(),
      renderer: 'link',
      rendererConfig: {
        urlBuilder: row => createRoute({ $id: 'item-details', params: { uuid: row.id } }),
      },
    },
    {
      accessorKey: 'name',
      header: m.name(),
      renderer: 'text',
    },
    {
      accessorKey: 'item_category',
      header: m.item_category(),
      renderer: 'badge',
      rendererConfig: {
        variantMapper: () => 'outline',
        labelMapper: (category: Item['item_category']) => getItemCategoryLabel(category),
      },
    },
    {
      accessorKey: 'item_status',
      header: m.status(),
      renderer: 'status',
      rendererConfig: {
        variantMapper: (status: Item['item_status']) => {
          if (status === 'active') return 'active'
          if (status === 'inactive') return 'paused'
          return 'neutral'
        },
        labelMapper: (status: Item['item_status']) => getItemStatusLabel(status),
      },
    },
    {
      header: '',
      renderer: 'actions',
      rendererConfig: {
        actions: [
          createArchiveAction({
            apiUrl: item => `/legal-entities/${legalEntity?.id}/items/${item.id}`,
            confirmMessage: item => m.archive_item_confirmation({ name: item.name }),
            successMessage: item => m.item_archived_success({ name: item.name }),
            errorMessage: m.item_archive_error(),
          }),
        ],
      },
      meta: { cellClassName: 'p-0 h-10 w-12' },
    },
  ]

  // Two-step derivation: string equality on the URL prevents spurious function recreation
  // when legalEntity is a new object reference but the ID hasn't changed.
  const itemApiUrl = $derived(legalEntity?.id ? `/legal-entities/${legalEntity.id}/items` : null)
  const fetchItems = $derived(itemApiUrl ? createApiFetcher<Item>(itemApiUrl) : null)
</script>

{#if legalEntity && fetchItems}
  <ResourceTable {columns} fetchFunction={fetchItems} {filters} />
{/if}
