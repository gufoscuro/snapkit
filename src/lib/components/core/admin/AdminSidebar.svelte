<!--
	@component AdminSidebar
	@description Sidebar navigation for admin panel
	@keywords admin, sidebar, navigation
-->
<script lang="ts">
  import { page } from '$app/state'
  import { adminDashboardRoute, adminMenusRoute, adminPagesRoute, isRouteActive } from '$lib/admin/routes'
  import FileText from '@lucide/svelte/icons/file-text'
  import Menu from '@lucide/svelte/icons/menu'

  const navItems = [
    { href: adminMenusRoute(), label: 'Menus', icon: Menu },
    { href: adminPagesRoute(), label: 'Pages', icon: FileText },
  ]
</script>

<aside class="flex h-full w-64 flex-col border-r bg-white">
  <div class="flex h-14 items-center border-b px-4">
    <a href={adminDashboardRoute()} class="flex items-center gap-2 font-semibold">
      <span>Admin Panel</span>
    </a>
  </div>

  <nav class="flex-1 space-y-1 overflow-auto p-2">
    {#each navItems as item (item.href)}
      <a
        href={item.href}
        class="flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors {isRouteActive(
          page.url.pathname,
          item.href,
        )
          ? 'bg-accent font-medium text-accent-foreground'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}">
        <svelte:component this={item.icon} class="size-4" />
        {item.label}
      </a>
    {/each}
  </nav>
</aside>
