<!--
  @component WarehouseBinsFilters
  @description A filter component that provides filter state to sibling components.
  Provides filter state consumable by WarehouseBinsTable.
  @keywords filter, bins, zone, warehouse, settings
  @uses GenericFilters
  @provides filters
-->

<script lang="ts" module>
  export { GenericFiltersContract as contract } from '../GenericFilters/default/GenericFilters.contract.js'
</script>

<script lang="ts">
  import { page } from '$app/state'
  import GenericFilters from '$components/features/common/GenericFilters/default/GenericFilters.svelte'
  import Button from '$components/ui/button/button.svelte'
  import * as m from '$lib/paraglide/messages'
  import type { SnippetProps } from '$utils/runtime'

  const props: SnippetProps = $props()
  const warehouseId = $derived(page.params.uuid)
  const zoneId = $derived(page.params.tid)
</script>

<GenericFilters {...props} hideSearch>
  <Button variant="default" href="/settings/warehouses/upsert/{warehouseId}/zones/{zoneId}/bins/upsert">
    {m.add_new_bin()}
  </Button>
</GenericFilters>
