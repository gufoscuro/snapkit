<!--
	@component PagesListSidebar
	@description Hierarchical list of pages in the sidebar with tree view
	@keywords admin, pages, sidebar, list, tree, hierarchy
-->
<script lang="ts">
  import { goto } from '$app/navigation'
  import { adminDashboardRoute } from '$lib/admin/routes'
  import { adminStore } from '$lib/admin/stores/admin-store.svelte'
  import { Button } from '$lib/components/ui/button'
  import * as Sidebar from '$lib/components/ui/sidebar'
  import ArrowLeft from '@lucide/svelte/icons/arrow-left'
  import PageTreeNode from './PageTreeNode.svelte'

  function goBack() {
    goto(adminDashboardRoute())
  }

  // Get all pages for the current tenant
  const currentTenantPages = $derived(adminStore.currentTenantPages)

  // Filter to get only root pages (no parentId)
  const rootPages = $derived(currentTenantPages.filter((p) => !p.parentId))
</script>

<Sidebar.Group>
  <Sidebar.GroupLabel class="mb-2">
    <Button variant="ghost" size="icon" class="h-8 w-8" onclick={goBack}>
      <ArrowLeft class="size-4" />
    </Button>
  </Sidebar.GroupLabel>
  <Sidebar.GroupContent>
    {#if rootPages.length === 0}
      <div class="px-3 py-2 text-sm text-muted-foreground">No pages available</div>
    {:else}
      <div class="flex flex-col gap-0.5">
        {#each rootPages as page (page.$id)}
          <PageTreeNode {page} />
        {/each}
      </div>
    {/if}
  </Sidebar.GroupContent>
</Sidebar.Group>
