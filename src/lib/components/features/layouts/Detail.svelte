<script lang="ts">
  import SnippetResolver from '$components/runtime/SnippetResolver.svelte'
  import type { SnippetProps } from '$utils/runtime'

  type ListLayoutProps = SnippetProps & {}

  const { pageDetails }: ListLayoutProps = $props()
  const { config } = $derived(pageDetails)
</script>

<SnippetResolver snippet={config.snippets.appHeader} />
<main class="flex-1 overflow-y-auto px-4">
  <pre class="py-4">{JSON.stringify(pageDetails.params, null, 2)}</pre>
</main>
