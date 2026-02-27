<!--
  @component Form layout component that renders a page with a form
  @description 
-->
<script lang="ts" module>
  import type { LayoutSlotDefinition } from '$lib/types/layout'

  export const slots: LayoutSlotDefinition[] = [
    { name: 'appHeader', label: 'App Header', description: 'Top application header/navigation' },
    { name: 'form', label: 'Form', description: 'Main form component' },
  ]
</script>

<script lang="ts">
  import SnippetResolver from '$components/runtime/SnippetResolver.svelte'
  import type { SnippetProps } from '$utils/runtime'

  const { pageDetails }: SnippetProps = $props()
  const { config } = $derived(pageDetails)
</script>

<SnippetResolver snippet={config.snippets.appHeader} />
<main class="flex-1 px-4">
  <SnippetResolver snippet={config.snippets.form} />
</main>
