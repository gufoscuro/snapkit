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
| `metrics` | `Record<string, number>` | — | Named secondary numbers a widget may surface (e.g. `behind_schedule_count`). Keys are agreed with the widget config. |
| `meta` | `Record<string, string \| number>` | — | Non-display values used to build deep-links (e.g. `behind_schedule_date`). |
| `period` | `{ from, to }` | — | Resolved window the figures cover, inclusive `YYYY-MM-DD`. |

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
- **`metrics.behind_schedule_count`:** how many are past their delivery date.
- **`meta.behind_schedule_date`:** the cutoff date the frontend passes as
  `?delivery_date_to=…` to filter the delivery-schedule table to overdue rows.
- **Zero case:** `value: 0` renders a green "Tutto in ordine" state — just return `0`.

```json
{
  "value": 12,
  "format": "number",
  "metrics": { "behind_schedule_count": 3 },
  "meta": { "behind_schedule_date": "2026-07-07" },
  "period": { "from": "2026-07-06", "to": "2026-07-12" }
}
```

Frontend renders: headline `12`, plus an amber, clickable "⚠ 3 ordini in ritardo"
that links to the delivery schedule filtered to `delivery_date_to=2026-07-07`.
When `behind_schedule_count` is `0` the overdue row is hidden.

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
> **not** part of the contract. If you want it later, add it under `metrics`
> (e.g. `metrics.amount_total`) and we surface it via config — no schema change.

### 4.5 Monthly revenue chart — `GET …/stats/charts/monthly-revenue`

Revenue by month over a trailing window (bar chart).

- **Query:** `months=12` (how many trailing months, current month included).
- **`series`:** a single series with `key: "total"` (label comes from config → "Venduto").
- **`points`:** one row per month; `x_key` is `"label"`, so each row carries a
  short **pre-bucketed** x label plus the `total`.
- **Partial month:** the current month is still open. The frontend shows a fixed
  "mese corrente in corso" caption (config-driven); you don't need to flag it. If
  you prefer to signal it in data, we can add `meta.partial_from` later.

```json
{
  "format": "currency",
  "currency": "EUR",
  "x_key": "label",
  "x_type": "category",
  "series": [{ "key": "total" }],
  "points": [
    { "label": "ago '25", "total": 98230.00 },
    { "label": "set '25", "total": 121400.00 },
    { "label": "ott '25", "total": 134900.00 },
    { "label": "nov '25", "total": 142300.00 },
    { "label": "dic '25", "total": 168500.00 },
    { "label": "gen '26", "total": 96700.00 },
    { "label": "feb '26", "total": 112300.00 },
    { "label": "mar '26", "total": 129800.00 },
    { "label": "apr '26", "total": 138650.00 },
    { "label": "mag '26", "total": 151200.00 },
    { "label": "giu '26", "total": 147900.00 },
    { "label": "lug '26", "total": 156709.00 }
  ]
}
```

The `"label"` values are short x-axis strings. They can be plain month buckets
(`"2026-07"`) if you'd rather not format — but note the frontend prints `x` labels
verbatim, so a display-friendly bucket is nicer. (If you send raw `YYYY-MM` and want
localized month names, tell us and we'll format frontend-side with `x_type: "time"`.)

---

## 5. Key coupling: `metrics` / `meta` names ↔ widget config

The one place backend and frontend must **agree on string names** is the `metrics`
and `meta` bags. The widget config references them by key:

```jsonc
// to-ship widget config (frontend)
"secondary": [{
  "metricKey": "behind_schedule_count",                 // ← reads payload.metrics.behind_schedule_count
  "action": { "query": { "delivery_date_to": { "$fromMeta": "behind_schedule_date" } } }  // ← reads payload.meta.behind_schedule_date
}]
```

So for to-ship, the names `behind_schedule_count` (in `metrics`) and
`behind_schedule_date` (in `meta`) are **contractual** — renaming either breaks the
overdue link until the config is updated. Everything else in the payload is
positional/typed and safe.

---

## 6. Summary checklist

- [ ] `GET …/stats/kpis/revenue` — currency + trend
- [ ] `GET …/stats/kpis/to-ship` — count + `metrics.behind_schedule_count` + `meta.behind_schedule_date`
- [ ] `GET …/stats/kpis/to-invoice` — count
- [ ] `GET …/stats/kpis/to-collect` — count
- [ ] `GET …/stats/charts/monthly-revenue?months=12` — single-series bar
- [ ] Bare objects (no `{ data }` wrapper), `snake_case`, major-unit numbers, no display strings
- [ ] KPIs honor `period` (`current_week`/`current_month` + optional `from`/`to`) and echo resolved `period`
