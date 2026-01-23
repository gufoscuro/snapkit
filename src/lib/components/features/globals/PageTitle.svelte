<script lang="ts">
  import { getI18nLabel } from '$utils/i18n'
  import type { SnippetProps } from '$utils/runtime'

  const { pageDetails }: SnippetProps = $props()
</script>

<div class="pt-4">
  <h2 class="text-xl font-semibold">{getI18nLabel(pageDetails.config.title)}</h2>
</div>
