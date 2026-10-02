<!--
  @component TenantLegalEntitySelector
  @description Superadmin picker listing every tenant's legal entities, grouped by tenant.
  Never moves to another tenant's vanity origin: the choice is handed to the caller,
  which decides how to address that tenant from the current host.
  @keywords tenant, legal entity, selector, superadmin, shadow, impersonation
  @uses Popover, Command, Button
  @api GET /api/tenants -> Tenant[]
-->
<script lang="ts">
  import { Button } from '$components/ui/button'
  import * as Command from '$components/ui/command'
  import * as Popover from '$components/ui/popover'
  import * as m from '$lib/paraglide/messages'
  import type { LegalEntity, Tenant } from '$lib/types/api-types'
  import type { PaginatedResponse } from '$lib/utils/filters'
  import { apiRequest } from '$lib/utils/request'
  import { cn } from '$lib/utils.js'
  import BuildingIcon from '@lucide/svelte/icons/building'
  import CheckIcon from '@lucide/svelte/icons/check'
  import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down'

  type Props = {
    /** The entity currently being operated on. */
    selected?: LegalEntity | null
    /** Tenant uuid owning the current origin — decides same-tenant vs cross-tenant. */
    originTenantId?: string | null
    class?: string
    /** Called when picking an entity inside the current tenant (no origin change). */
    onChooseLocal?: (entity: LegalEntity) => void
    /** Called when picking an entity in another tenant (no origin change either). */
    onChooseRemote?: (tenant: Tenant, entity: LegalEntity) => void
  }

  let { selected = null, originTenantId = null, class: className = '', onChooseLocal, onChooseRemote }: Props = $props()

  let open = $state(false)
  let tenants = $state<Tenant[]>([])
  let loading = $state(false)
  let failed = $state(false)

  // Fetched on first open, not on mount: this is a superadmin affordance that most
  // sessions never touch, and the payload carries every tenant's entities.
  async function loadTenants() {
    if (tenants.length > 0 || loading) return
    loading = true
    failed = false
    try {
      const response = await apiRequest<PaginatedResponse<Tenant>>({ url: '/tenants' })
      tenants = response?.data ?? []
    } catch {
      failed = true
    } finally {
      loading = false
    }
  }

  function choose(tenant: Tenant, entity: LegalEntity) {
    open = false

    // Same tenant: the origin already names it, so this is just an entity switch —
    // no reload, no handoff.
    if (tenant.id === originTenantId) {
      onChooseLocal?.(entity)
      return
    }

    // Another tenant: vanity origins aren't reachable, so the caller addresses it
    // from here (e.g. the admin page's explicit target).
    onChooseRemote?.(tenant, entity)
  }
</script>

<Popover.Root bind:open onOpenChange={opened => opened && loadTenants()}>
  <Popover.Trigger>
    {#snippet child({ props })}
      <Button {...props} type="button" variant="outline" class={cn('justify-between gap-2', className)}>
        <span class="truncate">{selected?.name ?? m.select_legal_entity_placeholder()}</span>
        <ChevronsUpDownIcon class="size-4 shrink-0 opacity-50" />
      </Button>
    {/snippet}
  </Popover.Trigger>

  <Popover.Content class="w-96 p-0" align="end">
    <Command.Root>
      <Command.Input placeholder={m.tenant_selector_search()} />
      <Command.List class="max-h-80">
        {#if loading}
          <Command.Loading>{m.tenant_selector_loading()}</Command.Loading>
        {:else if failed}
          <div class="p-4 text-center text-sm text-muted-foreground">{m.tenant_selector_error()}</div>
        {:else}
          <Command.Empty>{m.no_legal_entities_found()}</Command.Empty>
          {#each tenants as tenant (tenant.id)}
            {@const entities = tenant.legal_entities ?? []}
            {#if entities.length > 0}
              <Command.Group heading={tenant.name}>
                {#each entities as entity (entity.id)}
                  <Command.Item
                    value="{tenant.name} {tenant.vanity} {entity.name}"
                    onSelect={() => choose(tenant, entity)}>
                    <BuildingIcon class="size-3.5 shrink-0 text-muted-foreground" />
                    <span class="truncate">{entity.name}</span>
                    {#if entity.id === selected?.id}
                      <CheckIcon class="ml-auto size-4 shrink-0" />
                    {:else if tenant.id !== originTenantId}
                      <span class="ml-auto shrink-0 text-xs text-muted-foreground">{tenant.vanity}</span>
                    {/if}
                  </Command.Item>
                {/each}
              </Command.Group>
            {/if}
          {/each}
        {/if}
      </Command.List>
    </Command.Root>
  </Popover.Content>
</Popover.Root>
