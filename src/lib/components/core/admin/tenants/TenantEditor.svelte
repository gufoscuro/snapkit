<!--
	@component TenantEditor
	@description Editor for configuring tenant settings (create and edit modes)
	@keywords admin, tenant, editor, configuration
-->
<script lang="ts">
  import { goto } from '$app/navigation'
  import { adminTenantsRoute } from '$lib/admin/routes'
  import { saveAdminConfig } from '$lib/admin/save'
  import { adminStore } from '$lib/admin/stores/admin-store.svelte'
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
    /** Existing tenant for edit mode, or undefined for create mode */
    tenant?: TenantConfig
  }

  const { tenant }: Props = $props()

  // Determine if we're in create mode (no existing tenant)
  const isCreateMode = $derived(!tenant)

  // Generate a stable ID for new tenants (only once when component mounts in create mode)
  const generatedId = adminStore.createTenantConfig().id

  // Local state for the form - for create mode we use local state,
  // for edit mode we derive from the tenant prop
  let localName = $state('New Tenant')
  let localVanity = $state('new-tenant')
  const localId = $derived(tenant?.id ?? generatedId)

  // In edit mode, sync local state with tenant prop
  $effect(() => {
    if (tenant) {
      localName = tenant.name
      localVanity = tenant.vanity
    }
  })

  let isSaving = $state(false)

  // Derived values for read-only display (only relevant in edit mode)
  const pagesForThisTenant = $derived(tenant ? adminStore.state.pages.filter(p => p.tenantId === tenant.id) : [])
  const menusForThisTenant = $derived(tenant ? adminStore.state.menus.filter(m => m.tenantId === tenant.id) : [])

  function handleNameChange(e: Event) {
    const value = (e.target as HTMLInputElement).value
    localName = value
    // Only update store if editing existing tenant
    if (tenant) {
      adminStore.updateTenant(tenant.id, { name: value })
    }
  }

  function handleVanityChange(e: Event) {
    const value = (e.target as HTMLInputElement).value
    localVanity = value
    // Only update store if editing existing tenant
    if (tenant) {
      adminStore.updateTenant(tenant.id, { vanity: value })
    }
  }

  function handleDeleteTenant() {
    if (!tenant) return

    const tenantName = tenant.name
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

    // In create mode, add the tenant to the store first
    if (isCreateMode) {
      const newTenant: TenantConfig = {
        id: localId,
        name: localName,
        vanity: localVanity,
      }
      adminStore.addTenant(newTenant)
    }

    const result = await saveAdminConfig()
    if (result.success) {
      toast.success(result.message)
      // In create mode, navigate to the newly created tenant's edit page
      if (isCreateMode) {
        goto(adminTenantsRoute())
      }
    } else {
      // If save failed in create mode, remove the tenant we just added
      if (isCreateMode) {
        adminStore.deleteTenant(localId)
      }
      toast.error(result.message)
    }
    isSaving = false
  }
</script>

<div class="space-y-6">
  <Card>
    <CardHeader>
      <div class="flex items-center justify-between">
        <CardTitle>{isCreateMode ? 'Create Tenant' : 'Tenant Settings'}</CardTitle>
        <div class="flex gap-2">
          {#if !isCreateMode}
            <Button variant="destructive" size="sm" onclick={handleDeleteTenant}>
              <Trash2 class="mr-2 size-4" />
              Delete Tenant
            </Button>
          {/if}
          <Button size="sm" onclick={handleSave} disabled={isSaving}>
            <Save class="mr-2 size-4" />
            {isSaving ? 'Saving...' : isCreateMode ? 'Create' : 'Save'}
          </Button>
        </div>
      </div>
    </CardHeader>
    <CardContent class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-2">
          <Label for="tenant-name">Display Name</Label>
          <Input id="tenant-name" value={localName} oninput={handleNameChange} placeholder="Tenant Name" />
        </div>
        <div class="space-y-2">
          <Label for="tenant-id">Tenant ID</Label>
          <Input id="tenant-id" value={localId} disabled class="bg-muted" />
        </div>
      </div>
      <div class="space-y-2">
        <Label for="tenant-vanity">Vanity URL (subdomain)</Label>
        <Input id="tenant-vanity" value={localVanity} oninput={handleVanityChange} placeholder="tenant-subdomain" />
        <p class="text-xs text-muted-foreground">
          This will be used as the subdomain: <code>{localVanity || 'example'}.yourdomain.com</code>
        </p>
      </div>
    </CardContent>
  </Card>
</div>
