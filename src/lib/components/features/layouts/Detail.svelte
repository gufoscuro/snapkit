<script lang="ts">
  import SnippetResolver from '$components/runtime/SnippetResolver.svelte'
  import type { SnippetProps } from '$utils/runtime'

  const { pageDetails }: SnippetProps = $props()
  const { config } = $derived(pageDetails)
</script>

<SnippetResolver snippet={config.snippets.appHeader} />
<main class="flex-1 overflow-y-auto px-4">
  <SnippetResolver snippet={config.snippets.detail} />
</main>
