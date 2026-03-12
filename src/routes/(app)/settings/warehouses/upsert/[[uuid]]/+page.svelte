<script lang="ts">
  import { page } from '$app/state'
  import SettingsHeader from '$components/features/globals/SettingsHeader.svelte'
  import { WarehouseDetails } from '$lib/components/features/warehouses/WarehouseDetails'
  import { getPageState } from '$lib/contexts/page-state'
  import * as m from '$lib/paraglide/messages'
  import type { PageProps } from './$types'

  const { data }: PageProps = $props()
  const pageState = getPageState()

  const uuid = $derived(page.params.uuid)
  const recordTitle = $derived(pageState.get<string>('__breadcrumb_title'))
  const breadcrumbLabel = $derived(recordTitle ?? (uuid ? m.warehouse() : m.new_warehouse()))
</script>

<SettingsHeader
  legalEntityName={data.legalEntity?.name}
  breadcrumbs={[
    { label: m.warehouse(), href: '/settings/warehouses' },
    { label: breadcrumbLabel },
  ]} />

<div class="flex flex-1 flex-col gap-4 p-4">
  <WarehouseDetails legalEntity={data.legalEntity} {uuid} />
</div>
