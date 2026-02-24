<!--
	@component LegalEntitySwitcher
	@description Dropdown to switch the active legal entity; persists the selection in a cookie
	@keywords sidebar, legal entity, switcher
-->
<script lang="ts">
  import { invalidateAll } from '$app/navigation'
  import Logo from '$components/icons/Logo.svelte'
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js'
  import * as Sidebar from '$lib/components/ui/sidebar/index.js'
  import { useSidebar } from '$lib/components/ui/sidebar/index.js'
  import { LEGAL_ENTITY_COOKIE_NAME } from '$lib/fixtures/constants'
  import { legal_entities } from '$lib/paraglide/messages'
  import type { LegalEntity } from '$lib/types/api-types'
  import type { SnippetProps } from '$utils/runtime'
  import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down'

  const { user, legalEntity }: SnippetProps = $props()
  const entities = $derived(user?.tenant?.legal_entities || [])
  const sidebar = useSidebar()

  // Local override: ID selected by the user during this session
  // null = follow the authoritative legalEntity from the layout
  let selectedEntityId = $state<string | null>(null)

  // Always derived so it reacts to prop changes after invalidateAll()
  const activeEntity = $derived<LegalEntity | undefined>(
    (selectedEntityId ? entities.find(e => e.id === selectedEntityId) : null) ?? legalEntity ?? entities[0],
  )

  // Sync cookie on mount (or whenever activeEntity changes) without triggering a reload.
  // The server already served the correct entity, so we just need the cookie to stay fresh.
  $effect(() => {
    const id = activeEntity?.id
    if (!id) return

    const existing = document.cookie
      .split('; ')
      .find(row => row.startsWith(`${LEGAL_ENTITY_COOKIE_NAME}=`))
      ?.split('=')[1]

    if (existing !== id) {
      document.cookie = `${LEGAL_ENTITY_COOKIE_NAME}=${id}; path=/; SameSite=Lax`
    }
  })

  async function selectEntity(entity: LegalEntity) {
    if (entity.id === activeEntity?.id) return

    selectedEntityId = entity.id
    document.cookie = `${LEGAL_ENTITY_COOKIE_NAME}=${entity.id}; path=/; SameSite=Lax`
    await invalidateAll()
  }
</script>

<Sidebar.Menu>
  <Sidebar.MenuItem>
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        {#snippet child({ props })}
          <Sidebar.MenuButton
            {...props}
            size="lg"
            class="pl-0 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
            <div class="flex size-8 shrink-0 items-center justify-center">
              <Logo class="size-5 shrink-0 text-brand" />
            </div>
            <div class="grid flex-1 text-start text-sm leading-tight">
              <span class="truncate font-medium">
                {activeEntity?.name}
              </span>
            </div>
            <ChevronsUpDownIcon class="ms-auto" />
          </Sidebar.MenuButton>
        {/snippet}
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        class="w-(--bits-dropdown-menu-anchor-width) min-w-56 rounded-lg"
        align="start"
        side={sidebar.isMobile ? 'bottom' : 'right'}
        sideOffset={4}>
        <DropdownMenu.Label class="text-xs text-muted-foreground">{legal_entities()}</DropdownMenu.Label>
        {#each entities as entity (entity.id)}
          <DropdownMenu.Item onSelect={() => selectEntity(entity)} class="gap-2 p-2">
            {entity.name}
          </DropdownMenu.Item>
        {/each}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  </Sidebar.MenuItem>
</Sidebar.Menu>
