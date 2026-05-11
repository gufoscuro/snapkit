/**
 * Helpers for the `*_snapshot` fields the API returns alongside foreign-key ids.
 *
 * The API serializes snapshots inconsistently — sometimes as a single object,
 * sometimes as a one-element array. `normalizeSnapshot` papers over that.
 */

export type SnapshotShape = Record<string, unknown> | Record<string, unknown>[]

/** Returns the underlying object regardless of whether the snapshot is an array or single object. */
export function normalizeSnapshot(snapshot: SnapshotShape | undefined): Record<string, unknown> | undefined {
  if (!snapshot) return undefined
  if (Array.isArray(snapshot)) return snapshot.length > 0 ? snapshot[0] : undefined
  return snapshot
}

/** Read a string field from a snapshot (e.g. `extractSnapshotString(customerSnapshot, 'name')`). */
export function extractSnapshotString(snapshot: SnapshotShape | undefined, field: string): string | undefined {
  const obj = normalizeSnapshot(snapshot)
  const value = obj?.[field]
  return typeof value === 'string' && value ? value : undefined
}
