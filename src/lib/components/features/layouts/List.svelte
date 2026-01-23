<!--
/**
 * @description List layout component that renders a page with filters and table sections
 */
-->

<script lang="ts" module>
  import type { LayoutSlotDefinition } from '$lib/admin/types'

  export const slots: LayoutSlotDefinition[] = [
    { name: 'title', label: 'Title', description: 'Page title component' },
    { name: 'filters', label: 'Filters', description: 'Filter controls for the list' },
    { name: 'table', label: 'Table', description: 'Main data table/list component' },
  ]
</script>

<script lang="ts">
  import AppHeader from '$components/features/globals/AppHeader.svelte'
  import SnippetResolver from '$components/runtime/SnippetResolver.svelte'
  import type { SnippetProps } from '$utils/runtime'

  type ListLayoutProps = SnippetProps & {}

  const { pageDetails }: ListLayoutProps = $props()
  const { config } = $derived(pageDetails)
</script>

<AppHeader />

<main class="flex-1 space-y-8 overflow-y-auto px-4">
  <SnippetResolver snippet={config.snippets.title} class="h-11 w-full" />
  <SnippetResolver snippet={config.snippets.filters} class="h-10 w-full" />
  <SnippetResolver snippet={config.snippets.table} class="h-dvh w-full" />
</main>
