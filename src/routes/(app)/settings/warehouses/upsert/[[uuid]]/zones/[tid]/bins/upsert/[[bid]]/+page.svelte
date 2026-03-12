<script lang="ts">
  import { page } from '$app/state'
  import SettingsHeader from '$components/features/globals/SettingsHeader.svelte'
  import { WarehouseBinDetails } from '$lib/components/features/warehouses/WarehouseBinDetails'
  import { getPageState } from '$lib/contexts/page-state'
  import * as m from '$lib/paraglide/messages'
  import type { LegalEntityWarehouse, WarehouseZone } from '$lib/types/api-types'
  import { WAREHOUSE_CONTEXT_KEY, ZONE_CONTEXT_KEY } from '$utils/runtime'
  import { getContext } from 'svelte'
  import type { PageProps } from './$types'

  const { data }: PageProps = $props()
  const pageState = getPageState()

  const warehouseId = $derived(page.params.uuid)
  const zoneId = $derived(page.params.tid)
  const bid = $derived(page.params.bid)

  const getWarehouse = getContext<() => LegalEntityWarehouse | null>(WAREHOUSE_CONTEXT_KEY)
  const warehouseName = $derived(getWarehouse?.()?.name ?? m.warehouse())

  const getZone = getContext<() => WarehouseZone | null>(ZONE_CONTEXT_KEY)
  const zoneName = $derived(getZone?.()?.description ?? m.zone())

  const recordTitle = $derived(pageState.get<string>('__breadcrumb_title'))
  const breadcrumbLabel = $derived(recordTitle ?? m.new_bin())
</script>

<SettingsHeader
  legalEntityName={data.legalEntity?.name}
  breadcrumbs={[
    { label: m.warehouse(), href: '/settings/warehouses' },
    { label: warehouseName, href: `/settings/warehouses/upsert/${warehouseId}` },
    { label: m.zones(), href: `/settings/warehouses/upsert/${warehouseId}/zones` },
    { label: zoneName, href: `/settings/warehouses/upsert/${warehouseId}/zones/upsert/${zoneId}` },
    { label: m.bins(), href: `/settings/warehouses/upsert/${warehouseId}/zones/${zoneId}/bins` },
    { label: breadcrumbLabel },
  ]} />

<div class="flex flex-1 flex-col gap-4 p-4">
  <WarehouseBinDetails legalEntity={data.legalEntity} {warehouseId} {zoneId} {bid} />
</div>
