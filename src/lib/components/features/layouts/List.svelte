<!--
/**
 * @description List layout component that renders a page with filters and table sections
 */
-->

<script lang="ts">
  import AppHeader from '$components/features/globals/AppHeader.svelte'
  import SnippetResolver from '$components/runtime/SnippetResolver.svelte'
  import type { SnippetProps } from '$utils/runtime'

  type ListLayoutProps = SnippetProps & {}

  const { pageDetails }: ListLayoutProps = $props()
  const { config } = $derived(pageDetails)

  $inspect('list layout', config.snippets)
</script>

<AppHeader />

<main class="flex-1 overflow-y-auto px-4">
  <SnippetResolver snippet={config.snippets.title} props={{ pageDetails }} class="h-11 w-full" />
  <SnippetResolver snippet={config.snippets.filters} props={{ pageDetails }} class="h-10 w-full" />
  <SnippetResolver snippet={config.snippets.table} props={{ pageDetails }} class="h-dvh w-full" />
</main>
