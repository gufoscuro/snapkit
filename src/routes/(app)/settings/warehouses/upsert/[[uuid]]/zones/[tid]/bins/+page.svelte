<script lang="ts">
  import { page } from '$app/state'
  import SettingsHeader from '$components/features/globals/SettingsHeader.svelte'
  import WarehouseBinsFilters from '$lib/components/features/common/Filters/WarehouseBinsFilters.svelte'
  import { WarehouseBinsTable } from '$lib/components/features/warehouses/WarehouseBinsTable'
  import { setSnippetBindings } from '$lib/contexts/page-state'
  import * as m from '$lib/paraglide/messages'
  import type { LegalEntityWarehouse, WarehouseZone } from '$lib/types/api-types'
  import {
    SNIPPET_PROPS_CONTEXT_KEY,
    WAREHOUSE_CONTEXT_KEY,
    ZONE_CONTEXT_KEY,
    type SnippetPropsGetter,
  } from '$utils/runtime'
  import { getContext } from 'svelte'
  import type { PageProps } from './$types'

  const { data }: PageProps = $props()
  const uuid = $derived(page.params.uuid)
  const tid = $derived(page.params.tid)

  const getSnippetProps = getContext<SnippetPropsGetter>(SNIPPET_PROPS_CONTEXT_KEY)
  const snippetProps = $derived(getSnippetProps())

  const getWarehouse = getContext<() => LegalEntityWarehouse | null>(WAREHOUSE_CONTEXT_KEY)
  const warehouseName = $derived(getWarehouse?.()?.code ?? m.warehouse())

  const getZone = getContext<() => WarehouseZone | null>(ZONE_CONTEXT_KEY)
  const zoneName = $derived(getZone?.()?.description ?? m.zone())

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
    { label: m.zones(), href: `/settings/warehouses/upsert/${uuid}/zones` },
    { label: zoneName, href: `/settings/warehouses/upsert/${uuid}/zones/upsert/${tid}` },
    { label: m.bins() },
  ]} />

<div class="flex flex-1 flex-col gap-4 p-4">
  <WarehouseBinsFilters {...snippetProps} />
  <WarehouseBinsTable {...snippetProps} />
</div>
