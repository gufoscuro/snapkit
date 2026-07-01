# Date Handling & Serialization

Rules for serializing dates in forms and payloads. The core hazard is the **UTC day-shift**: `new Date().toISOString()` converts to UTC, so near midnight in a positive-offset timezone (CET/CEST) "today" rolls back to yesterday.

> **Status (2026-07-02):** the shared util described below is the **target state** — it does **not exist yet**. This file doubles as the implementation spec for extracting it. Until the "Migration" checklist is done, `toLocalISOString` still lives privately inside `QuotationItemsListEditor.svelte` and the header defaults still use the buggy `new Date().toISOString()`. Delete this status note and the Migration section once the refactor lands.

---

## Rule: calendar-day fields never go through UTC

Fields that represent a **calendar day** — `document_date`, `valid_from`, `valid_to`, `requested_delivery_date`, `delivery_date`, `confirmed_delivery_date`, invoice due dates — must be serialized from **local** date components, never via `toISOString()`.

- The Moddo API returns these as `format: date` (a bare day) and accepts `date-time` on write (it truncates to the day).
- `new Date().toISOString()` emits a UTC instant. At e.g. `00:30` Europe/Rome on 2 Jul, it yields `2026-07-01T22:30:00.000Z` → the backend truncates to **1 Jul**, a day behind what the user sees. That's the bug.
- The whole form (header + line items) must emit **one** serialization convention: local `YYYY-MM-DDTHH:mm:ss.sss`. Do not introduce a second date-string shape (e.g. bare `YYYY-MM-DD`) just for header defaults — it widens the surface for round-trip bugs. Bare `YYYY-MM-DD` is fine for **display-only** rendering (there's already a compact renderer for collapsed rows).

---

## The shared helper: `$lib/utils/date.ts`

Extract the existing (currently private) `toLocalISOString` into a focused util module, following the `src/lib/utils/*.ts` + colocated `*.unit.test.ts` convention.

```typescript
// src/lib/utils/date.ts

/**
 * Serialize a Date using its LOCAL components (YYYY-MM-DDTHH:mm:ss.sss),
 * NOT UTC — avoids the day-shift that `toISOString()` causes near midnight
 * in positive-offset timezones (e.g. Apr 30 CET → Apr 29 22:00 UTC).
 */
export function toLocalISOString(date: Date): string {
  const pad = (n: number, len = 2) => String(n).padStart(len, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${pad(date.getMilliseconds(), 3)}`
}

/** Today's date as a local ISO string — the correct default for calendar-day fields. */
export function todayLocalISO(): string {
  return toLocalISOString(new Date())
}
```

Use `todayLocalISO()` for form default values; use `toLocalISOString(date)` when serializing a `DateField` callback's `Date`.

---

## Tests: `src/lib/utils/date.unit.test.ts`

`toLocalISOString` is a pure function of a Date's local components, so pin the timezone for deterministic assertions. Vitest reads `process.env.TZ`; set it for this file (e.g. run under `TZ=Europe/Rome`, or set it in the test setup / at the top of the file before importing).

Cases to cover:

1. **No UTC day-shift (the regression guard).** Under `TZ=Europe/Rome`, a UTC instant just before local midnight must keep the **local** day:
   ```typescript
   // 2026-07-01T22:30:00Z === 2026-07-02T00:30 local (CEST, +02:00)
   const d = new Date('2026-07-01T22:30:00.000Z')
   expect(toLocalISOString(d)).toBe('2026-07-02T00:30:00.000')
   // (toISOString() would wrongly give 2026-07-01T22:30:00.000Z)
   ```
2. **Zero-padding.** Single-digit month/day/hour/minute/second pad to 2 digits, milliseconds to 3:
   ```typescript
   const d = new Date(2026, 0, 5, 9, 3, 7, 4) // local constructor
   expect(toLocalISOString(d)).toBe('2026-01-05T09:03:07.004')
   ```
3. **DST boundary sanity.** A date in CET (+01:00, winter) and one in CEST (+02:00, summer) both serialize to their local wall-clock day/time (no off-by-one across the DST change).
4. **`todayLocalISO()` shape.** Matches `/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}$/` and its date part equals the local `new Date()` day. (If asserting an exact value, mock the clock with `vi.setSystemTime(...)`.)

---

## Migration checklist

1. Create `src/lib/utils/date.ts` with `toLocalISOString` + `todayLocalISO` (code above).
2. Create `src/lib/utils/date.unit.test.ts` with the cases above; ensure the file runs under a fixed TZ (`Europe/Rome`).
3. Replace the buggy UTC defaults (4 sites) with `todayLocalISO()`:
   - `src/lib/components/features/invoices/InvoicesDetails/default/InvoicesDetails.svelte` — `document_date`
   - `src/lib/components/features/sales-orders/SalesOrderDetails/default/SalesOrderDetails.svelte` — `document_date`
   - `src/lib/components/features/quotations/QuotationDetails/default/QuotationDetails.svelte` — `document_date` **and** `valid_from`
4. In `src/lib/components/features/form/QuotationItemsListEditor.svelte`, delete the private `toLocalISOString` and import it from `$lib/utils/date` (the `SalesOrderItemsListEditor` wrapper needs no change — it reuses the same editor).
5. Grep for any other `new Date().toISOString()` on a calendar-day field and convert it too.
6. Rebuild blueprint embeddings and remove the Status note + this Migration section from this file.

---

## Related

- `.blueprints/domain-logic/quotations.md` → "Default dates" (why the header defaults were flagged).
- `.blueprints/components/quotation-items-list-editor.md` → line-item date handling (origin of `toLocalISOString`).
- `.blueprints/testing/strategy.md` → util unit-test conventions; extracting pure logic out of `.svelte` for testability.
