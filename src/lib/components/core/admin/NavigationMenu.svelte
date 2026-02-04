<!--
	@component NavigationMenu
	@description Navigation menu for the admin sidebar
	@keywords admin, sidebar, navigation, menu
-->
<script lang="ts">
  import { goto } from '$app/navigation'
  import { page } from '$app/state'
  import { adminBlocksRoute, adminMenusRoute, adminPagesRoute, isRouteActive } from '$lib/admin/routes'
  import { adminStore } from '$lib/admin/stores/admin-store.svelte'
  import * as Sidebar from '$lib/components/ui/sidebar'
  import FileText from '@lucide/svelte/icons/file-text'
  import Menu from '@lucide/svelte/icons/menu'
  import { Cuboid } from 'lucide-svelte'

  function navigateTo(route: string) {
    adminStore.clearSelection()
    goto(route)
  }
</script>

<Sidebar.Group>
  <Sidebar.GroupContent>
    <Sidebar.Menu>
      <!-- Pages -->
      <Sidebar.MenuItem>
        <Sidebar.MenuButton
          isActive={isRouteActive(page.url.pathname, adminPagesRoute())}
          onclick={() => navigateTo(adminPagesRoute())}>
          <FileText class="size-4" />
          <span>Pages</span>
        </Sidebar.MenuButton>
      </Sidebar.MenuItem>

      <!-- Blocks -->
      <Sidebar.MenuItem>
        <Sidebar.MenuButton
          isActive={isRouteActive(page.url.pathname, adminBlocksRoute())}
          onclick={() => navigateTo(adminBlocksRoute())}>
          <Cuboid class="size-4" />
          <span>Blocks</span>
        </Sidebar.MenuButton>
      </Sidebar.MenuItem>

      <!-- Menus -->
      <Sidebar.MenuItem>
        <Sidebar.MenuButton
          isActive={isRouteActive(page.url.pathname, adminMenusRoute())}
          onclick={() => navigateTo(adminMenusRoute())}>
          <Menu class="size-4" />
          <span>Menus</span>
        </Sidebar.MenuButton>
      </Sidebar.MenuItem>
    </Sidebar.Menu>
  </Sidebar.GroupContent>
</Sidebar.Group>
