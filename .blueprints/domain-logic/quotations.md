# Quotations — Frontend Special Cases

Frontend-specific quirks, conditional behaviors, and non-obvious UX logic for the **quotations** feature. Documents the *why* behind special cases that look arbitrary in code — **not** a how-to guide, and excludes backend business rules.

Scope: presentation, form behavior, state transitions, and client-side validation UX. No line numbers (they drift) — references point to files + symbols.

Quotations are the **source** of the import chain: they get imported into sales orders (and their items flow onward to invoices). See `.blueprints/domain-logic/sales-orders.md` for the consuming side.

Main files:
- `src/lib/components/features/quotations/QuotationDetails/default/QuotationDetails.svelte` — create/edit form
- `src/lib/components/features/quotations/quotation-actions.ts` — record actions (approve/reject/reopen/toggle-sent/archive)
- `src/lib/components/features/quotations/QuotationStatusBadge.svelte` + `QuotationTagBadges.svelte` — badges
- `src/lib/components/features/form/QuotationItemsListEditor.svelte` — shared line-items editor (**internals documented separately** in `.blueprints/components/quotation-items-list-editor.md`)
- `src/lib/components/features/common/Filters/QuotationsFilters.svelte`, `src/lib/components/features/globals/sidebars/QuotationSidebar.svelte`

---

## Editability is gated by state

**What:** The whole form goes read-only (`locked` on `FormUtil`) unless `state === 'open'`. Once `approved` / `rejected` / `superseded`, only state transitions are allowed — no direct field edits, import section hidden, no save button. `document_number` shows disabled in edit mode and doesn't render at all on create.

**Why:** Non-open quotations are finalized; changes happen only through the state machine. Document numbers are server-assigned.

**Where:** `QuotationDetails.svelte` — `isReadOnly`/`locked`, `document_number` guard.

> Same state-gating pattern as invoices and sales orders (each uses its own "editable state": invoices `draft`/`rejected`, quotations & sales orders `open`).

---

## Create vs. edit validation differ

**What:** Create validates the full document (`document_date`, `sales_transaction_type`, `customer_id`, `currency`, `valid_from`, `valid_to`, `incoterm`, `composition`). Edit validates only `composition`. `document_number` is stripped from the update payload (`toQuotationRequest` destructures it out).

**Why:** An existing quotation should allow minimal edits (composition tweaks) without re-validating immutable fields. The API rejects updates that include `document_number`, so it must be stripped.

**Where:** `QuotationDetails.svelte` — `validateCreate`/`validateUpdate`, `toQuotationRequest`.

---

## Sales transaction type is filtered by document kind

**What:** `getSalesTransactionTypeItemsFor('quotation', currentValue)` returns only whitelisted "forward" transaction types (`FORWARD_SALES_TRANSACTION_TYPES`). If the current record's value isn't in the whitelist (a legacy code), that value is appended so the selector doesn't flag a validation error.

**Why:** Quotations only allow forward sales types (not returns, etc.). Legacy documents may carry retired codes — preserving them avoids breaking existing data.

**Where:** `src/lib/utils/enum-labels.ts` — `getSalesTransactionTypeItemsFor`. Shared with sales orders (`'sales_order'` kind).

---

## Customer selection drives defaults

**What:** Choosing a customer (`handleCustomerChange`) fetches their commercial terms (default VAT code, payment composition, incoterm, trade discount), caches them locally, and uses them to prefill the composition and line-item defaults. It also **clears** `ship_to_address_id` and `contact_person_id` (they belong to the previous customer).

**Why:** Quotations inherit the customer's standard terms as defaults; addresses/contacts are customer-scoped and would be invalid after a switch.

**Where:** `QuotationDetails.svelte` — `handleCustomerChange`, commercial-terms fetch/cache.

### Composition editor is remounted, not patched

**What:** When commercial terms arrive (or any external composition set), `compositionKey++` forces the `{#key}` block to remount `PaymentCompositionEditor` for a clean hydrate.

**Why:** The editor is sensitive to initial-value changes; remounting resets internal state cleanly instead of patching it.

**Where:** `QuotationDetails.svelte` — `compositionKey`. See `.blueprints/components/payment-composition.md`.

---

## Line items: view-level bits only

The line-items editor internals (delivery-date key mapping, `toLocalISOString`, default propagation with user-override detection, `_groupId` color coding, locked rows, charge handling, `syncFromForm={false}`) are documented in **`.blueprints/components/quotation-items-list-editor.md`** — don't duplicate them here.

Quotation-specific configuration of that editor:

**What:** Quotations pass `deliveryDateKey="delivery_date"` (sales orders use `confirmed_delivery_date`) and render the delivery-date columns (`showDeliveryDates`). Items are `required` on create, not on edit.

**Why:** Quotations track a requested delivery date per line; the shared editor normalizes internally to `delivery_date` and maps to the correct API field on output. A new quotation needs at least one line to be valid.

**Where:** `QuotationDetails.svelte` — editor props.

---

## Snapshot shapes: array or object

**What:** Customer, ship-to-address, and contact-person snapshots may arrive as either an **array** (legacy) or an **object** (current). Derived getters (`customerAttr`, `shipToAddressAttr`, `contactPersonAttr`) try `.length > 0` (take `[0]`) then fall back to direct object access, returning `undefined` if missing. Same dual-shape handling in `QuotationsTable` (customer column) and the sidebar.

**Why:** The **array is the canonical shape** — both the FE type (`customer_snapshot: Record<string, unknown>[]` in `api-types.ts`) and the live OpenAPI schema declare every snapshot as `array`/`mixed[]` (`customer_snapshot`, `ship_to_snapshot`, `contact_person_snapshot`, `legal_entity_snapshot`, and item-level `item_snapshot`/`vat_code_snapshot`/`payment_composition_snapshot`). This is a systematic API convention (snapshots serialized as a collection, Laravel API Resource style), so taking `[0]` is the correct path. The **object branch is the defensive fallback** — it guards against the runtime occasionally returning a bare object instead of the declared array.

**Do NOT drop the object branch** as "legacy": it's the guard, not the array. Only simplify if you first confirm the backend never returns a bare object for these fields.

**Where:** `QuotationDetails.svelte` — the three `$derived.by` snapshot getters; `QuotationsTable.svelte` customer renderer. Contract: `src/lib/types/api-types.ts` (`Quotation`) + Moddo API `Quotations` group schema.

---

## Actions & state transitions

**What:** `approve` / `reject` / `reopen` render only when the backend lists them in `availableTransitions`. `toggle-sent` is visible only when `state === 'open'`. `reject` uses `confirmationVariant: 'destructive'` (red); `approve` is neutral. `archive` is visible only when `record.is_archivable === true`.

**Why:** The backend owns the state machine; the frontend mirrors it. The sent flag is only meaningful pre-finalization. Reject is consequential, so it gets a destructive confirmation. Archivability depends on backend state / linkage (e.g. quotations linked to active orders aren't archivable).

**Where:** `quotation-actions.ts` — action `visible` predicates and `confirmationVariant`.

---

## Status & tag badges

**What:** `QuotationStatusBadge`: `approved` → green check, `rejected` → red X, everything else (`open`/`superseded`) → gray dashed circle. In `QuotationsTable` the status column maps `approved` → `success`, `rejected` → `error`, else `default`. `QuotationTagBadges`: `expired` → `blocked` (warning) variant, `sent` → `active` (success) variant.

**Why:** Terminal states need visual distinction; expired quotations demand attention (customer can no longer accept), sent is positive.

**Where:** `QuotationStatusBadge.svelte`, `QuotationTagBadges.svelte`, `QuotationsTable.svelte`.

---

## Page-state lifecycle

**What:** On create/update success, `onUpdated` stores the record via `quotationHandle.set(data)`, updates the breadcrumb with the document number, and refetches commercial terms if the customer changed. On unmount, `cleanup()` calls `quotationHandle.unset()` and clears the breadcrumb.

**Why:** The sidebar and other page snippets read the quotation from shared page state; storing it keeps them in sync without duplicate fetches. Unsetting prevents stale data bleeding into the next page.

**Where:** `QuotationDetails.svelte` — `onUpdated`, `cleanup`.

---

## Sidebar

**What:** Shows "New Quotation" when there's no record and no UUID param; document number + status + tags when loaded; skeletons while pending. The submenu currently exposes only an "overview" link — a "documents" link is commented out.

**Why:** Clear create/edit/loading feedback. The documents endpoint isn't implemented yet; the placeholder is intentional.

**Where:** `QuotationSidebar.svelte`.

---

## Default dates initialized in UTC (known latent bug — fix pending)

**What:** Default `document_date` and `valid_from` are initialized to `new Date().toISOString()` (UTC), whereas line-item dates deliberately use local-time serialization (`toLocalISOString`). This is an **inconsistency, not a deliberate choice**: near midnight in a positive-offset timezone (CET/CEST) the UTC default shifts the calendar day back by one. The same buggy default exists in the invoices and sales-orders forms.

**Fix:** extract a shared `todayLocalISO()` / `toLocalISOString()` in `$lib/utils/date.ts` and use it for these defaults — full spec + tests + migration checklist in **`.blueprints/components/date-handling.md`**.

**Where:** `QuotationDetails.svelte` — default value initialization (also `InvoicesDetails.svelte`, `SalesOrderDetails.svelte`).
