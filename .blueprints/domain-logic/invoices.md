# Invoices — Frontend Special Cases

Frontend-specific quirks, conditional behaviors, and non-obvious UX logic for the **invoices** feature. This file documents the *why* behind special cases that look arbitrary in the code — it is **not** a how-to guide and deliberately excludes backend business rules (for those, consult the Moddo API business-docs).

Scope: presentation, form behavior, import/prefill flow, and client-side validation UX. Line numbers are intentionally omitted (they drift) — references point to files + symbols.

Main files:
- `src/lib/components/features/invoices/InvoicesDetails/default/InvoicesDetails.svelte` — the create/edit form (the bulk of the logic)
- `src/lib/components/features/invoices/invoice-actions.ts` — record actions (validate, submit, delete, archive)
- `src/lib/components/features/form/InvoiceDueDatesEditor.svelte` — due-date schedule sub-editor
- `src/lib/components/features/form/InvoiceItemsListEditor.svelte` — line items editor
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

**What:** If the user changes the payment term after prefill (`paymentTermMismatch`) **or** the invoice is cumulative, `dueDatesServerManaged` becomes true: the due-date editor is hidden, `due_dates: []` is posted, and the schedule-total validation is skipped. The backend regenerates the schedule from the merged lines + term. The payment-term selector also lazy-loads the term name from a snapshot (the saved invoice ships only the term ID), syncing on choose.

**Why:** The schedule is a derived output of payment term + invoice total. When the term changes or sources are merged, the current schedule is invalid and the client can't recompute the merged result — regenerating server-side is simpler and authoritative.

**Where:** `InvoicesDetails.svelte` — `paymentTermMismatch`, `dueDatesServerManaged`, payment-term snapshot fetch; payload `due_dates: []` branch.

### Payment slice field remap

**What:** The form uses `slice_type` / `slice_position`; the API uses flat `payment_slice_type` / `payment_slice_position`. Remapped on load and on save. For `saldo` sources, `payment_slice_position` is always `null`; for acconto/SAL it must be a number addressing the specific unpaid slice.

**Why:** The form treats the slice as a lean pointer, while the API/backend use flat field names. Saldo sources have no slice concept; acconto/SAL are single-slice and need the position.

**Where:** `InvoicesDetails.svelte` — `buildApiPayload` remap, load-time remap.

---

## Schedule freeze after a recorded payment

**What:** once an invoice has at least one recorded payment (`payment_status` is `partially_paid` or `paid`), `scheduleFrozen` is true and the form locks the schedule: the `InvoiceDueDatesEditor` and the `PaymentTermSelector` render **disabled** with a notice (`invoice_schedule_frozen_notice`), and `buildApiPayload` **omits** `due_dates` and `payment_term_id` from the PUT entirely. `payment_status` is `null` for schedule-less invoices and `unpaid` before the first payment — neither freezes.

**Why:** the backend freezes the schedule after the first payment — sending `due_dates[]` (even empty, which would otherwise trigger regeneration) or a changed `payment_term_id` on PUT returns 422 (see moddo-api `deferred` -> *"Invoice payments — manual recording only"*). Omitting both fields keeps an edit valid. In practice only a **`rejected`** invoice reaches the editable form while frozen — issued states are already fully read-only via `isReadOnly` (see *Editability is gated by invoice state*). Unfreeze = delete the payments from the payments subpage.

**Where:** `InvoicesDetails.svelte` — `scheduleFrozen`, `buildApiPayload` (`due_dates` / `payment_term_id` omission, frozen wins over the `dueDatesServerManaged` branch), `PaymentTermSelector disabled`, `InvoiceDueDatesEditor disabled` + frozen `Alert`. The distinct `dueDatesServerManaged` branch *regenerates* the schedule; freeze *suppresses* it — see *Payment term & due-date schedule sync* above.

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

**Where:** `InvoicesDetails.svelte` — `isItemLocked`, items `required` prop, `mapItemsToInvoicePayload` / `mapItemsToEditorShape`.

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
