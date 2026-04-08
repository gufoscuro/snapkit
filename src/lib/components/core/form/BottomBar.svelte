<!--
  @component BottomBar
  @description Fixed bottom action bar for detail forms. Renders children in a right-aligned row.
  @keywords bottom, bar, actions, form
-->
<script lang="ts">
  import type { Snippet } from 'svelte'

  let { children, class: className = '' }: { children: Snippet; class?: string } = $props()
</script>

<div
  class="fixed right-0 bottom-0 flex h-14 w-full items-center justify-end gap-2 bg-background/5 px-4 backdrop-blur-sm {className}">
  {@render children()}
</div>
