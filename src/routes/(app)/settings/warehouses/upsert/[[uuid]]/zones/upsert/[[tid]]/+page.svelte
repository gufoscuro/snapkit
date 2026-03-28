<script lang="ts">
  import { page } from '$app/state'
  import SettingsHeader from '$components/features/globals/SettingsHeader.svelte'
  import { WarehouseZoneDetails } from '$lib/components/features/warehouses/WarehouseZoneDetails'
  import { getPageState } from '$lib/contexts/page-state'
  import * as m from '$lib/paraglide/messages'
  import { getBreadcrumbLabels } from '$lib/utils/breadcrumb-title'
  import type { LegalEntityWarehouse } from '$lib/types/api-types'
  import { WAREHOUSE_CONTEXT_KEY } from '$utils/runtime'
  import { getContext } from 'svelte'
  import type { PageProps } from './$types'

  const PAGE_ID = 'settings-warehouse-zone-details'

  const { data }: PageProps = $props()
  const pageState = getPageState()

  const warehouseId = $derived(page.params.uuid)
  const tid = $derived(page.params.tid)

  const getWarehouse = getContext<() => LegalEntityWarehouse | null>(WAREHOUSE_CONTEXT_KEY)
  const warehouseName = $derived(getWarehouse?.()?.code ?? m.warehouse())

  const breadcrumbLabels = $derived(getBreadcrumbLabels(pageState))
  const breadcrumbLabel = $derived(breadcrumbLabels[PAGE_ID] ?? m.new_zone())
</script>

<SettingsHeader
  legalEntityName={data.legalEntity?.name}
  breadcrumbs={[
    { label: m.warehouse(), href: '/settings/warehouses' },
    { label: warehouseName, href: `/settings/warehouses/upsert/${warehouseId}` },
    { label: m.zones(), href: `/settings/warehouses/upsert/${warehouseId}/zones` },
    { label: breadcrumbLabel },
  ]} />

<div class="flex flex-1 flex-col gap-4 p-4">
  <WarehouseZoneDetails legalEntity={data.legalEntity} {warehouseId} {tid} pageId={PAGE_ID} />
</div>
