<script lang="ts">
  import { page } from '$app/state'
  import WarehouseSidebar from '$components/features/globals/sidebars/WarehouseSidebar.svelte'
  import * as Sidebar from '$components/ui/sidebar'
  import { initPageState } from '$lib/contexts/page-state'
  import type { LegalEntityWarehouse } from '$lib/types/api-types'
  import { api } from '$lib/utils/request'
  import type { PageDetails } from '$utils/page-registry.js'
  import {
    SNIPPET_PROPS_CONTEXT_KEY,
    WAREHOUSE_CONTEXT_KEY,
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

  setContext(WAREHOUSE_CONTEXT_KEY, () => warehouse)

  onMount(async () => {
    const uuid = page.params.uuid
    const legalEntityId = legalEntity?.id
    if (uuid && legalEntityId) {
      const { data: warehouseData } = await api.safe.get<LegalEntityWarehouse>(
        `/legal-entities/${legalEntityId}/warehouses/${uuid}`,
      )
      warehouse = warehouseData || null
    }
  })
</script>

<Sidebar.Provider>
  <div class="flex h-screen w-full overflow-hidden">
    <WarehouseSidebar {...data} {...{ pageDetails, routeDetails }} {warehouse} />

    <main class="flex h-screen flex-1 flex-col overflow-y-scroll" data-scrollable-content>
      {@render children?.()}
    </main>
  </div>
</Sidebar.Provider>
