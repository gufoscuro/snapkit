<!--
  @component PageTreeNode
  @description Recursive tree node for displaying pages with hierarchy
  @keywords admin, pages, tree, hierarchy, recursive
-->
<script lang="ts">
  import { goto } from '$app/navigation'
  import { page as pageStore } from '$app/stores'
  import { adminPageUpsertRoute, isRouteActive } from '$lib/admin/routes'
  import { adminStore } from '$lib/admin/stores/admin-store.svelte'
  import type { FlatBuilderPageConfig } from '$lib/admin/types'
  import * as ContextMenu from '$lib/components/ui/context-menu'
  import * as Collapsible from '$lib/components/ui/collapsible'
  import ChevronRight from '@lucide/svelte/icons/chevron-right'
  import FileText from '@lucide/svelte/icons/file-text'
  import { cn } from '$lib/utils'
  import PageContextMenuButton from './PageContextMenuButton.svelte'
  import PageContextMenuContent from './PageContextMenuContent.svelte'
  import { getChildPages } from '$lib/admin/page-hierarchy-utils'
  import Self from './PageTreeNode.svelte'

  interface Props {
    page: FlatBuilderPageConfig
    depth?: number
  }

  let { page, depth = 0 }: Props = $props()

  // Get children for this page
  const children = $derived(getChildPages(page.$id, adminStore.state.pages))
  const hasChildren = $derived(children.length > 0)

  // Check if this page is currently active
  const isActive = $derived(isRouteActive($pageStore.url.pathname, adminPageUpsertRoute(page.$id)))

  // Track open/closed state for folders
  let isOpen = $state(false)

  function navigateToPage() {
    adminStore.selectPage(page.$id)
    goto(adminPageUpsertRoute(page.$id))
  }

  function toggleOpen(e: MouseEvent) {
    e.stopPropagation()
    isOpen = !isOpen
  }
</script>

<ContextMenu.Root>
  <ContextMenu.Trigger class="block w-full">
    <div class="group">
      <!-- Page row -->
      <div
        class={cn(
          'flex items-center gap-2 rounded px-2 py-1.5 transition-colors hover:bg-sidebar-accent',
          isActive && 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'
        )}
      >
        <!-- Chevron button for expandable pages -->
        {#if hasChildren}
          <button
            onclick={toggleOpen}
            class="flex size-4 shrink-0 items-center justify-center transition-transform"
            class:rotate-90={isOpen}
          >
            <ChevronRight class="size-4" />
          </button>
        {:else}
          <div class="size-4 shrink-0"></div>
        {/if}

        <!-- Page icon -->
        <FileText class="size-4 shrink-0" />

        <!-- Page title (clickable) -->
        <button onclick={navigateToPage} class="flex-1 truncate text-left text-sm">
          {page.title}
        </button>

        <!-- Three-dot menu (always visible) -->
        <div class="shrink-0">
          <PageContextMenuButton {page} />
        </div>
      </div>

      <!-- Children (collapsible) -->
      {#if hasChildren}
        <Collapsible.Root bind:open={isOpen}>
          <Collapsible.Content class="ml-4 border-l pl-2">
            {#each children as child (child.$id)}
              <Self page={child} depth={depth + 1} />
            {/each}
          </Collapsible.Content>
        </Collapsible.Root>
      {/if}
    </div>
  </ContextMenu.Trigger>

  <!-- Context menu content -->
  <PageContextMenuContent {page} />
</ContextMenu.Root>
