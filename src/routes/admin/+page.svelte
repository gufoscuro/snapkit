<script lang="ts">
  import { adminMenusRoute, adminPagesRoute } from '$lib/admin/routes'
  import { adminStore } from '$lib/admin/store.svelte'
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card'
  import FileText from '@lucide/svelte/icons/file-text'
  import Menu from '@lucide/svelte/icons/menu'

  const selectedTenant = $derived(adminStore.selectedTenant)
  const pagesCount = $derived(adminStore.currentTenantPages.length)
  const menusCount = $derived(adminStore.currentTenantMenus.length)
  const tenantsCount = $derived(adminStore.state.tenants.length)
</script>

<div class="space-y-6">
  <div>
    <h1 class="text-3xl font-medium tracking-tight">Admin Dashboard</h1>
    <p class="text-muted-foreground">
      {#if selectedTenant}
        Managing <strong>{selectedTenant.name}</strong>
      {:else}
        Select a tenant to start managing pages and menus
      {/if}
    </p>
  </div>

  <div class="grid gap-4 md:grid-cols-3">
    <a href={adminMenusRoute()} class="block">
      <Card class="transition-colors hover:bg-accent/50">
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Menus</CardTitle>
          <Menu class="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-medium">{menusCount}</div>
          <p class="text-xs text-muted-foreground">
            {selectedTenant ? `In ${selectedTenant.name}` : 'Select a tenant'}
          </p>
        </CardContent>
      </Card>
    </a>

    <a href={adminPagesRoute()} class="block">
      <Card class="transition-colors hover:bg-accent/50">
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Pages</CardTitle>
          <FileText class="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-medium">{pagesCount}</div>
          <p class="text-xs text-muted-foreground">
            {selectedTenant ? `In ${selectedTenant.name}` : 'Select a tenant'}
          </p>
        </CardContent>
      </Card>
    </a>
  </div>
</div>
