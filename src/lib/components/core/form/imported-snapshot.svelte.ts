import { normalizeSnapshot, type SnapshotShape } from '$lib/utils/snapshots'

/**
 * Tiny holder used by Details components that drive an import-from-upstream flow.
 *
 * Why it exists: in create mode `record` is `undefined`, so the existing
 * `*Attr` derived (which read `record.customer_snapshot`, etc.) cannot feed
 * the selectors. After importing an upstream document we want to display the
 * customer / ship_to / contact / payment-term name in those selectors without
 * an extra fetch — the upstream payload already includes the snapshots.
 *
 * Usage:
 *   const customer = createImportedSnapshot()
 *   const customerAttr = $derived(customer.resolve(record?.customer_snapshot))
 *   // …on import:
 *   customer.value = upstream.customer_snapshot
 */
export function createImportedSnapshot() {
  let value = $state<SnapshotShape | undefined>(undefined)
  return {
    get value() {
      return value
    },
    set value(v: SnapshotShape | undefined) {
      value = v
    },
    /** Returns the normalized snapshot from the record if present, otherwise the imported one. */
    resolve(recordSnapshot: SnapshotShape | undefined): Record<string, unknown> | undefined {
      return normalizeSnapshot(recordSnapshot ?? value)
    },
    reset() {
      value = undefined
    },
  }
}

export type ImportedSnapshot = ReturnType<typeof createImportedSnapshot>
