<script lang="ts">
  import { goto } from '$app/navigation'
  import { page } from '$app/state'
  import { adminTenantsRoute } from '$lib/admin/routes'
  import { adminStore } from '$lib/admin/store.svelte'
  import TenantEditor from '$lib/components/features/admin/tenants/TenantEditor.svelte'
  import { Button } from '$lib/components/ui/button'
  import ArrowLeft from '@lucide/svelte/icons/arrow-left'

  const tenantId = $derived(page.params.id)
  const isCreateMode = $derived(tenantId === 'new')
  const currentTenant = $derived(
    isCreateMode ? undefined : adminStore.state.tenants.find(t => t.id === tenantId)
  )
</script>

<div class="flex h-full flex-col">
  <div class="flex items-center gap-4 p-4">
    <Button variant="ghost" size="icon" onclick={() => goto(adminTenantsRoute())}>
      <ArrowLeft class="size-4" />
    </Button>
    <div>
      <h1 class="text-2xl font-bold">{isCreateMode ? 'New Tenant' : (currentTenant?.name ?? 'Tenant')}</h1>
      <p class="text-sm text-muted-foreground">{isCreateMode ? 'Create a new tenant' : 'Edit tenant configuration'}</p>
    </div>
  </div>

  <div class="flex-1 overflow-auto p-4">
    {#if isCreateMode}
      <TenantEditor />
    {:else if currentTenant}
      <TenantEditor tenant={currentTenant} />
    {:else}
      <div class="flex h-full items-center justify-center">
        <p class="text-muted-foreground">Tenant not found</p>
      </div>
    {/if}
  </div>
</div>
