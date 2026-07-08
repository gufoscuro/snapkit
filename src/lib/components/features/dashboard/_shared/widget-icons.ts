import BanknoteIcon from '@lucide/svelte/icons/banknote'
import BarChartIcon from '@lucide/svelte/icons/bar-chart'
import ChartColumnIcon from '@lucide/svelte/icons/chart-column'
import CreditCardIcon from '@lucide/svelte/icons/credit-card'
import EuroIcon from '@lucide/svelte/icons/euro'
import FileTextIcon from '@lucide/svelte/icons/file-text'
import PackageIcon from '@lucide/svelte/icons/package'
import ReceiptIcon from '@lucide/svelte/icons/receipt'
import TruckIcon from '@lucide/svelte/icons/truck'
import type { Component } from 'svelte'

/**
 * Icon names a `WidgetConfig` may reference by string. Mirrors the sidebar's
 * `SUPPORTED_ICONS` pattern: a static map keeps the import graph explicit and
 * tree-shakeable while letting DB/chatbot configs pick an icon by name. Extend
 * as new widgets need more.
 */
export const WIDGET_ICONS: Record<string, Component> = {
  Euro: EuroIcon,
  Truck: TruckIcon,
  Receipt: ReceiptIcon,
  Banknote: BanknoteIcon,
  CreditCard: CreditCardIcon,
  FileText: FileTextIcon,
  Package: PackageIcon,
  BarChart: BarChartIcon,
  ChartColumn: ChartColumnIcon,
}

/** Resolve a config icon name to a component, or `null` when unset/unknown. */
export function getWidgetIcon(name?: string): Component | null {
  if (!name) return null
  return WIDGET_ICONS[name] ?? null
}
