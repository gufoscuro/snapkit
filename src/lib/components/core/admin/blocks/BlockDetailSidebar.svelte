<!--
	@component BlockDetailSidebar
	@description Detail view of a selected block in the sidebar
	@keywords admin, blocks, sidebar, detail
-->
<script lang="ts">
  import { goto } from '$app/navigation'
  import { adminBlocksRoute } from '$lib/admin/routes'
  import { adminStore } from '$lib/admin/stores/admin-store.svelte'
  import type { BlockConfig } from '$lib/admin/types'
  import { formatBlockName } from '$lib/admin/utils'
  import { Badge } from '$lib/components/ui/badge'
  import { Button } from '$lib/components/ui/button'
  import * as Sidebar from '$lib/components/ui/sidebar'
  import ArrowLeft from '@lucide/svelte/icons/arrow-left'

  interface Props {
    block: BlockConfig
  }

  const { block }: Props = $props()

  function goBack() {
    adminStore.clearSelection()
    goto(adminBlocksRoute())
  }
</script>

<Sidebar.Group>
  <Sidebar.GroupLabel class="mb-2">
    <Button variant="ghost" size="icon" class="h-8 w-8" onclick={goBack}>
      <ArrowLeft class="size-4" />
    </Button>
  </Sidebar.GroupLabel>
  <Sidebar.GroupContent class="space-y-4 p-4">
    <div>
      <h3 class="truncate text-lg font-semibold">{formatBlockName(block.name)}</h3>
      {#if block.description}
        <p class="mt-1 text-sm text-muted-foreground">{block.description}</p>
      {/if}
    </div>

    {#if block.folder}
      <div>
        <div class="mb-1 text-xs font-medium text-muted-foreground">Folder</div>
        <Badge variant="secondary">{block.folder}</Badge>
      </div>
    {/if}

    {#if block.tags && block.tags.length > 0}
      <div>
        <div class="mb-1 text-xs font-medium text-muted-foreground">Tags</div>
        <div class="flex flex-wrap gap-1">
          {#each block.tags as tag}
            <Badge variant="outline" class="text-xs">{tag}</Badge>
          {/each}
        </div>
      </div>
    {/if}

    <div>
      <div class="mb-1 text-xs font-medium text-muted-foreground">Component</div>
      <code class="block rounded bg-muted px-2 py-1 text-xs break-all">{block.snippet.componentKey}</code>
    </div>

    <div class="space-y-3 border-t pt-2">
      <div>
        <div class="mb-1 text-xs font-medium text-muted-foreground">Created</div>
        <div class="text-xs text-muted-foreground">
          {new Date(block.createdAt).toLocaleDateString()}
        </div>
      </div>

      <div>
        <div class="mb-1 text-xs font-medium text-muted-foreground">Last Updated</div>
        <div class="text-xs text-muted-foreground">
          {new Date(block.updatedAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  </Sidebar.GroupContent>
</Sidebar.Group>
