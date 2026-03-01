<!--
  @component ProductFamiliesFilters
  @description A search filter component that provides filter state to sibling components.
  Positioned on the right side with a search input field and an "Add" button.
  Provides filter state consumable by ProductFamiliesTable.
  @keywords filter, search, product-families, settings
  @uses GenericFilters
  @provides filters
-->

<script lang="ts" module>
  export { GenericFiltersContract as contract } from '../GenericFilters/default/GenericFilters.contract.js'
</script>

<script lang="ts">
  import GenericFilters from '$components/features/common/GenericFilters/default/GenericFilters.svelte'
  import Button from '$components/ui/button/button.svelte'
  import * as m from '$lib/paraglide/messages'
  import type { SnippetProps } from '$utils/runtime'

  const props: SnippetProps = $props()
</script>

<GenericFilters {...props}>
  <Button variant="default" href="/settings/product-families/upsert">
    {m.add_new_product_family()}
  </Button>
</GenericFilters>
