<script lang="ts">
  import { browser } from '$app/environment'
  import { page } from '$app/state'
  import * as Collapsible from '$lib/components/ui/collapsible/index.js'
  import * as Sidebar from '$lib/components/ui/sidebar/index.js'
  import type { MenuItem } from '$lib/stores/tenant-config/types'
  import { getI18nLabel } from '$utils/i18n'
  import { createRoute } from '$utils/route-builder'
  import type { SnippetProps } from '$utils/runtime'
  import ChevronRightIcon from '@lucide/svelte/icons/chevron-right'
  import type { Component } from 'svelte'

  // Supported menu icons — import individually to avoid bundling the entire lucide library
  import HouseIcon from '@lucide/svelte/icons/house'
  import UsersIcon from '@lucide/svelte/icons/users'
  import ContactIcon from '@lucide/svelte/icons/contact'
  import PackageIcon from '@lucide/svelte/icons/package'
  import FileTextIcon from '@lucide/svelte/icons/file-text'
  import SettingsIcon from '@lucide/svelte/icons/settings'
  import ShoppingCartIcon from '@lucide/svelte/icons/shopping-cart'
  import WarehouseIcon from '@lucide/svelte/icons/warehouse'
  import TruckIcon from '@lucide/svelte/icons/truck'
  import ReceiptIcon from '@lucide/svelte/icons/receipt'
  import CreditCardIcon from '@lucide/svelte/icons/credit-card'
  import BarChartIcon from '@lucide/svelte/icons/bar-chart'
  import CalendarIcon from '@lucide/svelte/icons/calendar'
  import FolderIcon from '@lucide/svelte/icons/folder'
  import TagIcon from '@lucide/svelte/icons/tag'
  import ClipboardListIcon from '@lucide/svelte/icons/clipboard-list'
  import BuildingIcon from '@lucide/svelte/icons/building'
  import MailIcon from '@lucide/svelte/icons/mail'
  import GlobeIcon from '@lucide/svelte/icons/globe'
  import LayersIcon from '@lucide/svelte/icons/layers'

  const SUPPORTED_ICONS: Record<string, Component> = {
    House: HouseIcon,
    Users: UsersIcon,
    Contact: ContactIcon,
    Package: PackageIcon,
    FileText: FileTextIcon,
    Settings: SettingsIcon,
    ShoppingCart: ShoppingCartIcon,
    Warehouse: WarehouseIcon,
    Truck: TruckIcon,
    Receipt: ReceiptIcon,
    CreditCard: CreditCardIcon,
    BarChart: BarChartIcon,
    Calendar: CalendarIcon,
    Folder: FolderIcon,
    Tag: TagIcon,
    ClipboardList: ClipboardListIcon,
    Building: BuildingIcon,
    Mail: MailIcon,
    Globe: GlobeIcon,
    Layers: LayersIcon,
  }

  const STORAGE_KEY = 'left-sidebar-menu-open'

  function loadOpenState(): Record<string, boolean> {
    if (!browser) return {}
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Record<string, boolean>
    } catch {
      return {}
    }
  }

  let openState = $state<Record<string, boolean>>(loadOpenState())

  $effect(() => {
    if (!browser) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify($state.snapshot(openState)))
  })

  function getIcon(name?: string): Component | null {
    if (!name) return null
    return SUPPORTED_ICONS[name] ?? null
  }

  function getHref(item: MenuItem): string {
    if (!item.pageId) return '#'
    return createRoute({ $id: item.pageId, params: item.params, query: item.query })
  }
</script>

<Sidebar.Group data-sveltekit-preload-data="off">
  <Sidebar.GroupLabel>{getI18nLabel(mainMenu.name)}</Sidebar.GroupLabel>
  <Sidebar.Menu>
    {#each mainMenu.items.filter(i => i.visible !== false) as item (item.label)}
      {#if item.type === 'link'}
        <Sidebar.MenuItem>
          <Sidebar.MenuButton isActive={page.url.pathname === getHref(item)} tooltipContent={getI18nLabel(item.label)}>
            {#snippet child({ props })}
              {@const Icon = getIcon(item.icon)}
              <a href={getHref(item)} {...props}>
                {#if Icon}
                  <Icon />
                {/if}
                <span>{getI18nLabel(item.label)}</span>
              </a>
            {/snippet}
          </Sidebar.MenuButton>
        </Sidebar.MenuItem>
      {:else}
        {@const isGroupActive = item.children.some(c => page.url.pathname === getHref(c))}
        <Collapsible.Root
          open={openState[item.label] ?? isGroupActive}
          onOpenChange={v => {
            openState[item.label] = v
          }}
          class="group/collapsible">
          {#snippet child({ props })}
            <Sidebar.MenuItem {...props}>
              <Collapsible.Trigger>
                {#snippet child({ props })}
                  {@const Icon = getIcon(item.icon)}
                  <Sidebar.MenuButton {...props} tooltipContent={getI18nLabel(item.label)}>
                    {#if Icon}
                      <Icon />
                    {/if}
                    <span>{getI18nLabel(item.label)}</span>
                    <ChevronRightIcon
                      class="ms-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </Sidebar.MenuButton>
                {/snippet}
              </Collapsible.Trigger>
              <Collapsible.Content>
                <Sidebar.MenuSub>
                  {#each item.children.filter(c => c.visible !== false) as subItem (subItem.label)}
                    <Sidebar.MenuSubItem>
                      <Sidebar.MenuSubButton isActive={page.url.pathname === getHref(subItem)}>
                        {#snippet child({ props })}
                          <a href={getHref(subItem)} {...props}>
                            <span>{getI18nLabel(subItem.label)}</span>
                          </a>
                        {/snippet}
                      </Sidebar.MenuSubButton>
                    </Sidebar.MenuSubItem>
                  {/each}
                </Sidebar.MenuSub>
              </Collapsible.Content>
            </Sidebar.MenuItem>
          {/snippet}
        </Collapsible.Root>
      {/if}
    {/each}
  </Sidebar.Menu>
</Sidebar.Group>
