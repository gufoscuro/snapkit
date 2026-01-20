<!--
/**
 * @description Showoff layout component that renders a page with a title and a central component to showcase content
 */
-->

<script lang="ts">
  import SnippetResolver from '$components/runtime/SnippetResolver.svelte'
  import type { SnippetProps } from '$utils/runtime'

  type ShowoffLayoutProps = SnippetProps & {}

  const { pageDetails }: ShowoffLayoutProps = $props()
  const { config } = $derived(pageDetails)
</script>

<SnippetResolver snippet={config.snippets.appHeader} />

<main class="flex flex-1 flex-col gap-4 px-4">
  <SnippetResolver snippet={config.snippets.title} class="h-11 w-full" />
  <div class="flex flex-1 items-center justify-center">
    <SnippetResolver snippet={config.snippets.target} />
  </div>
</main>
