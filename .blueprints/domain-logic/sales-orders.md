# Sales Orders — Frontend Special Cases

Frontend-specific quirks, conditional behaviors, and non-obvious UX logic for the **sales orders** feature. Documents the *why* behind special cases that look arbitrary in code — **not** a how-to guide, and excludes backend business rules. No line numbers (they drift) — references point to files + symbols.

Sales orders sit in the middle of the import chain: they **import quotations** (the source) and feed **invoices** (the consumer). See `.blueprints/domain-logic/quotations.md` and `.blueprints/domain-logic/invoices.md`.

Sales orders share a large surface with quotations (commercial-terms defaults, payment composition, snapshot dual-shape, state-gated editing, `document_number` immutability, badge mapping). Those shared cases are documented once in **quotations.md**; this file cross-references them and focuses on what's **different** — chiefly the quotation-import flow and fulfillment.

Main files:
- `src/lib/components/features/sales-orders/SalesOrderDetails/default/SalesOrderDetails.svelte` — create/edit form + import flow
- `src/lib/components/features/sales-orders/sales-order-actions.ts` — record actions
- `src/lib/components/features/sales-orders/SalesOrderStatusBadge.svelte`, `SalesOrderFulfillmentBadge.svelte`, `SalesOrderTagBadges.svelte`
- `src/lib/components/features/form/SalesOrderItemsListEditor.svelte` — thin wrapper over the shared `QuotationItemsListEditor`
- `src/lib/components/features/common/Filters/SalesOrdersFilters.svelte`, `src/lib/components/features/globals/sidebars/SalesOrderSidebar.svelte`

---

## Shared with quotations (see quotations.md)

These behave identically to quotations — read `.blueprints/domain-logic/quotations.md` for the full rationale:

- **Editability gated by state** — the form locks unless `state === 'open'`; save button hidden otherwise. (`isReadOnly`, save-button guard)
- **Create vs. edit validation** — `validateCreate` (document_date, sales_transaction_type, customer_id, currency, composition) vs. `validateUpdate` (composition only); `document_number` stripped from the PUT payload.
- **Sales transaction type filtering** — same `getSalesTransactionTypeItemsFor` whitelist + legacy-value preservation, with `'sales_order'` kind.
- **Customer selection** — fetches/caches commercial terms, clears `ship_to_address_id` + `contact_person_id`.
- **Composition editor remount** — `compositionKey++` + `{#key}`. Default composition for a new order is a single `saldo` row at 100% (`[{ position: 1, percentage: 100, type: 'saldo', payment_term_id: '' }]`).
- **Snapshot dual-shape (array/object)** — customer, ship-to, contact **and** `legal_entity_bank_snapshot` (`bankAttr`); same handling in `SalesOrdersTable`.
- **Status badge** — `approved` green check, `rejected` red X, `open` gray dashed circle (variant always `outline`).
- **Page-state lifecycle & sidebar skeletons** — same handle set/unset + create/loading branches.

The rest of this file is sales-order-specific.

---

## Quotation import flow

The headline feature. A sales order is assembled by importing one or more **approved** quotations.

### Which quotations are eligible

**What:** The import fetch hardcodes `state: 'approved'` and `conversion_status: 'none,partial'`, requests `per_page: '200'`, and injects current form filters (`customer_id`, `ship_to_address_id`, `incoterm`) — empty fields omitted.

**Why:** Only approved, not-fully-converted quotations can become orders (backend import rule). The high `per_page` avoids a false "incompatible" verdict: the client-side compatibility lock evaluates the returned pool, so a compatible record hidden on page 2 would be wrongly excluded. Form filters pre-narrow to compatible customers/addresses.

**Where:** `SalesOrderDetails.svelte` — importable-quotations fetch.

### Compatibility locking by composition signature

**What:** Quotations whose payment-composition **signature** differs from the form's current composition are locked (disabled) in the picker — **except** while the form composition is still the unpinned default (no terms chosen), which lets a fresh order import its first quotation and anchor the composition.

**Why:** Once an order commits to a set of payment terms, importing a quotation with a different structure would create an inconsistent document. The empty/default composition is special-cased so the first import can define the anchor.

**Where:** `SalesOrderDetails.svelte` — composition-signature lock predicate. See `compositionSignature` in `src/lib/utils/payment-composition.ts` and `.blueprints/components/payment-composition.md`.

### Header from first record, lines from all

**What:** When importing multiple quotations, only the **first** record's header (customer, ship-to, contact, currency, composition, incoterm, notes) is applied to the form, plus its selector snapshots. Subsequent records contribute line items only. Items are deduplicated against the editor by `quotation_item_id` (re-importing is idempotent).

**Why:** The header must be anchored by one source to stay consistent; lines accumulate. Dedup lets the user run the import multiple times without creating duplicate rows.

**Where:** `SalesOrderDetails.svelte` — import apply logic. (Same first-record-anchors-header pattern as cumulative invoices.)

### Imported quantity uses importable amount, zero-clamped

**What:** Imported line quantity is `importable_into_sales_order_quantity` (only populated on the single-resource GET). Items with a value `<= 0` are skipped entirely.

**Why:** Prevents re-importing quotation lines already fully converted to orders. The backend reports the remaining importable quantity per line.

**Where:** `SalesOrderDetails.svelte` — import quantity mapping.

### Selector snapshots pre-populated in create mode

**What:** Three import snapshot stores (`customerSnapshotImport`, `shipToSnapshotImport`, `contactPersonSnapshotImport`) are filled during import. The `*Attr` getters read the record snapshot in edit mode, falling back to the import snapshot in create mode.

**Why:** In create mode there's no record snapshot yet; pre-populating lets selectors show names immediately instead of blank/loading states.

**Where:** `SalesOrderDetails.svelte` — import snapshot stores + `*Attr` getters.

### Refetch after import

**What:** The import success callback calls `detail.refetch()`.

**Why:** The backend recomputes derived fields (totals, VAT summary) from the added lines; refetch syncs the UI to server state.

**Where:** `SalesOrderDetails.svelte` — import `onimport` success.

---

## Line items: sales-order configuration

Editor internals live in `.blueprints/components/quotation-items-list-editor.md`. Sales-order-specific:

**What:** `SalesOrderItemsListEditor` passes `deliveryDateKey="confirmed_delivery_date"` (quotations use `delivery_date`) and `refreshKey={record?.version}`. When `refreshKey` changes (e.g. after save), the editor re-hydrates items from the form context after a 100ms delay. Items are `required` only on create (`required={!record}`).

**Why:** Sales orders track a *confirmed* delivery date; the shared editor normalizes to `delivery_date` internally and maps to the API key on output. Re-hydration on version bump keeps the editor showing the latest server state after a save.

**Where:** `SalesOrderItemsListEditor.svelte` — props; `QuotationItemsListEditor.svelte` — `refreshKey` effect.

### The 100ms re-hydration delay

**What:** In the `refreshKey` effect, when `refreshKey` (`record.version`) changes the editor re-reads `form.values[name]` **inside `setTimeout(…, 100)`** rather than synchronously.

**Why:** Confirmed workaround for a **race condition** — when the effect fires (version bumped after save/refetch), `form.values[name]` doesn't yet hold the fresh server data; it's populated by a separate reactive flow. The delay defers the read until the form context has settled. The exact race was never annotated, and 100ms is a timing bet, not a value tied to a concrete signal.

**Fragile — fix candidate:** if the settle takes >100ms (slow device, large payload) the editor re-hydrates stale data; if less, it's dead latency. The proper fix is to react to the actual "form context updated" signal instead of a magic delay. Treat this as tech debt, not a pattern to copy.

**Where:** `QuotationItemsListEditor.svelte` — `refreshKey` `$effect`.

### Items required only on create

**What:** `required={!record}` — line items are required on create, but the requirement is off in edit mode, so the frontend lets you save a sales order with no rows.

**Why:** Intentionally lax. In edit mode the form validates only a minimal set (composition + a few fields) and delegates the "must have items" rule to the backend, which rejects an empty order. Consistent with the invoices and quotations forms. Not an oversight — but making the three forms explicitly consistent (or moving the guard into the editor) is a possible future cleanup, not a current requirement.

**Where:** `SalesOrderDetails.svelte` — `SalesOrderItemsListEditor` `required` prop.

---

## Actions & state transitions

**What:** `approve` / `reject` / `reopen` render only when present in `available_transitions`. `toggle-sent` is visible only when `state === 'open'`. `archive` checks `record.is_archivable`.

**Why:** Same as quotations — backend owns the state machine and archivability; the sent flag is only meaningful while open.

**Where:** `sales-order-actions.ts` — action `visible` predicates.

---

## Fulfillment badge & tags

**What:** `SalesOrderFulfillmentBadge` maps `fully_shipped` → `active` (green), `partially_shipped` → `in-progress` (orange), `picked` → `paused` (blue), else `neutral`; renders **nothing** when `fulfillmentStatus` is null. `SalesOrderTagBadges` maps `sent` → `active`, `payment_pending` → `paused`, `requires_direct_invoicing` → `alert` (default `active` for unknown tags).

**Why:** A null fulfillment status means the order hasn't entered fulfillment tracking, so nothing is shown. Different tags carry different urgency.

**Where:** `SalesOrderFulfillmentBadge.svelte`; `SalesOrderTagBadges.svelte` (variants in `src/lib/utils/enum-labels.ts`).

---

## Confirmation date

**What:** The `confirmation_date` field renders only when `record?.confirmation_date` has a value (as a disabled field). The sidebar shows a "confirmed_on" muted line when the date exists and is parseable; if `isNaN(date.getTime())` it's silently omitted (`confirmedOnLabel` returns null).

**Why:** Confirmation date is set by backend transitions (approve/reject/reopen), never user input, so it only appears once populated. Guarding against unparseable dates avoids rendering "Invalid Date".

**Where:** `SalesOrderDetails.svelte` — `confirmation_date` conditional; `SalesOrderSidebar.svelte` — `confirmedOnLabel`.
