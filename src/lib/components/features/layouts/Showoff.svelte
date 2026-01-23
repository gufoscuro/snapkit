<!--
/**
 * @description Showoff layout component that renders a page with a title and a central component to showcase content
 */
-->

<script lang="ts" module>
  import type { LayoutSlotDefinition } from '$lib/admin/types'

  export const slots: LayoutSlotDefinition[] = [
    { name: 'title', label: 'Title', description: 'Page title component' },
    { name: 'target', label: 'Target', description: 'Main showcase component' },
  ]
</script>

<script lang="ts">
  import AppHeader from '$components/features/globals/AppHeader.svelte'
  import SnippetResolver from '$components/runtime/SnippetResolver.svelte'
  import type { SnippetProps } from '$utils/runtime'

  type ShowoffLayoutProps = SnippetProps & {}

  const { pageDetails }: ShowoffLayoutProps = $props()
  const { config } = $derived(pageDetails)
</script>

<AppHeader />

<main class="flex flex-1 flex-col gap-4 px-4">
  <SnippetResolver snippet={config.snippets.title} class="h-11 w-full" />
  <div class="flex flex-1 items-center justify-center">
    <SnippetResolver snippet={config.snippets.target} />
  </div>
</main>
