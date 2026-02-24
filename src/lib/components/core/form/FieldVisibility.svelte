<script lang="ts">
  import type { SnippetProps } from '$utils/runtime'
  import type { Snippet } from 'svelte'

  const {
    name,
    hidden = false,
    entityConfig,
    children,
  }: SnippetProps & {
    name: string
    hidden?: boolean
    children?: Snippet
  } = $props()
  $inspect('props', entityConfig, 'name', name)
</script>

{#if !hidden}
  {@render children?.()}
{/if}
