<!--
	@component AdminLayout
	@description Main layout for the admin panel with sidebar navigation and header
	@keywords admin, layout, sidebar, navigation, dashboard
-->
<script lang="ts">
  import { page } from '$app/state'
  import { getSidebarContextFromRoute, isBlocksListPage, isPagesListPage } from '$lib/admin/routes'
  import { adminStore } from '$lib/admin/stores/admin-store.svelte'
  import ConfirmDeleteDialog from '$lib/components/ui/confirm-delete-dialog/confirm-delete-dialog.svelte'
  import * as Sidebar from '$lib/components/ui/sidebar'
  import type { JWTUser } from '$lib/server/auth'
  import type { Snippet } from 'svelte'
  import AdminHeader from './AdminHeader.svelte'
  import AdminSidebar from './AdminSidebar.svelte'

  interface Props {
    user: JWTUser
    children: Snippet
  }

  const { user, children }: Props = $props()

  // Sync sidebar context and selection with current route
  $effect(() => {
    const path = page.url.pathname
    const context = getSidebarContextFromRoute(path)

    if (context) {
      adminStore.setSidebarContext(context)
    }

    // Clear selection if we're on blocks list page
    if (isBlocksListPage(path) && adminStore.state.selection.type === 'block') {
      adminStore.clearSelection()
    }

    // Clear selection if we're on pages list page
    if (isPagesListPage(path) && adminStore.state.selection.type === 'page') {
      adminStore.clearSelection()
    }
  })
  // $inspect(adminStore.state)
</script>

<Sidebar.Provider>
  <div class="flex h-screen w-full overflow-hidden">
    <AdminSidebar {user} />
    <div class="flex flex-1 flex-col overflow-hidden">
      <AdminHeader {user} />
      <main class="flex-1 overflow-auto bg-gray-50 p-6">
        {@render children()}
      </main>
    </div>
  </div>
</Sidebar.Provider>

<!-- Global confirm delete dialog -->
<ConfirmDeleteDialog />
