import { Type, type Static } from '@sinclair/typebox'
import { Value } from '@sinclair/typebox/value'
import * as m from '$lib/paraglide/messages'

/**
 * ────────────────────────────────────────────────────────────────────────────
 *  Dashboard widget framework — frozen contracts (v1)
 * ────────────────────────────────────────────────────────────────────────────
 *
 * Two contracts power config-driven dashboard widgets:
 *
 *  1. DATA contract  (backend → frontend): the statistical envelope a stat
 *     endpoint returns. Uniform enough that ONE generic renderer can display
 *     any KPI / any chart. Backend returns *raw numbers + a semantic `format`*;
 *     the frontend formats (renderPrice / Paraglide). No pre-formatted strings,
 *     no display labels in the payload — payloads stay locale-agnostic.
 *
 *  2. CONFIG contract (DB → frontend): the "wiring" that cables an endpoint to
 *     a renderer. Savable in the DB exactly like the rest of the page tree —
 *     a widget is a `SnippetDefinition` whose `componentKey` is a generic
 *     renderer and whose `props` is a `WidgetConfig`. Adding a widget = pushing
 *     one object to an array (this is what makes it chatbot-automatable).
 *
 * Schemas are TypeBox (same lib the project already uses for page `$params`),
 * so each carries a runtime validator AND a static type via `Static<>`.
 */

// ─────────────────────────────────────────────────────────────────────────────
// 1. DATA CONTRACT — backend → frontend
// ─────────────────────────────────────────────────────────────────────────────

/** How a numeric value should be rendered. `currency` pairs with a sibling ISO-4217 `currency` code. */
export const ValueFormatSchema = Type.Union([
  Type.Literal('currency'),
  Type.Literal('number'),
  Type.Literal('percent'),
])
export type ValueFormat = Static<typeof ValueFormatSchema>

export const TrendSchema = Type.Object({
  direction: Type.Union([Type.Literal('up'), Type.Literal('down'), Type.Literal('flat')]),
  /** Magnitude of the change, raw. Rendered per `format` (defaults to `percent`). */
  value: Type.Number(),
  format: Type.Optional(ValueFormatSchema),
  /** Whether `up` is a good thing (green) — e.g. revenue up = good, overdue up = bad. Defaults true. */
  positive_is_good: Type.Optional(Type.Boolean()),
})
export type Trend = Static<typeof TrendSchema>

/**
 * The KPI envelope. Pure data — no display strings.
 *  - `value`     : the headline figure (raw).
 *  - `metrics`   : named secondary numbers a widget may surface (e.g.
 *                  `{ behind_schedule_count: 3 }`). The *label* is supplied by
 *                  config (i18n / raw), never by the payload.
 *  - `meta`      : non-display values used to build deep-links (e.g.
 *                  `{ behind_schedule_date: '2026-07-07' }`).
 */
export const KpiPayloadSchema = Type.Object(
  {
    value: Type.Number(),
    format: ValueFormatSchema,
    /** ISO-4217 code; present when `format === 'currency'`. */
    currency: Type.Optional(Type.String()),
    trend: Type.Optional(TrendSchema),
    metrics: Type.Optional(Type.Record(Type.String(), Type.Number())),
    meta: Type.Optional(Type.Record(Type.String(), Type.Union([Type.String(), Type.Number()]))),
    /** Resolved period the figures cover, inclusive `YYYY-MM-DD`. */
    period: Type.Optional(Type.Object({ from: Type.String(), to: Type.String() })),
  },
  { $id: 'KpiPayload' },
)
export type KpiPayload = Static<typeof KpiPayloadSchema>

/**
 * The chart envelope. `points` is a list of rows; each row has the x value
 * under `x_key` plus one numeric field per series `key`.
 */
export const ChartPayloadSchema = Type.Object(
  {
    series: Type.Array(
      Type.Object({
        key: Type.String(),
        /** Optional per-series color hint; config and the theme palette override it. */
        color: Type.Optional(Type.String()),
      }),
    ),
    points: Type.Array(Type.Record(Type.String(), Type.Union([Type.String(), Type.Number()]))),
    format: Type.Union([Type.Literal('currency'), Type.Literal('number')]),
    currency: Type.Optional(Type.String()),
    /** Which key in each point holds the x value. */
    x_key: Type.String(),
    x_type: Type.Union([Type.Literal('time'), Type.Literal('category')]),
  },
  { $id: 'ChartPayload' },
)
export type ChartPayload = Static<typeof ChartPayloadSchema>

// ─────────────────────────────────────────────────────────────────────────────
// 2. CONFIG CONTRACT — DB → frontend
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A displayable label. Either a Paraglide message key (looked up, interpolated
 * with the widget's params) or a raw literal string supplied by the user for
 * custom widgets. The widget always receives the *already-resolved* string
 * (see `resolveLabel`).
 */
export const LabelSourceSchema = Type.Union([
  Type.Object({ key: Type.String() }),
  Type.Object({ raw: Type.String() }),
])
export type LabelSource = Static<typeof LabelSourceSchema>

/** A deep-link query value: a static string, or one pulled from `payload.meta`. */
export const QueryValueSchema = Type.Union([
  Type.String(),
  Type.Object({ $fromMeta: Type.String() }),
])
export type QueryValue = Static<typeof QueryValueSchema>

/** A navigation target resolved through `createRoute({ $id: pageId, query })`. */
export const WidgetActionSchema = Type.Object({
  pageId: Type.String(),
  query: Type.Optional(Type.Record(Type.String(), QueryValueSchema)),
})
export type WidgetAction = Static<typeof WidgetActionSchema>

/** A clickable secondary metric on a KPI card (e.g. "3 ordini in ritardo"). */
export const SecondaryMetricConfigSchema = Type.Object({
  /** Reads `payload.metrics[metricKey]`. */
  metricKey: Type.String(),
  /** Label, interpolated with `{ value }` = the metric's number. */
  label: LabelSourceSchema,
  emphasis: Type.Optional(
    Type.Union([Type.Literal('default'), Type.Literal('warning'), Type.Literal('danger')]),
  ),
  /** When set, only this metric is a link (not the whole card). */
  action: Type.Optional(WidgetActionSchema),
  /** Hide the row entirely when the metric is 0. Defaults false. */
  hideWhenZero: Type.Optional(Type.Boolean()),
})
export type SecondaryMetricConfig = Static<typeof SecondaryMetricConfigSchema>

/**
 * The full widget cabling. Persisted in the page config as the `props` of a
 * generic-renderer snippet.
 *
 * `source.endpoint` is a *slug*, not an arbitrary URL — the fetcher expands it
 * to `/legal-entities/{le}/stats/{kpis|charts}/{slug}`. Constraining it to the
 * stats namespace is deliberate: it keeps chatbot-authored configs from pointing
 * anywhere in the API.
 */
export const WidgetConfigSchema = Type.Object(
  {
    id: Type.String(),
    type: Type.Union([Type.Literal('kpi'), Type.Literal('chart'), Type.Literal('custom')]),
    title: LabelSourceSchema,
    /** Lucide icon name (matched against the widget's supported-icon map). */
    icon: Type.Optional(Type.String()),
    source: Type.Object({
      /** Endpoint slug within the stats namespace, e.g. `revenue`, `to-ship`. */
      endpoint: Type.String(),
      /** Static query params merged into the request, e.g. `{ period: 'current_week' }`. */
      params: Type.Optional(Type.Record(Type.String(), Type.String())),
    }),
    display: Type.Optional(
      Type.Object({
        chartType: Type.Optional(
          Type.Union([Type.Literal('bar'), Type.Literal('line'), Type.Literal('area')]),
        ),
        /** Muted footer line under the value (KPI). */
        subtext: Type.Optional(LabelSourceSchema),
        /** When the headline value is 0, tint the card as a success ("nothing to do"). */
        zeroIsPositive: Type.Optional(Type.Boolean()),
        /** Bold footer line shown in the zero-positive state (e.g. "All clear"). */
        zeroLabel: Type.Optional(LabelSourceSchema),
        /** Muted footer line in the zero-positive state, replacing `subtext`. */
        zeroSubtext: Type.Optional(LabelSourceSchema),
        /** Card description under the title (chart). */
        subtitle: Type.Optional(LabelSourceSchema),
        /** Small caption below the plot, e.g. a partial-period note (chart). */
        footnote: Type.Optional(LabelSourceSchema),
        /**
         * Per-series presentation (chart), keyed by the payload's series `key`.
         * Labels live here (not in the payload) because the backend can't localize
         * them; a series without a config label falls back to "Serie N".
         */
        series: Type.Optional(
          Type.Record(
            Type.String(),
            Type.Object({
              label: Type.Optional(LabelSourceSchema),
              color: Type.Optional(Type.String()),
            }),
          ),
        ),
      }),
    ),
    /** Primary click target for the whole card. */
    action: Type.Optional(WidgetActionSchema),
    /** Secondary clickable metrics (KPI only). */
    secondary: Type.Optional(Type.Array(SecondaryMetricConfigSchema)),
    /** For `type: 'custom'` — falls back to rendering this component by key. */
    componentKey: Type.Optional(Type.String()),
    /** Grid placement hint; the dashboard grid reads `colSpan`. */
    layout: Type.Optional(Type.Object({ colSpan: Type.Optional(Type.Number()) })),
  },
  { $id: 'WidgetConfig' },
)
export type WidgetConfig = Static<typeof WidgetConfigSchema>

// ─────────────────────────────────────────────────────────────────────────────
// Validators & resolvers
// ─────────────────────────────────────────────────────────────────────────────

function assertValid<T>(schema: Parameters<typeof Value.Check>[0], value: unknown, label: string): T {
  if (!Value.Check(schema, value)) {
    const first = [...Value.Errors(schema, value)][0]
    throw new Error(`Invalid ${label}: ${first ? `${first.path} ${first.message}` : 'shape mismatch'}`)
  }
  return value as T
}

export const isKpiPayload = (v: unknown): v is KpiPayload => Value.Check(KpiPayloadSchema, v)
export const isChartPayload = (v: unknown): v is ChartPayload => Value.Check(ChartPayloadSchema, v)
export const isWidgetConfig = (v: unknown): v is WidgetConfig => Value.Check(WidgetConfigSchema, v)

export const assertKpiPayload = (v: unknown) => assertValid<KpiPayload>(KpiPayloadSchema, v, 'KpiPayload')
export const assertChartPayload = (v: unknown) => assertValid<ChartPayload>(ChartPayloadSchema, v, 'ChartPayload')
export const assertWidgetConfig = (v: unknown) => assertValid<WidgetConfig>(WidgetConfigSchema, v, 'WidgetConfig')

/**
 * Resolve a {@link LabelSource} to a display string. A `raw` label is returned
 * verbatim; a `key` label is looked up in the Paraglide message catalog and
 * interpolated with `params`. Unknown keys fall back to the key itself (visible,
 * debuggable) rather than throwing.
 */
export function resolveLabel(source: LabelSource, params?: Record<string, unknown>): string {
  if ('raw' in source) return source.raw
  const fn = (m as unknown as Record<string, (p?: Record<string, unknown>) => string>)[source.key]
  return typeof fn === 'function' ? fn(params ?? {}) : source.key
}

/**
 * Build a `createRoute` query object from a {@link WidgetAction}, pulling
 * `$fromMeta` values out of the payload's `meta` bag. Missing meta keys are
 * skipped (never emit `undefined`).
 */
export function resolveActionQuery(
  action: WidgetAction,
  payload: { meta?: Record<string, string | number> } | null | undefined,
): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(action.query ?? {})) {
    if (typeof v === 'string') {
      out[k] = v
    } else {
      const mv = payload?.meta?.[v.$fromMeta]
      if (mv !== undefined && mv !== null) out[k] = String(mv)
    }
  }
  return out
}
