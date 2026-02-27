<!--
/**
 * @description Left Sidebar layout component that renders a page with filters and table sections
 */
-->

<script lang="ts" module>
  import type { LayoutSlotDefinition } from '$lib/types/layout'

  export const slots: LayoutSlotDefinition[] = [
    { name: 'sidebar', label: 'Sidebar', description: 'Left sidebar section' },
    { name: 'header', label: 'Main content header', description: 'Header section for the main content area' },
    { name: 'filters', label: 'Filters', description: 'Filters section for the main content area' },
    { name: 'content', label: 'Main content', description: 'Main content area for the page' },
    { name: 'footer', label: 'Main content footer', description: 'Footer section for the main content area' },
  ]
</script>

<script lang="ts">
  import Breadcrumbs from '$components/features/globals/Breadcrumbs.svelte'
  import SnippetResolver from '$components/runtime/SnippetResolver.svelte'
  import * as Sidebar from '$components/ui/sidebar'
  import type { SnippetProps } from '$utils/runtime'

  const snippetProps: SnippetProps = $props()
  const { config } = $derived(snippetProps.pageDetails)
</script>

<Sidebar.Provider>
  <div class="flex h-screen w-full overflow-hidden">
    <SnippetResolver snippet={config.snippets.sidebar} />

    <div class="flex h-screen flex-1 flex-col overflow-y-scroll" data-scrollable-content>
      <SnippetResolver snippet={config.snippets.header} class="h-10 w-full">
        {#snippet fallback(snippetProps)}
          <Breadcrumbs {...snippetProps} />
        {/snippet}
      </SnippetResolver>

      <main class="flex flex-1 flex-col gap-4 p-4">
        <SnippetResolver snippet={config.snippets.filters} class="h-10 w-full" />
        <SnippetResolver snippet={config.snippets.content} class="h-dvh w-full" />
      </main>

      {#if config.snippets.footer}
        <footer class="h-14 w-full">
          <SnippetResolver snippet={config.snippets.footer} class="w-full" />
        </footer>
      {/if}
    </div>
  </div>
</Sidebar.Provider>
