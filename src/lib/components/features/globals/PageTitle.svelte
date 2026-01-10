<script lang="ts">
  import type { SnippetProps } from '$utils/runtime'

  const { pageDetails }: SnippetProps = $props()
</script>

<div class="pt-4">
  <h2 class="text-xl font-semibold">{pageDetails.config.title}</h2>
</div>
