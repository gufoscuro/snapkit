# Payment Composition

A **payment composition** replaces the old single "payment term" on commercial terms and
sales documents. Instead of one `payment_term_id`, an entity now carries a list of
**slices** — `acconto` (advance), `stato_avanzamento_lavori` (SAL / progress billing) and
`saldo` (final balance) — each with its own percentage and its own payment term.

This blueprint covers the shared types, the `PaymentCompositionEditor` component, the
`$lib/utils/payment-composition.ts` helpers, and the document-integration pattern
(prefill from snapshot, submit shape, import compatibility).

## Data model

`PaymentComposition` (`$lib/types/api-types.ts`) is the canonical, **shared** slice shape —
used by customer/supplier commercial terms and by sales documents. Do not introduce
entity-specific variants.

```typescript
export type PaymentSliceType = 'acconto' | 'stato_avanzamento_lavori' | 'saldo'

export type PaymentComposition = {
  id?: string                 // present on responses, omitted on create
  position: number            // 1-based ordering (see Gotchas)
  percentage: number
  type: PaymentSliceType
  payment_term_id: string
  payment_term?: PaymentTerm  // display-only; stripped before submit
}
```

### How it appears on the API

The shape differs by resource family — this drives the FE wiring:

| Resource | Request field (write) | Response field (read) |
|---|---|---|
| Customer / Supplier commercial terms | `composition: [{position, percentage, type, payment_term_id}]` | `composition: PaymentComposition[]` (incl. `payment_term`) |
| Quotation / Sales Order | `composition: [...]` (same) | `payment_composition_snapshot: [...]` + `composition_signature: string` |

**Key asymmetry:** commercial terms return the live `composition`; **documents return a
read-only `payment_composition_snapshot`** (denormalized — each row's `payment_term` has no
`id` of its own; the id is the row-level `payment_term_id`) plus a `composition_signature`.

**Who has a composition:** customer commercial terms, supplier commercial terms, quotation,
sales order. **Who does NOT:** transport document and warehouse order (no payment data by
design — the Saldo slice is resolved at invoice-prefill time from the source SOs). Invoices
keep a **single** payment term (one materialized slice), so they still use `PaymentTermSelector`.

## The editor: `PaymentCompositionEditor`

**File:** `$components/features/form/PaymentCompositionEditor.svelte`

A generic, table-based editor built on [`EditableTableField`](./editable-table-field.md).
Columns: slice type (`Select.Root`), percentage (`TextField`), payment term
(`PaymentTermSelector` per row). A header shows the running total `%` (red when ≠ 100).
Like every editable-table editor it **clears form context** and syncs a single `composition`
array to the parent form.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `name` | `string` | `'composition'` | Parent form field name |
| `value` | `PaymentComposition[]` | — | Hydration source (prefill). Pass the **live form field** so external updates re-hydrate (see `{#key}` below) |
| `label` | `string` | `m.payment_composition()` | Table label |
| `showLabel` | `boolean` | `true` | Show label + total indicator |
| `required` | `boolean` | `false` | Required marker |
| `disabled` | `boolean` | `false` | Disable |

### Validator

`compositionRules()` (exported from the util, re-exported by the editor for convenience)
enforces, client-side: at least one slice, every slice complete (type + percentage > 0 +
payment term), percentages summing to exactly 100, and **at most one `saldo`** slice. The
backend's sum-to-100 is currently deferred, so this is the authoritative client gate.

```typescript
import { compositionRules } from '$lib/utils/payment-composition'

const validateCreate = v.schema<Partial<Entity & { composition: PaymentComposition[] }>>({
  // ...other fields
  composition: [compositionRules()],
}).build()
```

> Documents type `composition` is **not** on the entity type (the entity has
> `payment_composition_snapshot`), so widen the schema generic with
> `& { composition: PaymentComposition[] }`.

## The util: `$lib/utils/payment-composition.ts`

Pure helpers, shared by editor, forms and import pickers:

| Export | Purpose |
|---|---|
| `compositionSignature(slices)` | FE port of the backend `paymentCompositionSignature()`: sorted, comma-joined `type|payment_term_id` pairs. **Depends only on `(type, payment_term_id)`** — not percentage/position. Used for import compatibility |
| `compositionRules()` | The validator above |
| `compositionFromSnapshot(snapshot)` | Maps a document's `payment_composition_snapshot` → `PaymentComposition[]`, rebuilding each `payment_term.id` from `payment_term_id` so the per-row selector shows the term name without a fetch |
| `toCompositionPayload(composition)` | Strips to the API request shape `{position, percentage, type, payment_term_id}`, dropping display-only `payment_term`/`id` |
| `PaymentCompositionSnapshotRow` | Type of a snapshot row |

**Why compute the signature on the FE for everything** (records *and* the edited form state):
a single code path guarantees the user-edited composition and the importable records'
snapshots produce identical signatures. Mixing the backend `composition_signature` for
records with an FE function for the form would risk false mismatches. Ignore the
backend-provided `composition_signature` field and call `compositionSignature()` on both sides.
Use a plain lexicographic `.sort()` (no `localeCompare`) to match PHP's `sort()`.

## Integrating into a commercial-terms form

Commercial terms return the live `composition` (with `payment_term`), so it's direct:

```svelte
<PaymentCompositionEditor name="composition" value={initialValues.composition} required />
```

`initialValues`: default to one `Saldo 100%` row on create, or `record.composition` on edit.
Submit sends the form `composition` (already clean from the editor's output, but run it
through `toCompositionPayload()` to also handle the untouched-edit case).

## Integrating into a document form (Quotation / Sales Order)

Documents return `payment_composition_snapshot`, and the field is set externally (import /
customer commercial-terms default), which requires a remount to re-hydrate the editor.

1. **Type/contract:** drop `payment_term_id` / `payment_term_snapshot`; add
   `payment_composition_snapshot` + `composition_signature` (both on the api-type and the
   provides contract's TypeBox schema).
2. **initialValues:** default `[{ position: 1, percentage: 100, type: 'saldo', payment_term_id: '' }]`;
   on edit, `compositionFromSnapshot(record.payment_composition_snapshot)`.
3. **Remount on external set:** keep `let compositionKey = $state(0)` and wrap the editor in
   `{#key compositionKey}`, passing `value={formAPI.values.composition}`. Bump `compositionKey++`
   whenever you set the field from outside the editor (import prefill, customer default). User
   edits inside the editor must **not** bump it.

   ```svelte
   {#key compositionKey}
     <PaymentCompositionEditor name="composition"
       value={formAPI.values.composition as PaymentComposition[]} required />
   {/key}
   ```

4. **Default from customer commercial terms:** on customer change (create mode), fetch the
   customer's commercial terms and `updateField('composition', data.composition)` + bump key.
5. **Submit shape:** strip with `toCompositionPayload()` in the `create`/`update` callbacks.
6. **Validation:** `compositionRules()` on both create and update.

## Import compatibility (documents with an import wizard)

When a document imports from upstream records (e.g. Sales Order ← Quotations), all sources
must share the **same composition signature** (same `(type, payment_term_id)` multiset;
percentages may differ). Incompatible records are shown **visible but not selectable** via
[`ImportMenu`](./import-menu.md). This needs **two complementary layers** — one alone is
insufficient:

- **`compatKey`** (record-anchored, intra-session): append the record's signature to the
  compat key so that, within a single multi-select session, picks after the first are locked
  to the first pick's signature.

  ```typescript
  function quotationCompatKey(q): string {
    const sig = q.payment_composition_snapshot
      ? compositionSignature(q.payment_composition_snapshot)
      : (q.composition_signature ?? '')
    return `${q.customer_id}|${q.ship_to_address_id ?? ''}|${q.incoterm ?? ''}|${sig}`
  }
  ```

- **`lockWhen`** (form-anchored, cross-session + post-edit): lock records whose signature
  differs from the form's **current** composition — but only once the form has a complete
  ("pinned") composition, so a fresh document can still import its first record.

  ```typescript
  function isCompositionLocked(q, values): boolean {
    const comp = values.composition as PaymentComposition[] | undefined
    if (!comp || comp.length === 0 || comp.some(c => !c.type || !c.payment_term_id)) return false
    const sig = q.payment_composition_snapshot
      ? compositionSignature(q.payment_composition_snapshot)
      : (q.composition_signature ?? '')
    return sig !== compositionSignature(comp)
  }
  ```
  ```svelte
  <ImportMenu compatKey={quotationCompatKey}
    lockWhen={q => isCompositionLocked(q, formAPI.values)} ... />
  ```

The first import prefills the form composition (`compositionFromSnapshot` + bump key); from
then on `lockWhen` follows the user's edits. The save-time backend validator
(`quotation_payment_composition_mismatch`, 422) is the final authority; these layers just
keep the user from reaching submit with a mismatch.

## Gotchas

- **`position` is 1-based.** `toCompositionPayload`/the editor emit `index + 1`. (The backend
  expects 1-based; the value the editor seeds in `initialValues` should match.)
- **Signature ignores percentage and position** — only `(type, payment_term_id)` matter.
- **`{#key}` is required for external updates.** The editor hydrates from `value` once per
  mount (a `hydrated` guard); without a remount, an import/`updateField` won't show.
- **Module vs instance scope:** the editor's instance script needs its own
  `import * as m from '$lib/paraglide/messages'`. A `<script module>` re-export (e.g. of
  `compositionRules`) does NOT make `m` available to the instance script at runtime, even
  though `tsc`/svelte2tsx won't flag it (they merge the two scopes at compile time).

## Migration checklist (new document)

- [ ] Verify via the `moddo-api` MCP that the resource actually carries `composition` (TD/WO do not)
- [ ] api-type: `payment_term_id`/`payment_term_snapshot` → `payment_composition_snapshot` + `composition_signature`
- [ ] Provides contract schema: same swap
- [ ] Replace `PaymentTermSelector` with `{#key compositionKey}<PaymentCompositionEditor name="composition" .../>{/key}`
- [ ] `initialValues`: default Saldo 100% / `compositionFromSnapshot` on edit
- [ ] Default from customer commercial terms on customer change (+ bump key)
- [ ] If it imports upstream: add `compatKey` signature + `lockWhen`
- [ ] Strip with `toCompositionPayload()` in create/update
- [ ] `compositionRules()` validator (widen schema generic with `& { composition }`)
- [ ] Recompile paraglide if new i18n keys; run `tsc` + `svelte-autofixer`

## Related

- [`editable-table-field.md`](./editable-table-field.md) — the core the editor builds on
- [`import-menu.md`](./import-menu.md) — `compatKey` / `lockWhen` compatibility locking
- [`detail-record-form.md`](./detail-record-form.md) — the document form lifecycle
