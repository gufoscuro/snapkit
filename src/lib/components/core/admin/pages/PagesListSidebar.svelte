<!--
	@component PagesListSidebar
	@description List of pages in the sidebar
	@keywords admin, pages, sidebar, list
-->
<script lang="ts">
  import { goto } from '$app/navigation'
  import { page } from '$app/state'
  import { adminDashboardRoute, adminPageUpsertRoute, isRouteActive } from '$lib/admin/routes'
  import { adminStore } from '$lib/admin/stores/admin-store.svelte'
  import type { BuilderPageConfig } from '$lib/admin/types'
  import { Button } from '$lib/components/ui/button'
  import * as Sidebar from '$lib/components/ui/sidebar'
  import ArrowLeft from '@lucide/svelte/icons/arrow-left'
  import { FileText } from 'lucide-svelte'

  function selectPage(selectedPage: BuilderPageConfig) {
    adminStore.selectPage(selectedPage.$id)
    goto(adminPageUpsertRoute(selectedPage.$id))
  }

  function goBack() {
    goto(adminDashboardRoute())
  }

  // Show only pages from the currently selected tenant
  const currentTenantPages = $derived(adminStore.currentTenantPages)
</script>

<Sidebar.Group>
  <Sidebar.GroupLabel class="mb-2">
    <Button variant="ghost" size="icon" class="h-8 w-8" onclick={goBack}>
      <ArrowLeft class="size-4" />
    </Button>
  </Sidebar.GroupLabel>
  <Sidebar.GroupContent>
    {#if currentTenantPages.length === 0}
      <div class="px-3 py-2 text-sm text-muted-foreground">No pages available</div>
    {:else}
      <Sidebar.Menu>
        {#each currentTenantPages as p (p.$id)}
          <Sidebar.MenuItem>
            <Sidebar.MenuButton
              isActive={isRouteActive(page.url.pathname, adminPageUpsertRoute(p.$id))}
              onclick={() => selectPage(p)}>
              <FileText class="size-4" />
              <span class="truncate">{p.title}</span>
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>
        {/each}
      </Sidebar.Menu>
    {/if}
  </Sidebar.GroupContent>
</Sidebar.Group>
