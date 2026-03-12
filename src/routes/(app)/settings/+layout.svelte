<script lang="ts">
  import SettingsSidebar from '$components/features/globals/sidebars/SettingsSidebar.svelte'
  import * as Sidebar from '$components/ui/sidebar'
  import { initPageState } from '$lib/contexts/page-state'
  import type { PageDetails } from '$utils/page-registry.js'
  import { SNIPPET_PROPS_CONTEXT_KEY, type RouteDetails, type SnippetPropsGetter } from '$utils/runtime'
  import { setContext } from 'svelte'

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
</script>

<Sidebar.Provider>
  <div class="flex h-screen w-full overflow-hidden">
    <SettingsSidebar {...data} {...{ pageDetails, routeDetails }} />

    <main class="flex h-screen flex-1 flex-col overflow-y-scroll" data-scrollable-content>
      {@render children?.()}
    </main>
  </div>
</Sidebar.Provider>
