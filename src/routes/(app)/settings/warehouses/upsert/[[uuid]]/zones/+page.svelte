<script lang="ts">
  import { page } from '$app/state'
  import SettingsHeader from '$components/features/globals/SettingsHeader.svelte'
  import WarehouseZonesFilters from '$lib/components/features/common/Filters/WarehouseZonesFilters.svelte'
  import { WarehouseZonesTable } from '$lib/components/features/warehouses/WarehouseZonesTable'
  import { setSnippetBindings } from '$lib/contexts/page-state'
  import * as m from '$lib/paraglide/messages'
  import type { LegalEntityWarehouse } from '$lib/types/api-types'
  import { SNIPPET_PROPS_CONTEXT_KEY, WAREHOUSE_CONTEXT_KEY, type SnippetPropsGetter } from '$utils/runtime'
  import { getContext } from 'svelte'
  import type { PageProps } from './$types'

  const { data }: PageProps = $props()
  const uuid = $derived(page.params.uuid)

  const getSnippetProps = getContext<SnippetPropsGetter>(SNIPPET_PROPS_CONTEXT_KEY)
  const snippetProps = $derived(getSnippetProps())

  const getWarehouse = getContext<() => LegalEntityWarehouse | null>(WAREHOUSE_CONTEXT_KEY)
  const warehouseName = $derived(getWarehouse?.()?.code ?? m.warehouse())

  setSnippetBindings({
    provides: { filters: 'filters' },
    consumes: { filters: 'filters' },
  })
</script>

<SettingsHeader
  legalEntityName={data.legalEntity?.name}
  breadcrumbs={[
    { label: m.warehouse(), href: '/settings/warehouses' },
    { label: warehouseName, href: `/settings/warehouses/upsert/${uuid}` },
    { label: m.zones() },
  ]} />

<div class="flex flex-1 flex-col gap-4 p-4">
  <WarehouseZonesFilters {...snippetProps} />
  <WarehouseZonesTable {...snippetProps} />
</div>
