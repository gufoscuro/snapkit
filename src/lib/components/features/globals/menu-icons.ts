// Menu icons, resolved by the name stored in the menu config (`MenuItem.icon`).
// Shared by LeftSidebarMenu and MainMenuDropdown so the two can't drift apart.
// Each icon is imported individually to avoid bundling the whole library.
import BarChartIcon from '@lucide/svelte/icons/bar-chart'
import BuildingIcon from '@lucide/svelte/icons/building'
import CalendarIcon from '@lucide/svelte/icons/calendar'
import ClipboardListIcon from '@lucide/svelte/icons/clipboard-list'
import ContactIcon from '@lucide/svelte/icons/contact'
import CreditCardIcon from '@lucide/svelte/icons/credit-card'
import FileClockIcon from '@lucide/svelte/icons/file-clock'
import FileInputIcon from '@lucide/svelte/icons/file-input'
import FileTextIcon from '@lucide/svelte/icons/file-text'
import FolderIcon from '@lucide/svelte/icons/folder'
import GlobeIcon from '@lucide/svelte/icons/globe'
import HandCoinsIcon from '@lucide/svelte/icons/hand-coins'
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
// Tabler icon (used where Lucide has no close equivalent, e.g. receivables)
import IconMoneybagMoveBack from '@tabler/icons-svelte/icons/moneybag-move-back'
import type { Component } from 'svelte'

export const MENU_ICONS: Record<string, Component> = {
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
  FileInput: FileInputIcon,
  HandCoins: HandCoinsIcon,
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

/** Resolve a menu config icon name to a component, or `null` when unset/unknown. */
export function getMenuIcon(name?: string): Component | null {
  if (!name) return null
  return MENU_ICONS[name] ?? null
}
