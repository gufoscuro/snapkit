<script lang="ts" module>
  import type { LayoutSlotDefinition } from '$lib/admin/types'

  export const slots: LayoutSlotDefinition[] = []
</script>

<script lang="ts">
  import type { SnippetProps } from '$utils/runtime'

  type ListLayoutProps = SnippetProps & {}

  let { pageDetails }: ListLayoutProps = $props()
</script>

<main class="flex-1 overflow-y-auto px-4">
  <pre class="py-4">{JSON.stringify(pageDetails.params, null, 2)}</pre>
</main>
