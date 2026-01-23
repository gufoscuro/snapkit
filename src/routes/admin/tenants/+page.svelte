<script lang="ts">
  import { goto } from '$app/navigation'
  import { adminTenantUpsertRoute } from '$lib/admin/routes'
  import { adminStore } from '$lib/admin/store.svelte'
  import { Button } from '$lib/components/ui/button'
  import * as Table from '$lib/components/ui/table'
  import Pencil from '@lucide/svelte/icons/pencil'
  import Plus from '@lucide/svelte/icons/plus'

  function handleAddTenant() {
    // Navigate to the "new" tenant page - tenant will only be created when user saves
    goto(adminTenantUpsertRoute('new'))
  }

  // Helper function to count pages and menus for a tenant
  function getPagesCount(tenantId: string): number {
    return adminStore.state.pages.filter(p => p.tenantId === tenantId).length
  }

  function getMenusCount(tenantId: string): number {
    return adminStore.state.menus.filter(m => m.tenantId === tenantId).length
  }
</script>

<div class="flex h-full flex-col">
  <div class="flex items-center justify-between p-4">
    <div>
      <h1 class="text-2xl font-medium">Tenants</h1>
      <p class="text-sm text-muted-foreground">Configure tenant settings and menu assignments</p>
    </div>
    <Button onclick={handleAddTenant}>
      <Plus class="mr-2 size-4" />
      Add Tenant
    </Button>
  </div>

  <div class="flex-1 overflow-auto p-4">
    {#if adminStore.state.tenants.length === 0}
      <div class="flex h-full items-center justify-center">
        <div class="text-center">
          <p class="mb-4 text-muted-foreground">No tenants configured yet.</p>
          <Button onclick={handleAddTenant}>
            <Plus class="mr-2 size-4" />
            Create your first tenant
          </Button>
        </div>
      </div>
    {:else}
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.Head>Name</Table.Head>
            <Table.Head>Vanity</Table.Head>
            <Table.Head class="text-center">Pages</Table.Head>
            <Table.Head class="text-center">Menus</Table.Head>
            <Table.Head class="w-20"></Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {#each adminStore.state.tenants as tenant (tenant.id)}
            <Table.Row class="cursor-pointer" onclick={() => goto(adminTenantUpsertRoute(tenant.id))}>
              <Table.Cell class="font-medium">{tenant.name}</Table.Cell>
              <Table.Cell class="text-muted-foreground">{tenant.vanity}</Table.Cell>
              <Table.Cell class="text-center">{getPagesCount(tenant.id)}</Table.Cell>
              <Table.Cell class="text-center">{getMenusCount(tenant.id)}</Table.Cell>
              <Table.Cell>
                <Button variant="ghost" size="icon" class="size-8">
                  <Pencil class="size-4" />
                </Button>
              </Table.Cell>
            </Table.Row>
          {/each}
        </Table.Body>
      </Table.Root>
    {/if}
  </div>
</div>
