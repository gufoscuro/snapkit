<script lang="ts">
  import type { SnippetProps } from '$utils/runtime'

  const { tenantInterfaceDetails }: SnippetProps = $props()
</script>

<div class="sticky top-0 flex h-14 w-full items-center justify-between gap-3 border-b bg-background px-4">
  <div class="font-semibold">{tenantInterfaceDetails.name}</div>

  <div class="flex items-center gap-2">
    {#each tenantInterfaceDetails.mainMenu as menuItem}
      <a class="cursor-pointer rounded px-3 py-1 hover:bg-muted/70" href={menuItem.href}>{menuItem.label}</a>
    {/each}
  </div>
</div>
