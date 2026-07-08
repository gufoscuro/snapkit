# Dashboard Stats API — Backend Contract

Interface spec for the **stat endpoints** that feed the SnapKit homepage.
The frontend already renders the homepage from generic, config-driven widgets; it
currently falls back to local mocks. Implementing the endpoints below — returning
exactly these shapes — swaps the mocks for live data with **no frontend change**.

> **Source of truth:** the TypeBox schemas in
> [`src/lib/components/features/dashboard/_shared/widget-contracts.ts`](../src/lib/components/features/dashboard/_shared/widget-contracts.ts).
> This document explains and exemplifies them. If the two ever disagree, the schema wins.

---

## 1. Conventions

| Topic | Rule |
| --- | --- |
| **No envelope** | Stat endpoints return **single resources**, so the response is the **bare object** — no `{ "data": … }` wrapper. (The `{ data }` envelope is only for listing endpoints with pagination metadata.) |
| **Casing** | Payload keys are **`snake_case`** (Laravel-native), consistent with the existing API (`behind_schedule_count`, `partial_from`, `current_page`, …). |
| **Money / numbers** | Raw numbers only, in the currency's **major unit** (euros, not cents), decimals allowed (`48250.75`). No thousands separators, no symbols, no pre-formatted strings. |
| **Currency** | ISO-4217 code as a sibling field (`"currency": "EUR"`), present whenever `format` is `currency`. |
| **No display strings** | The backend sends **data, never labels**. All human-facing text (titles, series names, footnotes, trend copy) is owned by the frontend config + i18n. Do **not** localize or send captions. |
| **Formatting** | The frontend formats every number (symbol, locale separators, percent) based on the `format` field. Backend just says *what kind* of number it is. |
| **Period** | KPIs accept a `period` query param (`current_week` \| `current_month`), with optional `from`/`to` overrides. The response echoes the **resolved** window under `period`. |
| **Errors** | Standard HTTP. Until an endpoint exists the frontend treats **404** as "not shipped yet" and shows mock data flagged `demo`; any other status surfaces a real error. Once live, return `200` with the contract shape. |
| **Validation** | The frontend validates every payload against the schema and will **hard-error** on shape drift (missing required key, wrong type). Extra keys are ignored. |

Base path for all endpoints:

```
/legal-entities/{legalEntity}/stats/{kpis|charts}/{slug}
```

---

## 2. Contract — KPI payload

Returned by `GET …/stats/kpis/{slug}`.

| Field | Type | Req | Meaning |
| --- | --- | --- | --- |
| `value` | number | ✔ | The headline figure (raw). |
| `format` | `"currency"` \| `"number"` \| `"percent"` | ✔ | How the frontend renders `value`. `percent` = ratio (`0.125` → `12,5%`). |
| `currency` | string (ISO-4217) | — | Required when `format` is `currency`. |
| `trend` | object | — | Optional change-vs-previous indicator (see below). Omit if not applicable. |
| `filters` | `Record<string, string \| number>` | — | Query params for this figure's deep-link. The frontend spreads them **verbatim** onto the destination URL — you own filter compatibility; the frontend needs no knowledge of filter names. |
| `additional_kpis` | `Array<…>` | — | Secondary figures nested under the headline (see below). Rendered **in order**; labelled by config. |
| `period` | `{ from, to }` | — | Resolved window the figures cover, inclusive `YYYY-MM-DD`. |

**`additional_kpis[]`** — each item is the KPI base shape (no further nesting):

| Field | Type | Req | Meaning |
| --- | --- | --- | --- |
| `value` | number | ✔ | The secondary figure. |
| `format` | `"currency"` \| `"number"` \| `"percent"` | ✔ | How to render it. |
| `currency` | string | — | When `format` is `currency`. |
| `trend` | object | — | Optional, same as above. |
| `filters` | `Record<string, string \| number>` | — | Query params for **this** figure's own deep-link. |

> The frontend renders `additional_kpis` by **cycling** the array — it never reads a
> named key. The human label + emphasis + link target come from the widget config,
> matched **by position**. So keep the array **order stable**, and include an item
> even when its `value` is `0` (config decides whether to hide it) — otherwise the
> positions shift and labels mismatch.

**`trend` object**

| Field | Type | Req | Meaning |
| --- | --- | --- | --- |
| `direction` | `"up"` \| `"down"` \| `"flat"` | ✔ | Arrow + default color. |
| `value` | number | ✔ | Magnitude of the change, raw (rendered per `format`). |
| `format` | `"currency"` \| `"number"` \| `"percent"` | — | How to render `value`. Defaults to `percent`. |
| `positive_is_good` | boolean | — | Whether `up` is good (green). Revenue up = good; overdue up = bad. Defaults `true`. |

---

## 3. Contract — Chart payload

Returned by `GET …/stats/charts/{slug}`.

| Field | Type | Req | Meaning |
| --- | --- | --- | --- |
| `series` | `Array<{ key, color? }>` | ✔ | One entry per plotted series. `key` matches a field in every `points` row. `color` is an optional hint (config/theme override it). **No labels** — labels live in the frontend config. |
| `points` | `Array<Record<string, string \| number>>` | ✔ | Rows. Each row has the x value under `x_key` plus one number per series `key`. |
| `format` | `"currency"` \| `"number"` | ✔ | How y-values are formatted. |
| `currency` | string (ISO-4217) | — | Required when `format` is `currency`. |
| `x_key` | string | ✔ | Which key in each point holds the x value. |
| `x_type` | `"time"` \| `"category"` | ✔ | Axis kind. Use `category` when x is a pre-bucketed label. |
| `label_format` | `"month"` \| `"date"` | — | When set, the x value is a **raw date** the frontend localizes — so you don't format labels. `month` → send `YYYY-MM` (renders "lug 2026"); `date` → send `YYYY-MM-DD` (renders "15 lug 2026"). Omit to print x labels verbatim. |

---

## 4. Endpoints for the homepage (today)

Five endpoints back the current homepage: four KPIs and one chart.

### 4.1 Revenue KPI — `GET …/stats/kpis/revenue`

Revenue for the current month vs the previous one.

- **Query:** `period=current_month` (default). Optional `from`/`to` to override.
- **`value`:** the revenue figure to headline. Recommend **net of VAT** (imponibile) — confirm which figure matches "Venduto" in your accounting.
- **`trend`:** month-over-month delta as a ratio; `up` is good.

```json
{
  "value": 48250.75,
  "format": "currency",
  "currency": "EUR",
  "trend": { "direction": "up", "value": 0.125, "format": "percent", "positive_is_good": true },
  "period": { "from": "2026-07-01", "to": "2026-07-31" }
}
```

Frontend renders: `€ 48.250,75`, a green `▲ +12,5%` pill, subtitle "vs mese scorso". Card links to the sales-orders page. `trend` may be omitted (no pill shown).

### 4.2 To-ship KPI — `GET …/stats/kpis/to-ship`

Orders to ship this week, with an overdue sub-count that deep-links the delivery schedule.

- **Query:** `period=current_week` (default).
- **`value`:** total orders to ship (a count → `format: "number"`).
- **`filters`:** the query for the card's own link (this week's window).
- **`additional_kpis[0]`:** the overdue sub-count. Its `filters` drive the overdue
  link (e.g. `delivery_date_to` = today). Always include it, even when `value` is
  `0` — the config hides the zero row while positions stay aligned.
- **Zero case:** headline `value: 0` renders a green "Tutto in ordine" state.

```json
{
  "value": 12,
  "format": "number",
  "filters": { "delivery_date_from": "2026-07-06", "delivery_date_to": "2026-07-12" },
  "additional_kpis": [
    { "value": 3, "format": "number", "filters": { "delivery_date_to": "2026-07-07" } }
  ],
  "period": { "from": "2026-07-06", "to": "2026-07-12" }
}
```

Frontend renders: headline `12` (card links to the delivery schedule filtered to
this week), plus an amber, clickable "⚠ 3 ordini in ritardo" that links to the
schedule filtered to `delivery_date_to=2026-07-07`. When the overdue `value` is
`0` that row is hidden.

### 4.3 To-invoice KPI — `GET …/stats/kpis/to-invoice`

Documents to invoice this week. Plain count; zero is a positive "all clear" state.

- **Query:** `period=current_week` (default).
- **`value`:** count of documents ready to invoice.

```json
{
  "value": 5,
  "format": "number",
  "period": { "from": "2026-07-06", "to": "2026-07-12" }
}
```

Frontend renders: headline `5`, subtitle "documenti pronti". `value: 0` → green
"Tutto in ordine / niente da fatturare". Card links to the to-invoice page.

### 4.4 To-collect KPI — `GET …/stats/kpis/to-collect`

Invoice due-dates to collect this week. Same shape as to-invoice.

```json
{
  "value": 8,
  "format": "number",
  "period": { "from": "2026-07-06", "to": "2026-07-12" }
}
```

Frontend renders: headline `8`, subtitle "scadenze in settimana". `value: 0` →
green "all clear". Card links to the payments page.

> **Note (to-invoice / to-collect):** the original design also carried a monetary
> `amount` per pending item; the current homepage does **not** display it, so it is
> **not** part of the contract. If you want it later, add it as an
> `additional_kpis` entry (`{ value, format: "currency", currency }`) and we surface
> it via config — no schema change.

### 4.5 Monthly revenue chart — `GET …/stats/charts/monthly-revenue`

Revenue by month over a trailing window (bar chart).

- **Query:** `months=12` (how many trailing months, current month included).
- **`series`:** a single series with `key: "total"` (label comes from config → "Venduto").
- **`points`:** one row per month; `x_key` is `"label"`, holding a **raw** `YYYY-MM`.
- **`label_format: "month"`:** tells the frontend to localize the raw month
  (`2026-07` → "lug 2026") — you don't format labels.
- **Partial month:** the current month is still open. The frontend shows a fixed
  "mese corrente in corso" caption (config-driven); you don't need to flag it.

```json
{
  "format": "currency",
  "currency": "EUR",
  "x_key": "label",
  "x_type": "category",
  "label_format": "month",
  "series": [{ "key": "total" }],
  "points": [
    { "label": "2025-08", "total": 98230.00 },
    { "label": "2025-09", "total": 121400.00 },
    { "label": "2025-10", "total": 134900.00 },
    { "label": "2025-11", "total": 142300.00 },
    { "label": "2025-12", "total": 168500.00 },
    { "label": "2026-01", "total": 96700.00 },
    { "label": "2026-02", "total": 112300.00 },
    { "label": "2026-03", "total": 129800.00 },
    { "label": "2026-04", "total": 138650.00 },
    { "label": "2026-05", "total": 151200.00 },
    { "label": "2026-06", "total": 147900.00 },
    { "label": "2026-07", "total": 156709.00 }
  ]
}
```

---

## 5. What backend and frontend must keep aligned

The `filters` + `additional_kpis` design removes the old string-key coupling (the
frontend no longer reads named payload keys). Two soft contracts remain:

1. **`additional_kpis` order ↔ config order.** The frontend labels secondary
   figures **by position**, so the array order is contractual. Keep it stable and
   include zero-value items (config hides them) so positions never shift.

2. **`filters` keys must be valid query params of the destination view.** The
   frontend spreads them verbatim, so e.g. `delivery_date_to` must be a filter the
   delivery-schedule table actually accepts. The frontend stays agnostic; the
   backend owns producing compatible filters.

The corresponding config (for reference — frontend-owned) is just:

```jsonc
// to-ship widget config
"action": { "pageId": "to-ship" },          // card link; query = payload.filters
"additionalKpis": [{                          // matched by position to additional_kpis[0]
  "label": { "key": "dashboard_to_ship_overdue" },
  "emphasis": "warning",
  "hideWhenZero": true,
  "action": { "pageId": "to-ship" }          // link; query = additional_kpis[0].filters
}]
```

---

## 6. Summary checklist

- [ ] `GET …/stats/kpis/revenue` — currency + trend + `filters`
- [ ] `GET …/stats/kpis/to-ship` — count + `filters` + `additional_kpis[]` (overdue)
- [ ] `GET …/stats/kpis/to-invoice` — count
- [ ] `GET …/stats/kpis/to-collect` — count
- [ ] `GET …/stats/charts/monthly-revenue?months=12` — single-series bar, raw `YYYY-MM` + `label_format: "month"`
- [ ] Bare objects (no `{ data }` wrapper), `snake_case`, major-unit numbers, no display strings
- [ ] `filters` spread verbatim as deep-link query params (you own compatibility)
- [ ] `additional_kpis` in stable order, zero items included
- [ ] KPIs honor `period` (`current_week`/`current_month` + optional `from`/`to`) and echo resolved `period`
