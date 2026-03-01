<script lang="ts">
  import SettingsSidebar from '$components/features/globals/sidebars/SettingsSidebar.svelte'
  import * as Sidebar from '$components/ui/sidebar'
  import { initPageState } from '$lib/contexts/page-state'
  import { SNIPPET_PROPS_CONTEXT_KEY, type SnippetPropsGetter } from '$utils/runtime'
  import { setContext } from 'svelte'
  import type { PageProps } from '../$types'

  let { data, children }: PageProps & { children?: () => any } = $props()
  let { pageDetails, routeDetails, entityConfig, legalEntity, user } = $derived(data)

  $inspect('data', data)

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
    <SettingsSidebar {...data} />

    <main class="flex h-screen flex-1 flex-col overflow-y-scroll" data-scrollable-content>
      {@render children?.()}
    </main>
  </div>
</Sidebar.Provider>
