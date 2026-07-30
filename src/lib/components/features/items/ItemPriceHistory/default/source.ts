import * as m from '$lib/paraglide/messages'
import type { UserResource } from '$lib/types/api-types'

/**
 * The two price-history endpoints, named by their path segment so the source
 * value *is* the URL suffix — there is no mapping table to get out of sync.
 */
export type PriceHistorySource = 'sales-order-lines' | 'invoice-lines'

/**
 * Sales orders and invoices sit behind independent permissions, so the source
 * options are whatever the user can actually read. Returning fewer than two is
 * meaningful: one option means the switch should not render at all (a one-choice
 * filter is noise), zero means the page has nothing to show.
 */
export function getPriceHistorySources(user: UserResource | null | undefined) {
  const can = (permission: 'view-sales-orders' | 'view-invoices') =>
    (user?.is_superadmin ?? false) || (user?.all_permissions?.includes(permission) ?? false)

  return [
    can('view-sales-orders')
      ? { value: 'sales-order-lines' as const, label: m.price_history_source_sales_orders() }
      : null,
    can('view-invoices') ? { value: 'invoice-lines' as const, label: m.price_history_source_invoices() } : null,
  ].filter(source => source !== null)
}
