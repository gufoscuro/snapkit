# Supplier Invoices (fatture ricevute) — Frontend Special Cases

Frontend-specific quirks and non-obvious UX logic for **received invoices** — the passive cycle: invoices suppliers send through SDI, ingested by the backend from A-Cube. The tenant never creates or edits them; it **links** them to a supplier, **reviews the payment schedule**, and **records payments**. This file documents the *why* behind special cases; backend rules (matching, uniqueness, versioning) are only described through their presentation consequence — for the rules themselves see the moddo-api OpenAPI groups *Supplier Invoices* / *Supplier Invoice Payments*.

Mirror of the issued side ([invoices.md](./invoices.md)): the same payment-per-scadenza model and the same shared payment components, with payable wording. The cross-invoice list **Da pagare** is an actionable and lives in [actionables.md](./actionables.md).

Line numbers are intentionally omitted (they drift) — references point to files + symbols.

Main files:
- `src/lib/components/features/supplier-invoices/SupplierInvoicesTable/default/SupplierInvoicesTable.svelte` — the list
- `src/lib/components/features/supplier-invoices/SupplierInvoiceDetails/default/SupplierInvoiceDetails.svelte` — read-only overview + supplier link (aggancio)
- `src/lib/components/features/supplier-invoices/LinkSupplierDialog.svelte` — link / change supplier
- `src/lib/components/features/supplier-invoices/SupplierInvoicePayments/default/SupplierInvoicePayments.svelte` — "Scadenze e pagamenti" subpage
- `src/lib/components/features/supplier-invoices/SupplierInvoiceDocumentsTable/default/SupplierInvoiceDocumentsTable.svelte` — user uploads
- `src/lib/components/features/supplier-invoices/supplier-invoice-actions.ts` — API calls + guards (`isSupplierDueDatePayable`, `canEditSupplierDueDates`, `cedenteName`, `toastUnmappedValidationErrors`)
- `src/lib/components/features/supplier-invoices/format.ts` — `formatCalendarDay`, `flattenValues`
- `src/lib/components/features/supplier-invoices/supplier-invoice-schema.ts` — page-state schema shared by the detail, its subpages and the sidebar
- `src/lib/components/features/supplier-invoices/SupplierInvoiceStatusBadge.svelte` + `SupplierInvoiceFlagBadges.svelte` — status and anomaly badges
- `src/lib/components/features/globals/sidebars/SupplierInvoiceSidebar.svelte` — header + subpage menu
- `src/lib/components/features/common/Filters/SupplierInvoicesFilters.svelte` — list filters
- Scaffold: `admin-config.ts` — pages `supplier-invoices` → `supplier-invoice-details` → `supplier-invoice-payments` / `supplier-invoice-documents`, menu entries under `invoicing`

**Local test data:** the api repo has `SupplierInvoiceDemoSeeder` (manual: `docker compose exec php php artisan db:seed --class=SupplierInvoiceDemoSeeder`, re-runnable). It seeds one received invoice per case below — every aggancio outcome, every status, every anomaly, partial/full payments, a TD04, a USD invoice, an invoice without schedule.

---

## Status is derived, and "Nuova → Vista" happens on open

**What:** `status` is `to_link` (no supplier) → `new` (linked, never opened) → `viewed`. `SupplierInvoiceDetails` fetches with `GET` and, **only when the status is `new`**, fires `POST …/view` in the background (`markViewed`). From its response it copies **only** `status` / `viewed_at` / `viewed_by` onto the loaded record. Failures are swallowed.

**Why:** the backend no-ops `view` on `to_link` and `viewed`, so firing it unconditionally would be a wasted write on every open. GET stays the source of the full record (lines, schedule, attachments); the view call only flips the status, so merging just those fields avoids replacing a complete record with whatever the action returns. A failed view is harmless — the invoice simply stays "Nuova" — so it doesn't deserve an error toast. Only the overview marks as viewed: opening the payments or documents subpage directly does not.

**Where:** `SupplierInvoiceDetails.svelte` — `fetchInvoice`, `markViewed`, `setInvoice`.

## Who sent it: supplier, or the cedente while still to link

**What:** wherever a row needs a counterpart name (list identity cell, sidebar, "Da pagare"), it shows `supplier.name` and falls back to the **cedente** (`cedenteName(cedente_snapshot)`: company `name`, else `first_name last_name`).

**Why:** a `to_link` invoice has no supplier yet, but the user still has to recognise it. The cedente is who the XML says sent it. A natural person (professional) has no company name, only first/last name.

**Where:** `cedenteName` in `supplier-invoice-actions.ts`; used by `SupplierInvoicesTable` (identity column via `RecordCustomerCell`), `SupplierInvoiceSidebar`, `SupplierPaymentsTable` (`supplier_name || cedente_name`).

## Supplier link (aggancio) — the four actions

**What:** the overview's *Fornitore* section has two shapes:
- **`to_link`**: explanation alert + up to three actions — **Crea fornitore**, **Collega a fornitore**, **Riprova aggancio**. All are hidden without `edit-supplier-invoices`; *Crea fornitore* additionally needs `create-suppliers`.
- **linked**: the supplier name (link to `supplier-details`) + **Cambia fornitore** (same dialog as *Collega*), shown with `edit-supplier-invoices`.

The two in-place actions keep their own `busyAction` state (they live outside any form, so `ActionButton` gets no auto-busy).

**Why:** the permission split mirrors the backend middleware (create-supplier requires both permissions; link/relink only `edit-supplier-invoices`). Hiding is a convenience, the backend still answers 403. Changing supplier reuses the link endpoint and, per the backend contract, never touches due dates or payments — that's why it is offered freely on an already linked invoice.

**Where:** `SupplierInvoiceDetails.svelte` — `canEdit` / `canCreateSupplier` / `canUpdateIdentifiers` (via `hasPermission`, see [patterns.md](../components/patterns.md#permission-gated-ui-haspermission)), `handleCreateSupplier`, `handleRelink`, `handleLinked`, `busyAction`.

### "Crea fornitore" 422 → open "Collega"

**What:** when `create-supplier` answers 422, the overview toasts the backend message and **opens the link dialog** right away.

**Why:** the 422 means a supplier — **archived ones included** — already holds the cedente P.IVA/CF, so creating is impossible and linking is the only way forward. Note the archived case: the backend ignores archived suppliers when matching, yet counts them for uniqueness. The link picker can't offer an archived supplier either, so the user has to restore it from the supplier list or link a different supplier.

**Where:** `handleCreateSupplier` (`ApiError` 422 branch → `linkDialogOpen = true`).

### "Riprova aggancio" shows why it failed

**What:** after `relink`, if the invoice is still `to_link` the overview shows a destructive alert with the outcome from `match` — `no_candidate` / `multiple_candidates` / `contradiction` (labels in `supplierInvoiceMatchOutcomeLabels`). Otherwise it toasts success. The outcome lives in local state (`matchOutcome`) and clears on any successful link.

**Why:** a failed relink changes nothing visible, so without the reason the button looks broken. `match` only exists on the relink response (it is not stored on the invoice), hence local state rather than a record field. Besides the three failures, `match` can be `matched` or `null` (a concurrent link got there first). Both mean "now linked", which the status check already covers. If the invoice is still `to_link` but `match` is missing, the alert defaults to `no_candidate`. An unlabelled value is shown raw.

**Where:** `handleRelink`, `matchOutcomeLabel`; type `SupplierInvoiceMatchOutcome` in `api-types.ts`.

### The link dialog

**What:** `LinkSupplierDialog` reuses `SupplierSelector` but passes its own `fetchFunction` against `GET /legal-entities/{le}/suppliers`. The current supplier is preselected via `attr` when changing. A switch **"Aggiorna P.IVA/CF del fornitore"** appears only with `edit-suppliers` and only if the cedente carries identifiers; `update_identifiers` is sent only when the switch is on.

**Why:** `SupplierSelector`'s default fetch still targets the legacy supply API (`supply/supplier`), not the legal-entity suppliers. The list endpoint excludes archived suppliers, which is exactly the rule "picker only non-archived". Without `edit-suppliers` the backend 403s on `update_identifiers`, so the switch would only produce errors.

**Where:** `LinkSupplierDialog.svelte` — `fetchSuppliers`, `currentSupplier`, `identifiers`, `handleSubmit`.

## 422s on keys the form doesn't render are toasted

**What:** the link dialog and the schedule form wrap their submit with `toastUnmappedValidationErrors(err, renderedFields)` before rethrowing to `FormUtil`. It toasts the first message of every 422 key **not** among the fields the form renders (or the plain `message` when there is no `errors` map).

**Why:** `FormUtil` maps 422s onto field errors by key, so a business-rule error keyed elsewhere would leave only the generic "validation error" banner. Examples: `supplier_invoice` (TD04 / payments present), `due_dates.0.amount` (the editor only shows `due_dates`), `update_identifiers` ("P.IVA già di un altro fornitore" — the switch has no error slot). The reusable pattern is in [forms.md](../components/forms.md#422-errors-on-keys-the-form-doesnt-render).

**Where:** `toastUnmappedValidationErrors` in `supplier-invoice-actions.ts`; callers `LinkSupplierDialog.handleSubmit` (`['supplier_id']`), `SupplierInvoicePayments.saveSchedule` (`['due_dates']`).

## The overview is read-only and renders free-form XML data defensively

**What:** no form, no save: header (number, status, payment badge, anomaly badges), aggancio, anomalies, cedente, totals, lines, references, embedded attachments, and a bottom bar with XML/PDF download. Cedente address/REA/contacts, line `item_codes` / `discounts` and order/DDT references are rendered through `flattenValues` — non-empty scalar values joined with ` · `, nested objects flattened.

**Why:** a received invoice is the supplier's document, stored as sent — nothing on it is editable except the link and the schedule (which has its own subpage). These sub-objects mirror FatturaPA and the OpenAPI types them as plain `object`/`array`, so their keys are not a contract we can rely on. Flattening shows whatever is there instead of breaking on a renamed key.

**Where:** `SupplierInvoiceDetails.svelte`; `flattenValues` in `format.ts` (unit-tested).

### Totals: withholding and split payment only when non-zero

**What:** taxable, VAT and total always show. **Ritenuta** and **IVA in split payment** appear (as negatives) only when non-zero. **Netto a pagare** closes the block in bold, and is also the figure shown in the list and the sidebar.

**Why:** `net_payable` is what actually gets paid (total − withholding − split payment). It is also the figure the schedule is checked against (see the mismatch below). Showing zero rows for regimes that rarely apply would be noise.

**Where:** `SupplierInvoiceDetails.svelte` — totals `GroupTitle`, `isNonZero`.

### Embedded attachments ≠ documents

**What:** files embedded in the XML (`attachments[]`, downloaded by `index`) are listed read-only on the overview. User uploads live in the **Documenti** subpage (`SupplierInvoiceDocumentsTable` → the shared `DocumentsTable`).

**Why:** two different things — the former is part of the fiscal document (immutable, fetched from A-Cube on demand), the latter is the generic polymorphic `documents` resource every entity has (see the `{entity}-documents` convention: they are files, not other documents).

**Where:** overview attachments section (`downloadAttachment`); `SupplierInvoiceDocumentsTable.svelte`.

### Downloads go through A-Cube

**What:** XML, PDF (`?download=true`) and embedded attachments are downloaded with `apiDownload`. Failures surface as an error toast.

**Why:** the backend fetches these from A-Cube on demand. On a local stack without A-Cube (seeded invoices) every download fails, and that is expected — not a frontend bug.

**Where:** `SupplierInvoiceDetails.svelte` — `DownloadActionMenu` items, `downloadAttachment`.

### `{@const inv = invoice}` in the markup

**What:** inside `{#if invoice}` the markup immediately re-binds `{@const inv = invoice}` and every snippet uses `inv`.

**Why:** `GroupTitle`'s `description` / `content` snippets are closures, so TypeScript loses the `{#if}` narrowing inside them and reports `invoice` as possibly null. A block-scoped `@const` is non-null by construction. Same in `SupplierInvoicePayments`.

**Where:** `SupplierInvoiceDetails.svelte`, `SupplierInvoicePayments.svelte` markup.

## Payment schedule (scadenze)

**What:** the top of the *Scadenze e pagamenti* subpage. The schedule is an **editable table only when** the user has `edit-supplier-invoices`, the invoice is not a TD04, **and** no scadenza holds a payment (`canEditSupplierDueDates`). Otherwise it renders as a read-only list, with a description saying why: payments recorded, or no permission. A TD04 shows only "Le note di credito non hanno scadenze". The table:
- reuses `InvoiceDueDatesEditor` inside its own `FormUtil`;
- sends `PUT …/due-dates` with the invoice `version`;
- treats an empty table as a valid save (it clears the schedule);
- seeds rows with a null `payment_method` as `MP05`, the editor's own default;
- shows the running total against `expectedTotal = net_payable`.

**Why:**
- The backend replaces the whole schedule and rejects it while any payment exists (the payment history would be destroyed) and on credit notes. The guard mirrors that so the user isn't offered an edit that can only 422. Unlike issued invoices there is no state gate — the schedule is the tenant's own working copy of the supplier's terms.
- `net_payable`, not `total_amount`, because the withholding and split-payment parts are never paid to the supplier.
- Payment method stays optional in the API (rows from XML can lack it). The editor requires one to treat a row as complete, so a missing one is seeded rather than dropping the row.

**Where:** `SupplierInvoicePayments.svelte` — `scheduleEditable`, `scheduleInitialValues`, `saveSchedule`; `canEditSupplierDueDates` (unit-tested). Editor internals: `InvoiceDueDatesEditor.svelte` (shared with issued invoices — see [invoices.md](./invoices.md#payment-term--due-date-schedule-sync)).

### Versioned save: 409 reloads, remount on every version

**What:** a `409` (stale `version`) shows a warning toast and **re-fetches** the invoice. The editor form is wrapped in `{#key invoice.version}`. After a successful save the page also re-fetches rather than using the PUT response.

**Why:** someone else changed the invoice meanwhile, and the only correct move is to show their version. `{#key}` remounts `FormUtil` + editor so they re-seed from the new rows (`FormUtil` reads `initialValues` once). Refetching after save keeps the derived flags (`due_dates_mismatch`, `due_dates_need_review`, payment status) authoritative instead of trusting a partial merge.

**Where:** `handleScheduleFailure`, `handleScheduleSaved`, the `{#key}` block.

### Warnings: "da verificare" and "non quadrano"

**What:** two alerts above the schedule:
- `due_dates_need_review` → the plan was generated automatically, check it;
- `due_dates_mismatch` → `scheduled_total ≠ net_payable`, both amounts named.

Both also appear as badges in the list and in the overview header (`SupplierInvoiceFlagBadges`). An invoice **without** any scadenza also reports a mismatch (scheduled 0).

**Why:** both are warnings, never blocks: the supplier's figures are stored as sent, so the UI informs and lets the user fix the plan (saving clears `need_review` server-side). The schedule-less case is deliberately left flagged — there is something to pay and no plan for it.

**Where:** `SupplierInvoicePayments.svelte` alerts; `SupplierInvoiceFlagBadges.svelte`.

## Payments: per scadenza, no state gate

**What:** below the schedule, one group per scadenza (residual, paid, `InvoicePaymentStatusBadge payable`, history with delete), with **Registra pagamento** (`RecordPaymentDialog` with `onRecord = recordSupplierPayment`) and **Segna come pagato** (records the whole residual today with the scadenza's method, behind a confirm). Payable = `isSupplierDueDatePayable(residual, document_type)` **and** `edit-supplier-invoices`.

**Why:** same domain model as issued invoices — a payment belongs to a scadenza (see [invoices.md](./invoices.md#payments-subpage--recording)). Unlike `isDueDateCollectable` there is **no invoice-state condition**: every received invoice is payable, `to_link` included — you may owe a supplier you haven't registered yet. Only the residual and the TD04 exclusion matter. Recording a payment freezes the schedule (previous section); deleting the last one thaws it.

**Where:** `SupplierInvoicePayments.svelte` — `canPay`, `handleMarkPaid`, `handleDelete`; `isSupplierDueDatePayable`, `markSupplierDueDatePaid` (unit-tested).

### Payable wording on shared components

**What:** the payment components shared with the receivable side take a switch instead of being forked:
- `InvoicePaymentStatusBadge payable` → "Non pagata / Parzialmente pagata / Pagata" (`supplierPaymentStatusLabels`) instead of "Da incassare / … / Incassato";
- `PaymentProgressCell paidLabel={m.amount_settled()}` → "Pagato" instead of "Incassato";
- `RecordPaymentDialog onRecord` → posts to `supplier-invoice-due-dates` instead of the default `invoice-due-dates`;
- "Segna come pagato" uses its own keys (`mark_as_settled*`).

**Why:** the receivable labels ("Incassato") are wrong for money going out, but layout, validation (`0.01 ≤ amount ≤ residual`) and prefill are identical. Defaults keep every existing receivable caller unchanged.

**Where:** `InvoicePaymentStatusBadge.svelte` (`payable`), `PaymentProgressCell.svelte` (`paidLabel`), `RecordPaymentDialog.svelte` (`onRecord`, `PayableDueDate`).

## List filters

**What:** `SupplierInvoicesFilters` exposes:
- `status` and `document_type` as **tags** (multi);
- `payment_status` as enum, with the payable labels;
- the anomaly flags (`quarantined`, `possible_duplicate`, `due_dates_need_review`) as enum filters with **Sì/No** sent as `1`/`0`.

There is no "add" CTA.

**Why:** the backend takes comma-separated lists for status/type. The homepage "da gestire" KPI deep-links with `status=to_link,new`, which only round-trips if `status` is a multi filter. Booleans go as `1`/`0` because that's what Laravel's `boolean` rule accepts in a query string. No CTA because received invoices only arrive from SDI.

**Where:** `SupplierInvoicesFilters.svelte`; `supplier-filter-options.ts` (supplier search, shared with *Da pagare*).

## Homepage KPIs

**What:** two `KpiWidget` configs:
- `toPayWidgetConfig` (`to-pay`, EUR open scadenze + an overdue `additionalKpis` row labelled with `{formatted}`) → links to `to-pay`;
- `supplierInvoicesToHandleWidgetConfig` (`supplier-invoices-to-handle`: to link + new) → links to `supplier-invoices`.

Neither passes a `period`. `fetchKpiWidget` runs `normalizeKpiNumbers` before validating the payload.

**Why:**
- **Deep links only work if the destination's filter config declares the keys.** `readFiltersFromUrl` reads only configured keys, so the payload's `filters` (`currency`, `due_date_to`, `status`) must exist in `SupplierPaymentsFilters` / `SupplierInvoicesFilters`, or the link lands on an unfiltered list.
- These are open totals, not period figures, so the backend default applies.
- `{formatted}` was added to the additional-KPI label params because the overdue figure is a currency: `{value}` would print `2020.32` raw.
- The OpenAPI types these `value`s as `string`, which would fail `assertKpiPayload`. Locally they arrive as numbers, so `normalizeKpiNumbers` (numeric strings → numbers, also on `additional_kpis`) is a harmless guard. Drop it if the backend confirms numbers.

**Where:** `dashboard/_shared/example-configs.ts`, `fetchers.ts` (`normalizeKpiNumbers`, unit-tested), `KpiWidget.svelte` (`formatted`), `widget-icons.ts` (`HandCoins`, `FileInput`); `HomeDashboard.svelte` grid is `lg:grid-cols-3` for six KPIs.

## Supplier type `vendor` ("Fornitore")

**What:**
- New suppliers default to `type: 'vendor'`.
- The type select is **editable on update** too (it used to be disabled).
- `CarrierSelector` drops non-`courier` suppliers **client-side**.

**Why:**
- Most suppliers a tenant registers are vendors, and every supplier that existed before was forced to `courier` (the only type then). Users need to reclassify them, hence editable.
- The carrier picker must not offer vendors, but `GET /suppliers` had no `type` filter. Filtering one page client-side can under-fill the dropdown (search narrows it back).

> **Temporary:** api PR *feat/supplier-type-filter* adds `?type=` (comma-separated, OR-ed, case-sensitive; unknown values dropped, none valid → no filter). Once merged, `CarrierSelector` should send `type=courier` and drop the client filter. Spell `courier` exactly: a typo silently returns vendors too.

**Where:** `SupplierDetails.svelte` (`initialValues.type`, type `SelectField`), `CarrierSelector.svelte` (`defaultFetchFunction`), `supplierTypeConfig` in `enum-labels.ts`. 422s on `vat_number` / `tax_id` (identifier held by another supplier, archived included) need no code: `FormUtil` maps them onto the fields.

## Menu

**What:** under *Fatturazione* the issued invoices' entry is labelled **"Fatture emesse"** (`issued_invoices`, still `pageId: 'invoices'`) next to **"Fatture ricevute"**. *Da pagare* sits in the label-less actionables group after *Da fatturare*.

**Why:** with two invoice lists, a bare "Fatture" is ambiguous. Only the menu label changed — the page title key `invoices` is used elsewhere and was left alone. Like every scaffold change, a tenant sees it only after the scaffold is pushed for its legal entity (see [dashboard-overrides.md](../components/dashboard-overrides.md)).

**Where:** `admin-config.ts` — `menus.main`; icons in `globals/menu-icons.ts` (see [menu-system.md](../routing/menu-system.md#icons)).
