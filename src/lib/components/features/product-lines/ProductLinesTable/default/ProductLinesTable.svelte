<!--
  @component ProductLinesTable
  @description Displays a paginated table of product lines with load more functionality.
  Shows product line code, name, description, and active status.
  Consumes filter state from page context to filter displayed data.
  @keywords product-lines, table, list, pagination, load-more, filters, settings
  @uses ResourceTable
  @api GET /api/legal-entities/{legalEntity}/product-lines (Moddo API) -> ProductLine[]
  @api DELETE /api/legal-entities/{legalEntity}/product-lines/{productLine} (Moddo API)
-->
<script lang="ts" module>
  export { ProductLinesTableContract as contract } from './ProductLinesTable.contract.js'
</script>

<script lang="ts">
  import { ResourceTable } from '$lib/components/core/ResourceTable'
  import type { ColumnConfig } from '$lib/components/core/ResourceTable/types'
  import { useConsumes } from '$lib/contexts/page-state'
  import * as m from '$lib/paraglide/messages.js'
  import type { ProductLine } from '$lib/types/api-types'
  import type { FilterQuery } from '$lib/utils/filters'
  import { createArchiveAction } from '$lib/utils/table-actions'
  import { createApiFetcher } from '$lib/utils/table-fetchers'
  import type { SnippetProps } from '$utils/runtime'
  import { ProductLinesTableContract } from './ProductLinesTable.contract.js'

  let { legalEntity }: SnippetProps = $props()

  const filtersHandle = useConsumes(ProductLinesTableContract, 'filters')
  const filters = $derived(filtersHandle.get() as FilterQuery | undefined)

  const columns: ColumnConfig<ProductLine>[] = [
    {
      accessorKey: 'code',
      header: m.code(),
      renderer: 'link',
      rendererConfig: {
        urlBuilder: (row) => `/settings/product-lines/upsert/${row.id}`,
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
        variantMapper: (isActive: ProductLine['is_active']) => isActive ? 'active' : 'neutral',
        labelMapper: (isActive: ProductLine['is_active']) => isActive ? m.active() : m.inactive(),
      },
    },
    {
      header: '',
      renderer: 'actions',
      rendererConfig: {
        actions: [
          createArchiveAction({
            apiUrl: line => `/legal-entities/${legalEntity?.id}/product-lines/${line.id}`,
            confirmMessage: line => m.archive_product_line_confirmation({ name: line.name }),
            successMessage: line => m.product_line_archived_success({ name: line.name }),
            errorMessage: m.product_line_archive_error(),
          }),
        ],
      },
      meta: { cellClassName: 'p-0 h-10 w-12' },
    },
  ]

  const productLinesApiUrl = $derived(
    legalEntity?.id ? `/legal-entities/${legalEntity.id}/product-lines` : null
  )
  const fetchProductLines = $derived(
    productLinesApiUrl ? createApiFetcher<ProductLine>(productLinesApiUrl) : null
  )
</script>

{#if legalEntity && fetchProductLines}
  <ResourceTable {columns} fetchFunction={fetchProductLines} {filters} />
{/if}
