# Invoices — Frontend Special Cases

Frontend-specific quirks, conditional behaviors, and non-obvious UX logic for the **invoices** feature. This file documents the *why* behind special cases that look arbitrary in the code — it is **not** a how-to guide and deliberately excludes backend business rules (for those, consult the Moddo API business-docs).

Scope: presentation, form behavior, import/prefill flow, and client-side validation UX. Line numbers are intentionally omitted (they drift) — references point to files + symbols.

Main files:
- `src/lib/components/features/invoices/InvoicesDetails/default/InvoicesDetails.svelte` — the create/edit form (the bulk of the logic)
- `src/lib/components/features/invoices/invoice-actions.ts` — record actions (validate, submit, delete, archive)
- `src/lib/components/features/form/InvoiceDueDatesEditor.svelte` — due-date schedule sub-editor
- `src/lib/components/features/form/InvoiceItemsListEditor.svelte` — line items editor
- `src/lib/components/core/StackedAmountValues.svelte` — the totals panel rows
- `src/lib/components/features/invoices/InvoiceStateBadge.svelte` + `InvoiceableDocumentStatusBadge.svelte` — status badges
- `src/lib/components/features/common/Filters/InvoicesFilters.svelte` + `InvoiceableDocumentsFilters.svelte` — listing filters
- `src/lib/chat/page-tools/invoices-filter.ts` — chat-driven filter tool
- `src/lib/components/features/invoices/InvoicePaymentStatusBadge.svelte` — tri-state payment-status badge
- `src/lib/components/features/invoices/InvoicePayments/default/InvoicePayments.svelte` — payments subpage (grouped by scadenza)
- `src/lib/components/features/invoices/invoice-payment-actions.ts` — record / delete / mark-as-paid helpers + collectability guard
- `src/lib/components/features/payments/RecordPaymentDialog.svelte` — record-payment dialog (shared with the *Da incassare* list)

---

## Editability is gated by invoice state

**What:** The whole form goes read-only (`isReadOnly` → `locked` on `FormUtil`) unless the invoice state is `draft` or `rejected`. The standalone **Save** button renders only when `record.state === 'draft'`. The **Validate** action (`invoice-actions.ts`) is `visible` only in `draft`. **Hard delete** (both the table action and the details action) is allowed only in `draft`; every other state can only be archived.

**Why:** Invoices are only editable before submission or after an SDI rejection. Once sent/accepted/error, the record is part of the fiscal audit trail and must be archived (soft, state transition) rather than deleted.

**Where:** `InvoicesDetails.svelte` (`isReadOnly` computed, save-button guard); `invoice-actions.ts` (`visible: opts => opts.state === 'draft'` on validate and delete).

---

## Cumulative invoices (merging multiple sources)

**What:** When more than one invoiceable document is imported into a draft, the invoice becomes **cumulative** (`isCumulative`). A notice is shown that totals/VAT are deferred until save. In the API payload, `sales_order_id` is forced to `null`; each line keeps its own upstream linkage (`sales_order_item_id` / `transport_document_item_id`). The first imported source fills the header (customer, document type, bank, notes, payment term); subsequent sources only append line items. Lines are partitioned by source reference and an auto-generated descriptive header line is inserted before each group (e.g. "Rif. Vs ordine: SO-001 del …").

**Why:** A cumulative invoice bills several orders/DDTs, so the header can't point to a single order — it's nulled and traceability lives at the line level. Per-source totals can't be computed correctly on the client; the merged total is only known after the backend processes all lines. The grouping headers let the user see which lines came from which source.

**Where:** `InvoicesDetails.svelte` — `isCumulative`, `buildApiPayload` (the `sales_order_id: null` comment), `buildPrefilledItemGroups`, prefill header-vs-append logic.

### Which sources can be merged

**What:** `isAccumulableSourceType()` returns true only for `order_saldo_from_transport` (DDT) and `order_saldo_direct` (direct order). Acconto and SAL sources are never combinable.

**Why:** Acconto/SAL address a single payment slice per source, so an invoice maps 1:1 to one slice. Only Saldo-type (unsliced) sources can be stacked into one invoice.

**Where:** `InvoicesDetails.svelte` — `isAccumulableSourceType`.

### Import compatibility locking

**What:** Once the first document is imported, a `compatKey` anchors the form and `isImportLocked()` (`lockWhen`) disables incompatible options in the ImportMenu picker. For Saldo sources the key combines source type + customer + payment term + document type (so matching DDTs stack); for non-accumulable sources the key is unique per document (so they can only be imported alone). `prefillSource()` also deduplicates by source ID — re-picking an already-merged document is a no-op.

**Why:** Prevents mixing documents with incompatible billing structures, customers, or payment terms, and prevents duplicate line items.

**Where:** `InvoicesDetails.svelte` — `compatKey` builder, `isImportLocked`, `prefillSource` (the `prefilledSources` check). See also `.blueprints/components/import-menu.md` for the generic compatKey/lockWhen mechanism.

---

## URL-driven prefill flow

**What:** Navigating to invoice-details in create mode with `?source_type=…&source_id=…[&slice_position=…]` auto-fires the prefill **once per mount** (`autoPrefillTriggered` guard). This is the entry point from the InvoiceableDocumentsTable action button (which builds exactly that URL; `slice_position` only matters for Acconto/SAL). Clicking **Reset Import** clears the form **and strips the query params** from the URL — but deliberately does **not** reset `autoPrefillTriggered`.

**Why:** Without stripping the params, a page reload would re-fire the auto-prefill the user just cleared. Without keeping the guard flag set, toggling it could re-run the effect while the URL strip is still microtask-pending, re-triggering the very prefill being cleared. (The code comment documents this race in full.)

**Where:** `InvoicesDetails.svelte` — auto-prefill `$effect`, `clearPrefill` (param-strip + flag comment); `InvoiceableDocumentsTable.svelte` — action route builder.

### Snapshot synthesis for prefilled data

**What:** The prefill response ships full entity objects (`customer`, `payment_term`, `legal_entity_bank`) which are stored in imported-snapshot stores so selectors render names without a round-trip; in edit mode the record's own snapshots take precedence. Line items arrive with only a flat article `code` and `vat_code_id` — the frontend synthesizes minimal `{code, name}` item snapshots and lazy-loads VAT codes once per mount to synthesize `{id, code, description, rate}` VAT snapshots for display.

**Why:** The prefill/save endpoints ship IDs, not display labels. Synthesizing snapshots avoids extra fetches and matches the saved-invoice structure so locked rows render consistently.

**Where:** `InvoicesDetails.svelte` — snapshot resolver, item-snapshot synthesis, VAT-code lazy load.

---

## Payment term & due-date schedule sync

**What:** `dueDatesServerManaged` becomes true — the due-date editor is hidden, `due_dates: []` is posted and the schedule-total validation is skipped — when **any** of these holds:

1. the user changed the payment term after prefill (`paymentTermMismatch`);
2. the invoice is cumulative (`isCumulative`);
3. a cassa or a ritenuta differs from the saved/prefilled one (`cassaWithholdingChanged`);
4. a line's pricing differs from the saved/prefilled baseline (`itemsPricingChanged`) **and** a payment term is set.

The backend then regenerates the schedule from the term. The payment-term selector also lazy-loads the term name from a snapshot (the saved invoice ships only the term ID), syncing on choose.

**Why:** The schedule is a derived output of payment term + payable. Anything that moves the payable leaves the existing rows stale, and the backend stores `due_dates[]` **verbatim, without balancing them against the totals** (see the moddo-api business-doc), so a stale schedule would be persisted in silence — the client-side check is the only guard.

Cases 3 and 4 were added with the cassa/ritenuta work: before that, editing a price moved the total while the schedule stayed put, and the form blocked the save on a mismatch it refused to fix.

**Why the payment-term condition on case 4 only:** an empty `due_dates[]` regenerates *only* if `payment_term_id` is set; without one the invoice saves with no schedule at all (see *No schedule is not neutral* below), and hiding the editor would remove the only way to enter the rows by hand. So a line edit without a term keeps the editor open and lets the running-total indicator flag the gap.

**What counts as a pricing change:** `itemsPricingSignature` projects each line to quantity, unit price, discount, VAT code and withholding flag, dropping descriptive rows and incomplete ones (the latter never reach the form value anyway — see [editable-list-field.md](../components/editable-list-field.md) → *Filtered output*). Editing a description or reordering rows leaves the schedule valid and deliberately does not trigger a regeneration.

**Where:** `InvoicesDetails.svelte` — `paymentTermMismatch`, `cassaWithholdingChanged`, `itemsPricingChanged`, `itemsPricingSignature`, `dueDatesServerManaged`, payment-term snapshot fetch; payload `due_dates: []` branch.

---

## No schedule is not neutral

**What:** when the schedule is server-managed but no payment term is set (`scheduleWillBeEmpty`), the payments section shows a **destructive** alert, not the usual neutral notice.

**Why:** the invoice would save with zero scadenze, and the consequences are silent rather than visible: no `DatiPagamento` in the XML, `payment_status` `null`, no payment recordable (payments attach to a scadenza), and — the dangerous one — `isFullyPaid()` falls back to "is it in an issued state?" for schedule-less invoices, so the downstream payment gates (DDT carry, next slice, saldo) treat the invoice as **settled without a cent collected**. A schedule lost by accident doesn't block the flow downstream: it unblocks it. Backend rationale in the moddo-api business-doc (*Payment due dates*, *Payment gate*).

**Where:** `InvoicesDetails.svelte` — `scheduleWillBeEmpty`, the destructive `Alert` in the payments section.

### Payment slice field remap

**What:** The form uses `slice_type` / `slice_position`; the API uses flat `payment_slice_type` / `payment_slice_position`. Remapped on load and on save. For `saldo` sources, `payment_slice_position` is always `null`; for acconto/SAL it must be a number addressing the specific unpaid slice.

**Why:** The form treats the slice as a lean pointer, while the API/backend use flat field names. Saldo sources have no slice concept; acconto/SAL are single-slice and need the position.

**Where:** `InvoicesDetails.svelte` — `buildApiPayload` remap, load-time remap.

---

## Schedule freeze after a recorded payment

**What:** once an invoice has at least one recorded payment (`payment_status` is `partially_paid` or `paid`), `scheduleFrozen` is true and the form locks the schedule: the `InvoiceDueDatesEditor` and the `PaymentTermSelector` render **disabled** with a notice (`invoice_schedule_frozen_notice`), and `buildApiPayload` **omits** `due_dates` and `payment_term_id` from the PUT entirely. `payment_status` is `null` for schedule-less invoices and `unpaid` before the first payment — neither freezes.

**Why:** the backend freezes the schedule after the first payment — sending `due_dates[]` (even empty, which would otherwise trigger regeneration) or a changed `payment_term_id` on PUT returns 422 (see moddo-api `deferred` -> *"Invoice payments — manual recording only"*). Omitting both fields keeps an edit valid. In practice only a **`rejected`** invoice reaches the editable form while frozen — issued states are already fully read-only via `isReadOnly` (see *Editability is gated by invoice state*). Unfreeze = delete the payments from the payments subpage.

**The freeze extends to the figures**, not just to the rows: an update that would move the taxable, the VAT or the payable of an invoice with recorded payments is rejected with a 422 on the **`totals`** key (`validation_custom.invoice_totals_frozen_by_payments`) — a line-price edit as much as a new cassa. Since `totals` is not a form field, `FormUtil`'s error mapping would swallow it, so the form reads it off `formApi.errors.totals` and renders it in the totals panel (the message names both amounts). An edit that leaves all three untouched (notes, a reorder) stays allowed, because fixing a rejected invoice for resubmission must remain possible. Unfreezing means deleting the payment, which is permanent.

**Where:** `InvoicesDetails.svelte` — `scheduleFrozen`, `totalsError` + the destructive `Alert` in the totals panel, `buildApiPayload` (`due_dates` / `payment_term_id` omission, frozen wins over the `dueDatesServerManaged` branch), `PaymentTermSelector disabled`, `InvoiceDueDatesEditor disabled` + frozen `Alert`. The distinct `dueDatesServerManaged` branch *regenerates* the schedule; freeze *suppresses* it — see *Payment term & due-date schedule sync* above.

---

## Payments subpage & recording

**What:** the `invoice-payments` subpage (under `invoice-details`) shows the invoice's payments **grouped by scadenza** — one `GroupTitle` per due date (heading `Scadenza {date}`; description = residual + paid + `InvoicePaymentStatusBadge`; the right column holds the payment history and the action buttons). Each recorded payment is deletable (confirm dialog). Collectable scadenze expose **Registra pagamento** (`RecordPaymentDialog`) and an icon-only **Segna come incassato** (records the residual, confirm dialog). The subpage fetches the full invoice and `useProvides(...'invoice')` so `InvoiceSidebar` renders the header + menu — the standard entity-subpage pattern (cf. the order delivery recap in [actionables.md](./actionables.md)). After any mutation it **silently re-fetches** (updates `invoice` in place, no spinner flash) instead of resetting the request promise.

**Why:** a payment belongs to a scadenza (`POST /invoice-due-dates/{id}/payments`), not to the invoice, so grouping by scadenza mirrors the domain. The subpage is the *provider* of `invoice` on its own page (InvoicesDetails isn't mounted there). Collectability is gated by `isDueDateCollectable` (see [actionables.md](./actionables.md)).

**The record dialog** (`RecordPaymentDialog`, shared with the *Da incassare* list): prefills `payment_date` = today, `amount` = the scadenza's **residual** (not the full amount — a partially-paid scadenza would exceed the residual and be rejected), `payment_method` = the scadenza's own method; all editable. Client validation enforces `0.01 <= amount <= residual`; the backend's residual/state 422 surfaces as inline field errors via `FormUtil`. Its fields override `width` to `w-full min-w-0` so they don't overflow the narrow dialog (see [forms.md](../components/forms.md) -> *Form fields in a narrow dialog*).

**Where:** `InvoicePayments.svelte` (+ `.contract.ts` provides `invoice`), `RecordPaymentDialog.svelte`, `invoice-payment-actions.ts`; `InvoiceSidebar.svelte` (payments menu item); `admin-config.ts` — `invoice-details.subpages` scaffold entry (a live tenant also needs the subpage added to its own config).

---

## Line items editor

**What:** A line item is locked (read-only except description, not removable) when it carries `transport_document_item_id` or `sales_order_item_id` (i.e. it traces back to an upstream document). Items are `required` on create but not on edit. The editor uses `uom` / `discount_percent`; the API uses `unit_of_measure` / `discount_percentage` — remapped at submit (`mapItemsToInvoicePayload`) and load (`mapItemsToEditorShape`).

**Why:** Upstream-linked lines should change through the document chain, not be overridden here. A new invoice needs at least one line to be valid. The shorter field names are shared with the quotation editor (historical naming).

`items[].subject_to_withholding` is **round-tripped but has no UI**: read in `mapItemsToEditorShape`, sent back in `mapItemsToInvoicePayload`. The server default is `true`, which is right for a professional's typical invoice, and the only case needing `false` is a line excluded from the withholding base (an art. 15 expense refund). Without the round-trip, editing an invoice whose line was excluded elsewhere would silently reset it to `true`. The per-row checkbox is deliberately deferred.

**Where:** `InvoicesDetails.svelte` — `isItemLocked`, items `required` prop, `mapItemsToInvoicePayload` / `mapItemsToEditorShape`.

---

## Cassa previdenziale & ritenuta d'acconto

**What:** a "Cassa e ritenuta" section between the line items and the totals, with two independent switches (`cassa_enabled` / `withholding_enabled`) that are **off by default**. The API takes repeatable arrays (FatturaPA allows several of each), but the form keeps **one row per section** as flat fields (`cassa_type`, `cassa_rate`, `cassa_taxable_percentage`, `cassa_vat_code_id`, `cassa_subject_to_withholding`; `withholding_type`, `withholding_rate`, `withholding_reason`), wrapped into arrays at submit by `buildCassaPayload` / `buildWithholdingPayload`.

**Why one row:** it covers every case we have, and for the withholding more than one row is misleading rather than useful — every `withholdings[]` row is charged on the **same base**, so two 20% rows are one 40% withholding, not two distinct ones. Two cassa rows would be meaningful (two distinct funds); the UI can grow into it without a payload change.

**Why both arrays are always sent, `[]` included:** they are **full-state** server-side, and an omitted array is indistinguishable from an empty one — both clear it. Sending `[]` is therefore how a cassa is removed.

**Why the amounts are never entered or computed here:** only the inputs are read server-side; every amount is derived on each save. (They are *unlisted* rather than `prohibited`, so echoing a row back from a read is ignored and recomputed, never rejected — a fetch-edit-save round trip needs no stripping.)

**Where:** `InvoicesDetails.svelte` — the `invoice_cassa_withholding_section` `GroupTitle`, `buildCassaPayload`, `buildWithholdingPayload`, `flattenCassaRow`, `flattenWithholdingRow`.

### `subject_to_withholding` on the cassa is a visible field, on purpose

**What:** the per-line flag has no UI (see *Line items editor*), but the cassa's does — a switch with an explanatory hint under it.

**Why:** it is the one place where the server default is wrong for a whole category of users. `true` is correct for the INPS rivalsa (TC22 — it is part of the fee and is withheld), and wrong for a *contributo integrativo*: cassa forense (TC01), commercialisti (TC02) and nearly every other professional fund are not subject to the withholding. Left at the default, a lawyer's invoice would apply the ritenuta to the contribution. There is no safe default, so the form always asks.

**Where:** `InvoicesDetails.svelte` — `cassa_subject_to_withholding` switch + `cassa_subject_to_withholding_hint`.

### Rate inputs are capped at two decimals

**What:** `cassa_rate`, `cassa_taxable_percentage` and `withholding_rate` validate as `0..100` with at most two decimals (`percentageWhen`).

**Why:** a fiscal constraint, not a UI preference. FatturaPA prints `AlCassa` / `AliquotaRitenuta` with exactly two decimals and SDI re-derives the amount from the printed rate, so a third decimal drifts. The backend rejects it too — the client rule only saves the round trip.

**Where:** `InvoicesDetails.svelte` — `percentageWhen`, `cassaWithholdingRules` (applied to both create and update).

### The saved VAT code is displayed from the row's own snapshot

**What:** the cassa's `VatCodeSelector` gets `attr={cassaVatCodeAttr}`, built from the saved row's frozen `vat_code_snapshot`, with `cassaVatCodeChoice` tracking the user's pick.

**Why:** the selector is controlled and renders only what `attr` holds, so without it a saved cassa reloaded as an empty dropdown even though `cassa_vat_code_id` was correct (see [patterns.md](../components/patterns.md) → *Controlled selectors*). The snapshot is also the *right* thing to show: the rate the contribution was computed with, not the code's current one. The snapshot arrives bare on the preview and array-wrapped on the saved invoice — read it through `firstSnapshot()`.

**Where:** `InvoicesDetails.svelte` — `cassaVatCodeAttr`, `cassaVatCodeChoice`.

> ⚠️ **Open with backend:** no default exists for the cassa (neither on the legal entity nor on the customer), so a professional retypes it on every invoice. Deliberately deferred backend-side until real invoices show whether the default belongs to the legal entity or the customer, and whether a practice has one fund or two — tracked in the moddo-api `deferred` doc, with "a charge line named *Contributo INPS* used instead of the cassa" as the signal that retyping got annoying enough to work around. A per-legal-entity `localStorage` default was suggested as an interim; not implemented.

---

## Totals come from the server, including before the first save

**What:** the totals panel shows `net → cassa → tax → total → withholding → payable`, with the cassa, withholding and payable rows hidden when zero, so an invoice without either shows exactly the three rows it always did. The figures come from `displayTotals`, in precedence order: the live **preview**, then the saved record, then the prefill.

The preview is `POST /invoices/preview-amounts`, debounced 400 ms, fired whenever a cassa or a ritenuta is in play **or** the line pricing has moved from its baseline. It returns totals, the computed cassa/withholding rows and the schedule the server *would* generate, without persisting anything.

**Why:** the client must never compute these. The cassa raises the VAT base (`total_tax` and `total_amount` absorb it, `total_net` stays the priced lines alone) and rounding lives server-side; the prefill knows nothing about cassa/ritenuta, since they are entered on this form only. Before the preview endpoint existed, the panel showed stale totals during any edit and `total_payable` was unknowable until the first save. It runs the same calculation code as the save, so previewed figures match saved ones exactly.

**Why a failure is silent:** it falls back to the previous totals. A 403 is expected — see the open point below.

**Naming trap:** the preview calls the document total `amount` (and exposes the VAT base as `taxable`), while the invoice resource calls it `total_amount`; `displayTotals` maps one onto the other.

**Where:** `InvoicesDetails.svelte` — `previewRequest`, `previewTotals`, the debounced `$effect`, `displayTotals`, the `StackedAmountValues` rows.

> ⚠️ **Open with backend:** `POST /invoices/preview-amounts` requires `permission:create-invoices`, but editing a draft only requires `permission:edit-invoices`. A user with edit-but-not-create rights gets a 403 and silently keeps the stale totals while still being able to save. Reported; not yet changed.

### `total_amount` vs `total_payable`

**What:** `total_amount` keeps its meaning — `ImportoTotaleDocumento`, i.e. net + cassa + VAT — and is what the listing, the sidebar and the totals panel's grand total show. `total_payable` (`total_amount − total_withholding`) is what the customer actually transfers, and it is what the due-date schedule is measured against (`dueDatesMatchTotal`, `expectedTotal`).

**Why:** a withholding does not reduce the document total, only what is paid. Anywhere a "netto a pagare" is shown, or a schedule is checked, `total_payable` is the right figure; with no ritenuta the two coincide, which is why the change is invisible on existing invoices. `total_cassa` and `total_withholding` are serialized as decimal **strings** (like `due_dates[].amount`) — coerce before arithmetic.

**Where:** `InvoicesDetails.svelte` — `displayTotals`, `dueDatesTotalRule`; `InvoiceSidebar.svelte` and `InvoicesTable.svelte` keep `total_amount`.

---

## Due-date editor internals

**What:** `InvoiceDueDatesEditor` grabs the parent form context then **immediately clears it**, so child fields (DateField/TextField) don't autowire into the parent form — the editor owns the sync via `syncToForm()`. Row `position` is re-indexed 1-based on transform (even after middle deletions). Dates are normalized to `YYYY-MM-DD` (time stripped) on hydrate and on DateField callback. A running-total indicator next to the header turns red when the entered amounts don't sum to the expected invoice total (2-decimal tolerance) — non-blocking hint during manual entry; the matching hard validation lives in the validator factory and is skipped when the schedule is empty / total unknown / server-managed.

**Why:** The schedule is a quasi-independent sub-form; isolating the form context prevents child fields auto-registering in the parent. 1-indexing and date normalization match the API contract and avoid timezone/time-of-day drift.

**Where:** `InvoiceDueDatesEditor.svelte` — context clear, `syncToForm`, position re-index, date normalization, total indicator + validator factory.

### Default payment method MP05 on new rows

**What:** New due-date rows default `payment_method` to **`MP05`** (bonifico, in the SDI `ModalitàPagamento` codelist); the same value is the fallback when hydrating a row that arrives without a method (`createEmptyItem`, hydrate `$effect`).

**Why:** Deliberate but arbitrary UX default — a neutral preselection so the column's purpose (payment method per due date) reads clearly at a glance. It is **not** derived from the payment term or the customer's commercial terms; don't infer a domain rule from it.

**Where:** `InvoiceDueDatesEditor.svelte` — `createEmptyItem`, re-hydrate `$effect`.

---

## SDI validation UX

**What:** The **Validate** action is a pure check: on success it calls `onValidateSuccess()` (sets a badge) but **not** `onSuccess()` (no refetch). On HTTP 400 with a `violations` array it routes to `onValidateError()` (inline at top of form) instead of a toast. The validated badge renders only in edit mode (`{#if record}`) and only when `validationStatus === 'valid'`. Any field edit (`isDirty`) resets `validationStatus` to `idle`.

**Why:** Refetching would replay the load promise and remount `FormUtil` via `RequestPlaceholder`, causing visible flicker — pointless for a non-mutating check. Structured violations belong inline, not in an ephemeral toast. A prior validation result is stale once the form is edited, so the badge/violations must clear.

**Where:** `invoice-actions.ts` — validate action handler (success/error branches); `InvoicesDetails.svelte` — `isDirty` reset `$effect`, validated-badge guard.

---

## Document date immutability & create→edit redirect

**What:** `document_date` is disabled when editing an existing record, and `buildApiPayload` includes it on create but destructures it out on update (never sent on edit). After a successful create, the route redirects into edit mode for the new invoice ID.

**Why (create→edit):** The document number is assigned server-side; redirecting lets the user review it and proceed to SDI submission.

**Why (immutability):** This is a **backend rule**, not a frontend choice — the document date is fixed by SDI and editing it on update is prohibited (see the `buildApiPayload` comment and the Moddo API business-docs). The frontend just mirrors it by disabling the field and stripping `document_date` from the update payload.

**Where:** `InvoicesDetails.svelte` — `document_date` `disabled={!!record}`, `buildApiPayload` update destructure, `getDetailRoute`.

---

## Status badges

**What:** `InvoiceStateBadge` maps state → icon/color: `accepted` green check, `rejected` red X, `error` yellow alert, `archived` gray archive, everything else (draft/submitted/sent/delivered) a gray dashed circle — `submitted` (the first issued state, handed to SDI) was added to the `InvoiceState` union and falls in this branch. `InvoicePaymentStatusBadge` renders the tri-state **payment** status of an invoice or scadenza (`paid` green check, `partially_paid` amber, `unpaid` gray) and renders **nothing** when the status is `null` (schedule-less invoices, e.g. TD04) so callers can pass it straight through. `InvoiceableDocumentStatusBadge` picks its metric by source type: sales order → `fulfillment_status` (fully_shipped→active, partially_shipped→in-progress, picked→paused, else neutral); transport document → `invoicing_status` (full→active, partial→in-progress, else neutral); renders nothing if both are null.

**Why:** Quick visual recognition of SDI status / invoice-readiness. Each source document type exposes a different readiness metric.

**Where:** `InvoiceStateBadge.svelte`; `InvoicePaymentStatusBadge.svelte`; `InvoiceableDocumentStatusBadge.svelte`. Labels/variants in `enum-labels.ts` (`invoicePaymentStatusLabels`, `invoicePaymentStatusVariantConfig`).

---

## Filters

**What:** The invoice **state** filter options are generated by iterating `invoiceStateLabels` (no hard-coded state list). A **payment_status** filter (single-select `enum`, options from `invoicePaymentStatusLabels`) was added to both the invoices listing and the *Da incassare* payments listing; the backend matches one status and never returns schedule-less invoices for any value. The invoiceable-documents **document_type** filter is rendered in the UI but **not yet wired to the backend** (TODO). Date-range filters apply `dayBoundary: 'startOf'` to `*_from` (00:00:00) and `'endOf'` to `*_to` (23:59:59) for inclusive day-level filtering.

**Why:** Enum-driven options auto-track backend states. The document_type filter is UI-only because the backend doesn't support it yet — keep the TODO visible. Boundary handling makes calendar-day ranges inclusive.

**Where:** `InvoicesFilters.svelte` (state + payment_status); `PaymentsFilters.svelte` (payment_status); `InvoiceableDocumentsFilters.svelte` (document_type TODO comment). See `.blueprints/components/table-filters.md` for the generic filter system.

---

## Disabled feature: import date range

**What:** `IMPORT_DATE_RANGE_ENABLED = false` hides the ImportDateRange picker (which, when enabled, defaults to current-month bounds and filters prefillable documents by date). Infrastructure is kept in place.

**Why:** Built for end-of-month recap invoices but parked pending a UX/business decision. Leave the flag and code; don't delete.

**Where:** `InvoicesDetails.svelte` — `IMPORT_DATE_RANGE_ENABLED` flag + conditional render.

---

## Customer commercial terms → default VAT

**What:** Selecting a customer fetches their commercial terms and extracts the default VAT code (`commercialTermsVatCode`), suggested when adding new line-item rows. Clearing the customer resets it to `undefined` and triggers no fetch.

**Why:** Most of a customer's lines share one VAT rate; auto-suggesting it cuts manual input. A stale VAT code must not carry over to the next customer.

**Where:** `InvoicesDetails.svelte` — commercial-terms fetch on customer change, reset on clear.

---

## Chat filter tool gotchas

**What:** `invoices-filter.ts` writes date params in **ISO boundary format** (startOf/endOf) directly to `URLSearchParams`, not as plain `YYYY-MM-DD`, and updates the URL via `goto(url, { replaceState: true })` rather than the shallow `replaceState` from `$app/navigation`.

**Why:** `FilterDropdown` deserializes to `CalendarDate` then re-serializes to ISO; writing a plain literal would fail the round-trip and make `replaceState` fire in an infinite loop (`effect_update_depth_exceeded`). Only a real `goto()` navigation re-runs the page load and updates `page.url`, which is the source of truth for the filters and table; shallow `replaceState` wouldn't propagate.

**Where:** `invoices-filter.ts` — `setDateParam`, the `goto` call (both have explanatory comments).

---

## Submit / resubmit are mutually exclusive

**What:** Submit and resubmit are separate buttons gated by `availableTransitions`; at most one renders at a time.

**Why:** The backend's transition logic decides which action is valid; the frontend queries `availableTransitions` and shows the matching button.

**Where:** `InvoicesDetails.svelte` — submit/resubmit conditional renders.
