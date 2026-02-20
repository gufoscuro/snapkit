<script lang="ts">
  import type { SnippetProps } from '$utils/runtime'

  const props: SnippetProps = $props()
</script>

<div class="flex h-screen items-center justify-center font-semibold">
  {props.pageDetails.config.title || 'No content'}
</div>
