<script lang="ts">
  import { goto } from '$app/navigation'
  import { adminMenuUpsertRoute } from '$lib/admin/routes'
  import { adminStore } from '$lib/admin/stores/admin-store.svelte'
  import { Button } from '$lib/components/ui/button'
  import * as Table from '$lib/components/ui/table'
  import Pencil from '@lucide/svelte/icons/pencil'
  import Plus from '@lucide/svelte/icons/plus'
  import { toast } from 'svelte-sonner'

  const menus = $derived(adminStore.currentTenantMenus)
  const selectedTenant = $derived(adminStore.selectedTenant)

  function handleAddMenu() {
    if (!selectedTenant) {
      toast.error('Please select a tenant first')
      return
    }
    try {
      const newMenu = adminStore.addMenu()
      goto(adminMenuUpsertRoute(newMenu.id))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create menu')
    }
  }
</script>

<div class="flex h-full flex-col">
  <div class="flex items-center justify-between p-4">
    <div>
      <h1 class="text-2xl font-medium">Menus</h1>
    </div>
    <Button onclick={handleAddMenu} disabled={!selectedTenant}>
      <Plus class="mr-2 size-4" />
      Add Menu
    </Button>
  </div>

  <div class="flex-1 overflow-auto p-4">
    {#if !selectedTenant}
      <!-- Empty state: no tenant selected -->
      <div class="flex h-full items-center justify-center">
        <div class="text-center">
          <p class="text-muted-foreground">Select a tenant from the dropdown above to view and manage menus.</p>
        </div>
      </div>
    {:else if menus.length === 0}
      <!-- Empty state: tenant selected but no menus -->
      <div class="flex h-full items-center justify-center">
        <div class="text-center">
          <p class="mb-4 text-muted-foreground">No menus for this tenant yet.</p>
          <Button onclick={handleAddMenu}>
            <Plus class="mr-2 size-4" />
            Create your first menu
          </Button>
        </div>
      </div>
    {:else}
      <!-- Table with tenant-filtered menus -->
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.Head>Name</Table.Head>
            <Table.Head class="text-center">Items</Table.Head>
            <Table.Head>Preview</Table.Head>
            <Table.Head class="w-20"></Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {#each menus as menu (menu.id)}
            <Table.Row class="cursor-pointer" onclick={() => goto(adminMenuUpsertRoute(menu.id))}>
              <Table.Cell class="font-medium">{menu.name}</Table.Cell>
              <Table.Cell class="text-center">{menu.items.length}</Table.Cell>
              <Table.Cell class="max-w-xs truncate text-muted-foreground">
                {menu.items.length > 0 ? menu.items.map(i => i.label).join(', ') : '-'}
              </Table.Cell>
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
