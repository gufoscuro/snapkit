<!--
	@component TenantEditor
	@description Editor for configuring tenant settings
	@keywords admin, tenant, editor, configuration
-->
<script lang="ts">
  import { goto } from '$app/navigation'
  import { adminTenantsRoute } from '$lib/admin/routes'
  import { saveAdminConfig } from '$lib/admin/save'
  import { adminStore } from '$lib/admin/store.svelte'
  import type { TenantConfig } from '$lib/admin/types'
  import { Button } from '$lib/components/ui/button'
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card'
  import { confirmDelete } from '$lib/components/ui/confirm-delete-dialog/confirm-delete-dialog.svelte'
  import { Input } from '$lib/components/ui/input'
  import { Label } from '$lib/components/ui/label'
  import Save from '@lucide/svelte/icons/save'
  import Trash2 from '@lucide/svelte/icons/trash-2'
  import { toast } from 'svelte-sonner'

  interface Props {
    tenant: TenantConfig
  }

  const { tenant }: Props = $props()

  let isSaving = $state(false)

  // Derived values for read-only display
  const pagesForThisTenant = $derived(adminStore.state.pages.filter(p => p.tenantId === tenant.id))
  const menusForThisTenant = $derived(adminStore.state.menus.filter(m => m.tenantId === tenant.id))

  function handleNameChange(e: Event) {
    adminStore.updateTenant(tenant.id, { name: (e.target as HTMLInputElement).value })
  }

  function handleVanityChange(e: Event) {
    adminStore.updateTenant(tenant.id, { vanity: (e.target as HTMLInputElement).value })
  }

  function handleDeleteTenant() {
    const tenantName = tenant.name // Capture name before deletion
    confirmDelete({
      title: 'Delete Tenant',
      description: `Are you sure you want to delete "${tenantName}"? This action cannot be undone. All associated pages and menus will remain but will no longer be tied to this tenant.`,
      confirm: {
        text: 'Delete Tenant',
      },
      onConfirm: async () => {
        adminStore.deleteTenant(tenant.id)
        toast.success(`Tenant "${tenantName}" deleted successfully`)
        goto(adminTenantsRoute())
      },
    })
  }

  async function handleSave() {
    isSaving = true
    const result = await saveAdminConfig()
    if (result.success) {
      toast.success(result.message)
    } else {
      toast.error(result.message)
    }
    isSaving = false
  }
</script>

<div class="space-y-6">
  <Card>
    <CardHeader>
      <div class="flex items-center justify-between">
        <CardTitle>Tenant Settings</CardTitle>
        <div class="flex gap-2">
          <Button variant="destructive" size="sm" onclick={handleDeleteTenant}>
            <Trash2 class="mr-2 size-4" />
            Delete Tenant
          </Button>
          <Button size="sm" onclick={handleSave} disabled={isSaving}>
            <Save class="mr-2 size-4" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </CardHeader>
    <CardContent class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-2">
          <Label for="tenant-name">Display Name</Label>
          <Input id="tenant-name" value={tenant.name} oninput={handleNameChange} placeholder="Tenant Name" />
        </div>
        <div class="space-y-2">
          <Label for="tenant-id">Tenant ID</Label>
          <Input id="tenant-id" value={tenant.id} disabled class="bg-muted" />
        </div>
      </div>
      <div class="space-y-2">
        <Label for="tenant-vanity">Vanity URL (subdomain)</Label>
        <Input id="tenant-vanity" value={tenant.vanity} oninput={handleVanityChange} placeholder="tenant-subdomain" />
        <p class="text-xs text-muted-foreground">
          This will be used as the subdomain: <code>{tenant.vanity || 'example'}.yourdomain.com</code>
        </p>
      </div>
    </CardContent>
  </Card>

  <Card>
    <CardHeader>
      <CardTitle>Associated Pages & Menus</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="space-y-4">
        <div>
          <p class="mb-2 text-sm font-medium">Pages</p>
          {#if pagesForThisTenant.length === 0}
            <p class="text-sm text-muted-foreground">No pages associated with this tenant.</p>
          {:else}
            <div class="space-y-1">
              {#each pagesForThisTenant as page (page.$id)}
                <div class="rounded-md border p-2">
                  <div class="text-sm font-medium">{page.title}</div>
                  <div class="text-xs text-muted-foreground">{page.route}</div>
                </div>
              {/each}
            </div>
          {/if}
        </div>

        <div>
          <p class="mb-2 text-sm font-medium">Menus</p>
          {#if menusForThisTenant.length === 0}
            <p class="text-sm text-muted-foreground">No menus associated with this tenant.</p>
          {:else}
            <div class="space-y-1">
              {#each menusForThisTenant as menu (menu.id)}
                <div class="rounded-md border p-2">
                  <div class="text-sm font-medium">{menu.name}</div>
                  <div class="text-xs text-muted-foreground">{menu.items.length} items</div>
                </div>
              {/each}
            </div>
          {/if}
        </div>

        <p class="text-xs text-muted-foreground">
          To manage pages and menus, select this tenant from the dropdown above and navigate to the respective sections.
        </p>
      </div>
    </CardContent>
  </Card>
</div>
