<!--
/**
 * @description List layout component that renders a page with filters and table sections
 */
-->

<script lang="ts" module>
  import type { LayoutSlotDefinition } from '$lib/admin/types'

  export const slots: LayoutSlotDefinition[] = [
    { name: 'sidebarHeader', label: 'Sidebar Header', description: 'Left sidebar header section' },
    { name: 'sidebarContent', label: 'Sidebar Content', description: 'Left sidebar content section' },
    { name: 'sidebarFooter', label: 'Sidebar Footer', description: 'Left sidebar footer section' },
    { name: 'filters', label: 'Filters', description: 'Filter controls for the list' },
    { name: 'table', label: 'Table', description: 'Main data table/list component' },
  ]
</script>

<script lang="ts">
  import SnippetResolver from '$components/runtime/SnippetResolver.svelte'
  import * as Sidebar from '$lib/components/ui/sidebar'
  import type { SnippetProps } from '$utils/runtime'

  const snippetProps: SnippetProps = $props()
  const { config } = $derived(snippetProps.pageDetails)
</script>

<Sidebar.Provider>
  <div class="flex h-screen w-full overflow-hidden">
    <SnippetResolver snippet={config.snippets.sidebar} />
    <!-- <LeftSidebarWrapper>
      {#snippet header()}
        <SnippetResolver snippet={config.snippets.sidebarHeader} />
      {/snippet}

      {#snippet content()}
        <SnippetResolver snippet={config.snippets.sidebarContent} />
      {/snippet}

      {#snippet footer()}
        <SnippetResolver snippet={config.snippets.sidebarFooter} />
      {/snippet}
    </LeftSidebarWrapper> -->

    <div class="flex flex-1 flex-col overflow-hidden">
      <main class="flex-1 space-y-8 overflow-y-auto px-4 pb-4">
        <SnippetResolver snippet={config.snippets.filters} class="h-10 w-full" />
        <SnippetResolver snippet={config.snippets.table} class="h-dvh w-full" />
      </main>
    </div>
  </div>
</Sidebar.Provider>
