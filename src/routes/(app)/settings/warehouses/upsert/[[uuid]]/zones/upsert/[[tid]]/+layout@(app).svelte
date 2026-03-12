<script lang="ts">
  import { page } from '$app/state'
  import ZoneSidebar from '$components/features/globals/sidebars/ZoneSidebar.svelte'
  import * as Sidebar from '$components/ui/sidebar'
  import { initPageState } from '$lib/contexts/page-state'
  import type { LegalEntityWarehouse, WarehouseZone } from '$lib/types/api-types'
  import { api } from '$lib/utils/request'
  import type { PageDetails } from '$utils/page-registry.js'
  import {
    SNIPPET_PROPS_CONTEXT_KEY,
    WAREHOUSE_CONTEXT_KEY,
    ZONE_CONTEXT_KEY,
    type RouteDetails,
    type SnippetPropsGetter,
  } from '$utils/runtime'
  import { onMount, setContext } from 'svelte'

  let { data, children } = $props()
  let { entityConfig, legalEntity, user } = $derived(data)

  const pageDetails = {} as unknown as PageDetails
  const routeDetails = {} as unknown as RouteDetails

  initPageState()

  setContext<SnippetPropsGetter>(SNIPPET_PROPS_CONTEXT_KEY, () => ({
    pageDetails,
    routeDetails,
    entityConfig,
    legalEntity,
    user,
  }))

  let warehouse = $state<LegalEntityWarehouse | null>(null)
  let zone = $state<WarehouseZone | null>(null)

  setContext(WAREHOUSE_CONTEXT_KEY, () => warehouse)
  setContext(ZONE_CONTEXT_KEY, () => zone)

  onMount(async () => {
    const uuid = page.params.uuid
    const tid = page.params.tid
    const legalEntityId = legalEntity?.id
    if (!uuid || !legalEntityId) return

    const [warehouseResult, zoneResult] = await Promise.all([
      api.safe.get<LegalEntityWarehouse>(`/legal-entities/${legalEntityId}/warehouses/${uuid}`),
      tid
        ? api.safe.get<WarehouseZone>(
            `/legal-entities/${legalEntityId}/warehouses/${uuid}/zones/${tid}`,
          )
        : Promise.resolve({ data: null }),
    ])
    warehouse = warehouseResult.data || null
    zone = (zoneResult as { data: WarehouseZone | null }).data || null
  })
</script>

<Sidebar.Provider>
  <div class="flex h-screen w-full overflow-hidden">
    <ZoneSidebar {...data} {...{ pageDetails, routeDetails }} {zone} />

    <main class="flex h-screen flex-1 flex-col overflow-y-scroll" data-scrollable-content>
      {@render children?.()}
    </main>
  </div>
</Sidebar.Provider>
