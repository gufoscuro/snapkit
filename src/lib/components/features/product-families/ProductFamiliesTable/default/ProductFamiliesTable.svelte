<!--
  @component ProductFamiliesTable
  @description Displays a paginated table of product families with load more functionality.
  Shows product family code, name, description, and active status.
  Consumes filter state from page context to filter displayed data.
  @keywords product-families, table, list, pagination, load-more, filters, settings
  @uses ResourceTable
  @api GET /api/legal-entities/{legalEntity}/product-families (Moddo API) -> ProductFamily[]
  @api DELETE /api/legal-entities/{legalEntity}/product-families/{productFamily} (Moddo API)
-->
<script lang="ts" module>
  export { ProductFamiliesTableContract as contract } from './ProductFamiliesTable.contract.js'
</script>

<script lang="ts">
  import { ResourceTable } from '$lib/components/core/ResourceTable'
  import type { ColumnConfig } from '$lib/components/core/ResourceTable/types'
  import { useConsumes } from '$lib/contexts/page-state'
  import * as m from '$lib/paraglide/messages.js'
  import type { ProductFamily } from '$lib/types/api-types'
  import type { FilterQuery } from '$lib/utils/filters'
  import { createArchiveAction } from '$lib/utils/table-actions'
  import { createApiFetcher } from '$lib/utils/table-fetchers'
  import type { SnippetProps } from '$utils/runtime'
  import { ProductFamiliesTableContract } from './ProductFamiliesTable.contract.js'

  let { legalEntity }: SnippetProps = $props()

  const filtersHandle = useConsumes(ProductFamiliesTableContract, 'filters')
  const filters = $derived(filtersHandle.get() as FilterQuery | undefined)

  const columns: ColumnConfig<ProductFamily>[] = [
    {
      accessorKey: 'code',
      header: m.code(),
      renderer: 'link',
      rendererConfig: {
        urlBuilder: (row) => `/settings/product-families/upsert/${row.id}`,
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
        variantMapper: (isActive: ProductFamily['is_active']) => isActive ? 'active' : 'neutral',
        labelMapper: (isActive: ProductFamily['is_active']) => isActive ? m.active() : m.inactive(),
      },
    },
    {
      header: '',
      renderer: 'actions',
      rendererConfig: {
        actions: [
          createArchiveAction({
            apiUrl: family => `/legal-entities/${legalEntity?.id}/product-families/${family.id}`,
            confirmMessage: family => m.archive_product_family_confirmation({ name: family.name }),
            successMessage: family => m.product_family_archived_success({ name: family.name }),
            errorMessage: m.product_family_archive_error(),
          }),
        ],
      },
      meta: { cellClassName: 'p-0 h-10 w-12' },
    },
  ]

  const productFamiliesApiUrl = $derived(
    legalEntity?.id ? `/legal-entities/${legalEntity.id}/product-families` : null
  )
  const fetchProductFamilies = $derived(
    productFamiliesApiUrl ? createApiFetcher<ProductFamily>(productFamiliesApiUrl) : null
  )
</script>

{#if legalEntity && fetchProductFamilies}
  <ResourceTable {columns} fetchFunction={fetchProductFamilies} {filters} />
{/if}
