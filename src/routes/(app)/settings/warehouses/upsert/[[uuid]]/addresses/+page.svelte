<script lang="ts">
  import { page } from '$app/state'
  import SettingsHeader from '$components/features/globals/SettingsHeader.svelte'
  import { WarehouseAddressDetails } from '$lib/components/features/warehouses/WarehouseAddressDetails'
  import * as m from '$lib/paraglide/messages'
  import type { LegalEntityWarehouse } from '$lib/types/api-types'
  import { WAREHOUSE_CONTEXT_KEY } from '$utils/runtime'
  import { getContext } from 'svelte'
  import type { PageProps } from './$types'

  const { data }: PageProps = $props()
  const uuid = $derived(page.params.uuid)

  const getWarehouse = getContext<() => LegalEntityWarehouse | null>(WAREHOUSE_CONTEXT_KEY)
  const warehouseName = $derived(getWarehouse?.()?.code ?? m.warehouse())
</script>

<SettingsHeader
  legalEntityName={data.legalEntity?.name}
  breadcrumbs={[
    { label: m.warehouse(), href: '/settings/warehouses' },
    { label: warehouseName, href: `/settings/warehouses/upsert/${uuid}` },
    { label: m.addresses() },
  ]} />

<div class="flex flex-1 flex-col gap-4 p-4">
  <WarehouseAddressDetails legalEntity={data.legalEntity} warehouseId={uuid} />
</div>
