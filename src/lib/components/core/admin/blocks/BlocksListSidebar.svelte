<!--
	@component BlocksListSidebar
	@description List of blocks in the sidebar
	@keywords admin, blocks, sidebar, list
-->
<script lang="ts">
  import { goto } from '$app/navigation'
  import { page } from '$app/state'
  import { adminBlockUpsertRoute, adminPagesRoute, isRouteActive } from '$lib/admin/routes'
  import { adminStore } from '$lib/admin/stores/admin-store.svelte'
  import type { BlockConfig } from '$lib/admin/types'
  import { formatBlockName } from '$lib/admin/utils'
  import { Button } from '$lib/components/ui/button'
  import * as Sidebar from '$lib/components/ui/sidebar'
  import ArrowLeft from '@lucide/svelte/icons/arrow-left'
  import { Cuboid } from 'lucide-svelte'

  interface Props {
    blocks: BlockConfig[]
  }

  const { blocks }: Props = $props()

  function selectBlock(block: BlockConfig) {
    adminStore.selectBlock(block.id)
    goto(adminBlockUpsertRoute(block.id))
  }

  function goBack() {
    goto(adminPagesRoute())
  }

  // Group blocks by folder
  const blocksByFolder = $derived(() => {
    const grouped = new Map<string, BlockConfig[]>()

    for (const block of blocks) {
      const folder = block.folder || 'Uncategorized'
      if (!grouped.has(folder)) {
        grouped.set(folder, [])
      }
      grouped.get(folder)!.push(block)
    }

    return grouped
  })
</script>

<Sidebar.Group>
  <Sidebar.GroupLabel class="mb-2">
    <Button variant="ghost" size="icon" class="h-8 w-8" onclick={goBack}>
      <ArrowLeft class="size-4" />
    </Button>
  </Sidebar.GroupLabel>
  <Sidebar.GroupContent>
    {#if blocks.length === 0}
      <div class="px-3 py-2 text-sm text-muted-foreground">No blocks available</div>
    {:else}
      {#each [...blocksByFolder()] as [folder, folderBlocks] (folder)}
        <div class="mb-4">
          <div class="px-3 py-1 text-xs font-medium text-muted-foreground">{folder}</div>
          <Sidebar.Menu>
            {#each folderBlocks as block (block.id)}
              <Sidebar.MenuItem>
                <Sidebar.MenuButton
                  isActive={isRouteActive(page.url.pathname, adminBlockUpsertRoute(block.id))}
                  onclick={() => selectBlock(block)}>
                  <Cuboid class="size-4" />
                  <span class="truncate">{formatBlockName(block.name)}</span>
                </Sidebar.MenuButton>
              </Sidebar.MenuItem>
            {/each}
          </Sidebar.Menu>
        </div>
      {/each}
    {/if}
  </Sidebar.GroupContent>
</Sidebar.Group>
