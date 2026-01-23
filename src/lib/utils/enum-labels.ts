import * as m from '$lib/paraglide/messages.js'
import type { SalesOrderSummary, SupplyOrderSummary } from '$lib/types/api-types'

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline'

interface EnumDisplayConfig {
  label: () => string
  variant: BadgeVariant
}

// Supply Order Status
export const supplyOrderStatusConfig: Record<SupplyOrderSummary['status'], EnumDisplayConfig> = {
  draft: { label: m.enum_supply_status_draft, variant: 'secondary' },
  sent: { label: m.enum_supply_status_sent, variant: 'outline' },
  accepted: { label: m.enum_supply_status_accepted, variant: 'default' },
  shipped: { label: m.enum_supply_status_shipped, variant: 'default' },
  rejected: { label: m.enum_supply_status_rejected, variant: 'destructive' },
}

export function getSupplyStatusLabel(status: SupplyOrderSummary['status']): string {
  return supplyOrderStatusConfig[status]?.label() ?? status
}

export function getSupplyStatusVariant(status: SupplyOrderSummary['status']): BadgeVariant {
  return supplyOrderStatusConfig[status]?.variant ?? 'default'
}

// Sales Order Status
export const salesOrderStatusConfig: Record<SalesOrderSummary['status'], EnumDisplayConfig> = {
  draft: { label: m.enum_sales_status_draft, variant: 'secondary' },
  sent: { label: m.enum_sales_status_sent, variant: 'outline' },
  accepted: { label: m.enum_sales_status_accepted, variant: 'default' },
}

export function getSalesStatusLabel(status: SalesOrderSummary['status']): string {
  return salesOrderStatusConfig[status]?.label() ?? status
}

export function getSalesStatusVariant(status: SalesOrderSummary['status']): BadgeVariant {
  return salesOrderStatusConfig[status]?.variant ?? 'default'
}

// Sales Order Shipped Status
export const salesShippedStatusConfig: Record<NonNullable<SalesOrderSummary['shipped']>, EnumDisplayConfig> = {
  completed: { label: m.enum_sales_shipped_completed, variant: 'default' },
  'not shipped': { label: m.enum_sales_shipped_not_shipped, variant: 'secondary' },
  partial: { label: m.enum_sales_shipped_partial, variant: 'outline' },
}

export function getSalesShippedLabel(shipped: NonNullable<SalesOrderSummary['shipped']>): string {
  return salesShippedStatusConfig[shipped]?.label() ?? shipped
}

export function getSalesShippedVariant(shipped: NonNullable<SalesOrderSummary['shipped']>): BadgeVariant {
  return salesShippedStatusConfig[shipped]?.variant ?? 'default'
}
