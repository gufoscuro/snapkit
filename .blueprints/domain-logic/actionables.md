# Actionables — Frontend Special Cases

The **actionables** are the cross-cutting "things to do" surfaced label-less at the top of the sidebar (see [menu-system.md](../routing/menu-system.md) → *Label-less group*): **Da spedire** (to ship), **Da incassare** (to collect), **Da fatturare** (to invoice). Views on these endpoints:

- **Da spedire** (sidebar) → `DeliveryScheduleTable` + `DeliveryScheduleFilters`, `GET /delivery-schedule?outstanding=true`
- **Order delivery recap** (subpage under `sales-order-details`) → `SalesOrderDeliveryScheduleTable`, `GET /delivery-schedule?sales_order_id={id}`
- **Da incassare** → `PaymentsTable` + `PaymentsFilters`, `GET /invoice-due-dates`

The list views follow the read-only aggregate-list recipe in [resource-table.md](../components/resource-table.md) (no own detail/archive; rows link to the source entity; baked query param). *Da fatturare* (`InvoiceableDocumentsTable`) predates this set and its quirks live in the invoices surface — see [invoices.md](./invoices.md). Sales-order specifics (import flow, fulfillment badge) live in [sales-orders.md](./sales-orders.md).

---

## Da incassare — no paid/unpaid status column

**What:** `PaymentsTable` lists invoice due dates (`due_date`, `document_number` → link to `invoice-details`, `customer_name`, `amount`, `payment_method`, invoice `state`) but has **no "paid / unpaid" column**. It is a schedule of outstanding due dates, not a settlement ledger.

**Why:** the backend does not model actual cash arrival. `Invoice::isFullyPaid()` treats an invoice as settled once it is *issued to SDI* (state `Sent`/`Delivered`/`Accepted`) — a proxy for "paid", not real payment tracking. There is no `paid_amount`/`paid_at` on due dates to render. Showing a paid flag would be lying. Surface the invoice `state` (via `InvoiceStateBadge`) as the closest available signal instead. See the moddo-api business-doc **`deferred`** → *"Invoice payment tracking"* (MCP: `list-business-docs` → `get-business-doc deferred`) for the stub and the revisit trigger (a future `mark-paid` endpoint + A-Cube `incoming-payment` ingestion).

**Where:** `PaymentsTable.svelte` (columns), `InvoiceStateBadge.svelte` (state column).

## Da incassare — forward-only list, credit notes excluded

**What:** invoices issued before the due-dates feature shipped will **never** appear here, and credit notes (TD04) are excluded.

**Why:** `invoice_due_dates` rows are materialized only on draft create/update going forward and frozen at submit; there is no backfill for historical invoices. Credit notes carry no collectible schedule. A future `invoices:backfill-due-dates` command could reproduce them. See moddo-api `deferred` → *"Invoice due dates — no backfill"* and *"FE-owned, optional, and unbalanced"* (an invoice may legitimately have **zero** due dates, so an empty list is a valid shape, not an error).

**Where:** backend-owned; FE consequence only — the list may be sparser than the full invoice count. `PaymentsTable.svelte`.

## Da incassare — amount carries no currency

**What:** the `amount` column renders with the `currency` renderer's **default (EUR)** — no `currencyAccessor`.

**Why:** `InvoiceDueDate` has no `currency` field (the parent invoice does, but it isn't projected onto the due-date row). The domain is Italian FatturaPA, so EUR is the correct default. If multi-currency receivables ever matter, the endpoint must project the invoice currency onto each row.

**Where:** `PaymentsTable.svelte` — `amount` column.

## Da incassare — `InvoiceDueDate` field shape (flattened vs nested)

**What:** the FE `InvoiceDueDate` type (`src/lib/types/api-types.ts`) carries the enriched invoice fields **flattened** (`document_number`, `document_date`, `document_type`, `state`, `customer_name`, plus `invoice_id`). Columns read them directly (`row.document_number`, `row.state`, `row.customer_name`) and the link uses `row.invoice_id`.

**Why:** these enriched fields are present only on the cross-invoice `GET /invoice-due-dates` list (the invoice's own `due_dates` omit them). The repo type is the contract the columns rely on.

> ⚠️ The live OpenAPI surface currently documents these under a **nested** `invoice { … }` object rather than flattened. If the runtime response is nested, the flat accessors and `invoice_id` must be adapted (e.g. `row.invoice.document_number`). Verify against a real response before trusting either shape.

**Where:** `PaymentsTable.svelte` (accessors), `api-types.ts` → `InvoiceDueDate`.

---

## Delivery schedule — one endpoint, two views (backlog vs recap)

**What:** `GET /delivery-schedule` is line-granular (one `DeliveryScheduleLine` per outstanding sales-order line, not per shipping document) and drives two distinct FE surfaces, differing only by query params:

| View | Component | Params | Shows |
|---|---|---|---|
| **Da spedire** (sidebar backlog) | `DeliveryScheduleTable` | `outstanding=true` baked | only lines with `quantity_remaining > 0`; row links to `sales-order-delivery-schedule` (the order's shipping recap, not the generic overview) |
| **Order recap** (subpage) | `SalesOrderDeliveryScheduleTable` | `sales_order_id={uuid}`, **no** `outstanding` | *all* lines of one order incl. fully-shipped (`remaining = 0`) — delivered vs remaining; no link column (already in the order) |

**Why:** `outstanding` and `sales_order_id` are independent params. The backlog *is* the residual-to-ship set, so `outstanding=true` is baked as the view's identity (see the baked-param rationale in [resource-table.md](../components/resource-table.md)). The recap deliberately omits `outstanding` so an operator sees what's already shipped too — an order fully evaded still lists its lines at `remaining = 0`. Both are line-granular because one order ships partially: `quantity_ordered` / `quantity_shipped` (Σ active TD-items, cancelled excluded) / `quantity_remaining = max(0, ordered − shipped)` are per line. For document-level shipping status use Transport Documents / Warehouse Orders instead.

**Where:** `DeliveryScheduleTable.svelte` (backlog), `SalesOrderDeliveryScheduleTable.svelte` (recap), `DeliveryScheduleLine` in `api-types.ts`.

## Order recap — provides `salesOrder` to the sidebar

**What:** `SalesOrderDeliveryScheduleTable` (the `sales-order-delivery-schedule` subpage) fetches the sales order on mount and `useProvides(...'salesOrder')`, exactly like `SalesOrderDetails` does on the overview page.

**Why:** `SalesOrderSidebar` *consumes* `salesOrder` (via `SalesOrderSidebarContract`) to render the order header + subpage menu. A subpage that doesn't provide it would leave the sidebar blank. The subpage content component is the provider on its own page — this is the standard entity-subpage pattern (cf. `CustomerDocumentsTable` providing `customer`). It reuses `SalesOrderDataSchema` and sets the breadcrumb label on the parent `sales-order-details` crumb.

**Where:** `SalesOrderDeliveryScheduleTable.svelte` (`onMount` fetch + `useProvides`), `SalesOrderSidebar.svelte` (menu item + `salesOrder` consumer), scaffold `sales-order-details.subpages` in `admin-config.ts`.

## Delivery calendar (Da spedire v2) — planned, not yet built

**What:** the sidebar "Da spedire" is currently the flat backlog list (v1). The intended planner UX is a **delivery calendar**: outstanding lines grouped into **ISO-week buckets on the FE** (by `confirmed_delivery_date ?? requested_delivery_date`), driven by a visible date range.

**Why it isn't a `DeliveryScheduleTable` extension:** week bucketing + a separate "Da pianificare" bucket + range-driven navigation don't fit ResourceTable's flat single-fetch model — it needs a dedicated component (and an ISO-week helper in `$lib/utils/date.ts`, honouring the local-parse rule in [date-handling.md](../components/date-handling.md)). Two gotchas locked in by the backend contract:

1. **`delivery_date_from`/`_to` exclude null-date lines.** A backlog line can have *both* delivery dates null (never scheduled). It appears under `outstanding=true` (sorted last) but a date range filters it out. So the **"Da pianificare" bucket needs a second call** — `outstanding=true` with *no* range — showing rows with both dates null. (Alternative the backend offered: an `iso_week` field per row, which would collapse this to one call.)
2. **Ship gate ≠ scheduling gate.** A `payment_pending` line still belongs on the calendar — the warehouse prepares goods while the customer pays; only the TD load is payment-blocked. Show it with a marker, don't hide it.

**Where:** not yet implemented — `DeliveryScheduleTable.svelte` is the v1 stand-in. The moddo-api `deferred` business-doc has no entry for this; it's a FE-side phase.

## Da spedire — payment-pending indicator

**What:** the last column is an icon-only `state-indicator` (error when `payment_pending`, success otherwise) rather than a text badge.

**Why:** `payment_pending` is a per-line boolean flagging lines whose order still has an unpaid non-Saldo slice — a shipment-gating hint the operator should see at a glance. It ties into the same issued-as-paid proxy described above (`SalesOrder::hasUnpaidNonSaldoSlices` routes through `Invoice::isFullyPaid()`), so it will auto-tighten when real payment tracking lands.

**Where:** `DeliveryScheduleTable.svelte` and `SalesOrderDeliveryScheduleTable.svelte` — `payment_pending` column (both delivery-schedule views).
