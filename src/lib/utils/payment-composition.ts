/**
 * Shared helpers for payment compositions (Acconto / SAL / Saldo slices).
 *
 * Used by customer/supplier commercial terms and by document forms
 * (quotation / sales order / transport document) plus their import pickers.
 */
import type { FieldValidator } from '$components/core/form/validation'
import * as m from '$lib/paraglide/messages'
import type { PaymentComposition, PaymentSliceType, PaymentTerm } from '$lib/types/api-types'

/**
 * Shape of a single row in a document's read-only `payment_composition_snapshot`.
 * The embedded `payment_term` is a denormalized snapshot (no `id` of its own — the
 * id lives at the row level as `payment_term_id`).
 */
export type PaymentCompositionSnapshotRow = {
  type: PaymentSliceType
  position: number
  percentage: number
  payment_term_id: string
  payment_term?: Partial<PaymentTerm> & { id?: string }
}

/**
 * Frontend port of the backend `paymentCompositionSignature()`:
 *
 *   collect($snapshot)->map(fn($r) => $r['type'].'|'.$r['payment_term_id'])
 *     ->sort()->values()->implode(',')
 *
 * The signature depends only on the multiset of `(type, payment_term_id)` pairs —
 * percentages and positions are irrelevant. We compute it on the frontend so the
 * user-edited composition and the importable records' snapshots go through the
 * exact same algorithm (no divergence with the backend-provided value).
 *
 * Uses a plain lexicographic sort to match PHP's default `sort()` on these ASCII
 * strings (lowercase slice type + uuid). Do not switch to `localeCompare`.
 */
export function compositionSignature(
  slices: Pick<PaymentComposition, 'type' | 'payment_term_id'>[] | undefined | null,
): string {
  return (slices ?? [])
    .map(s => `${s.type}|${s.payment_term_id}`)
    .sort()
    .join(',')
}

/**
 * Maps a document's read-only `payment_composition_snapshot` into the editable
 * `PaymentComposition[]` shape consumed by `PaymentCompositionEditor` (prefill on
 * edit / import). Rebuilds each `payment_term.id` from the row's `payment_term_id`
 * so the per-row `PaymentTermSelector` can display the term name without a fetch.
 */
export function compositionFromSnapshot(
  snapshot: PaymentCompositionSnapshotRow[] | undefined | null,
): PaymentComposition[] {
  return (snapshot ?? []).map(row => ({
    position: row.position,
    percentage: row.percentage,
    type: row.type,
    payment_term_id: row.payment_term_id,
    payment_term: row.payment_term
      ? ({ ...row.payment_term, id: row.payment_term.id ?? row.payment_term_id } as PaymentTerm)
      : undefined,
  }))
}

/**
 * Strips a composition down to the exact request shape accepted by the API
 * (`{ position, percentage, type, payment_term_id }`), dropping display-only
 * fields (`payment_term`, `id`) that prefill/snapshot data may carry.
 */
export function toCompositionPayload(
  composition: PaymentComposition[] | undefined | null,
): Pick<PaymentComposition, 'position' | 'percentage' | 'type' | 'payment_term_id'>[] {
  return (composition ?? []).map(({ position, percentage, type, payment_term_id }) => ({
    position,
    percentage,
    type,
    payment_term_id,
  }))
}

/**
 * Validator for a payment composition field. Enforces (client-side):
 * at least one slice, every slice complete (type + percentage > 0 + payment term),
 * percentages summing to exactly 100, and at most one `saldo` slice.
 * Use with v.schema(): composition: [compositionRules()]
 */
export function compositionRules<T>(): FieldValidator<T> {
  return value => {
    const slices = value as PaymentComposition[] | undefined
    if (!slices || slices.length === 0) return m.validation_composition_required()
    if (slices.some(s => !s.type || !s.payment_term_id || !(Number(s.percentage) > 0)))
      return m.validation_composition_incomplete()
    const total = slices.reduce((sum, s) => sum + (Number(s.percentage) || 0), 0)
    if (Math.round(total * 100) / 100 !== 100) return m.validation_composition_sum_100()
    if (slices.filter(s => s.type === 'saldo').length > 1) return m.validation_composition_single_saldo()
    return undefined
  }
}
