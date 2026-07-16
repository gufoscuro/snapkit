<script lang="ts">
  import { goto } from '$app/navigation'
  import { buttonVariants } from '$lib/components/ui/button'
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
  import * as m from '$lib/paraglide/messages'
  import type { MenuItem, SimpleMenuItem } from '$lib/stores/tenant-config/types'
  import { cn } from '$lib/utils.js'
  import { getI18nLabel } from '$utils/i18n'
  import { createRoute } from '$utils/route-builder'
  import LayoutGridIcon from '@lucide/svelte/icons/layout-grid'
  // Tabler icon (used where Lucide has no close equivalent, e.g. receivables)
  import IconMoneybagMoveBack from '@tabler/icons-svelte/icons/moneybag-move-back'
  import type { Component } from 'svelte'
  // Same icon set as LeftSidebarMenu — kept in sync intentionally
  import BarChartIcon from '@lucide/svelte/icons/bar-chart'
  import BuildingIcon from '@lucide/svelte/icons/building'
  import CalendarIcon from '@lucide/svelte/icons/calendar'
  import ClipboardListIcon from '@lucide/svelte/icons/clipboard-list'
  import ContactIcon from '@lucide/svelte/icons/contact'
  import CreditCardIcon from '@lucide/svelte/icons/credit-card'
  import FileClockIcon from '@lucide/svelte/icons/file-clock'
  import FileTextIcon from '@lucide/svelte/icons/file-text'
  import FolderIcon from '@lucide/svelte/icons/folder'
  import GlobeIcon from '@lucide/svelte/icons/globe'
  import HouseIcon from '@lucide/svelte/icons/house'
  import LayersIcon from '@lucide/svelte/icons/layers'
  import MailIcon from '@lucide/svelte/icons/mail'
  import PackageIcon from '@lucide/svelte/icons/package'
  import PackageOpen from '@lucide/svelte/icons/package-open'
  import ReceiptIcon from '@lucide/svelte/icons/receipt'
  import SettingsIcon from '@lucide/svelte/icons/settings'
  import ShoppingCartIcon from '@lucide/svelte/icons/shopping-cart'
  import TagIcon from '@lucide/svelte/icons/tag'
  import TruckIcon from '@lucide/svelte/icons/truck'
  import UsersIcon from '@lucide/svelte/icons/users'
  import WarehouseIcon from '@lucide/svelte/icons/warehouse'

  type Props = {
    items: MenuItem[]
    align?: 'start' | 'center' | 'end'
    class?: string
  }

  const { items, align = 'start', class: className }: Props = $props()

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
    FileClock: FileClockIcon,
    BarChart: BarChartIcon,
    Calendar: CalendarIcon,
    Folder: FolderIcon,
    Tag: TagIcon,
    ClipboardList: ClipboardListIcon,
    Building: BuildingIcon,
    Mail: MailIcon,
    Globe: GlobeIcon,
    Layers: LayersIcon,
    PackageOpen: PackageOpen,
    // Tabler icons carry a slightly different component signature than Lucide's;
    // the cast keeps the map uniformly typed (renders fine at runtime).
    MoneybagMoveBack: IconMoneybagMoveBack as unknown as Component,
  }

  function getIcon(name?: string): Component | null {
    if (!name) return null
    return SUPPORTED_ICONS[name] ?? null
  }

  function getHref(item: MenuItem): string {
    if (!item.pageId) return '#'
    return createRoute({ $id: item.pageId, params: item.params, query: item.query })
  }

  type Section =
    | { kind: 'links'; items: SimpleMenuItem[] }
    | { kind: 'group'; label: string; items: SimpleMenuItem[] }

  const sections = $derived.by((): Section[] => {
    const result: Section[] = []
    const visible = items.filter(i => i.visible !== false)
    let buffer: SimpleMenuItem[] = []

    const flushLinks = () => {
      if (buffer.length > 0) {
        result.push({ kind: 'links', items: buffer })
        buffer = []
      }
    }

    for (const item of visible) {
      if (item.type === 'link') {
        buffer.push(item)
      } else {
        flushLinks()
        const visibleChildren = item.children.filter(
          (c): c is SimpleMenuItem => c.visible !== false && c.type === 'link',
        )
        if (visibleChildren.length > 0) {
          result.push({ kind: 'group', label: item.label, items: visibleChildren })
        }
      }
    }
    flushLinks()

    return result
  })
</script>

{#if sections.length > 0}
  <DropdownMenu.Root>
    <DropdownMenu.Trigger
      class={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'size-8', className)}
      aria-label={m.main_menu()}
      title={m.main_menu()}>
      <LayoutGridIcon />
    </DropdownMenu.Trigger>
    <DropdownMenu.Content {align} class="w-56">
      {#each sections as section, i (i)}
        {#if i > 0}
          <DropdownMenu.Separator />
        {/if}
        <DropdownMenu.Group>
          {#if section.kind === 'group'}
            <DropdownMenu.Label>{getI18nLabel(section.label)}</DropdownMenu.Label>
          {/if}
          {#each section.items as item (item.label)}
            {@const Icon = getIcon(item.icon)}
            <DropdownMenu.Item onSelect={() => goto(getHref(item))}>
              {#if Icon}
                <Icon />
              {/if}
              <span>{getI18nLabel(item.label)}</span>
            </DropdownMenu.Item>
          {/each}
        </DropdownMenu.Group>
      {/each}
    </DropdownMenu.Content>
  </DropdownMenu.Root>
{/if}
