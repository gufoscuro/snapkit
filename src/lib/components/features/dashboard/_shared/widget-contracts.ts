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
 * A set of filters the backend deems compatible with a destination view. The
 * frontend spreads these verbatim as query params to build a deep-link — so it
 * never needs to know individual filter names (the backend owns compatibility).
 */
export const FiltersSchema = Type.Record(Type.String(), Type.Union([Type.String(), Type.Number()]))
export type Filters = Static<typeof FiltersSchema>

/** Fields shared by the headline KPI and each of its `additional_kpis`. */
const kpiBaseProps = {
  value: Type.Number(),
  format: ValueFormatSchema,
  /** ISO-4217 code; present when `format === 'currency'`. */
  currency: Type.Optional(Type.String()),
  trend: Type.Optional(TrendSchema),
  /** Query params for this figure's deep-link (see {@link FiltersSchema}). */
  filters: Type.Optional(FiltersSchema),
}

/**
 * A secondary figure nested under a KPI (e.g. "3 orders overdue"). Same shape as
 * the headline, minus its own nesting — so the frontend renders it by *cycling*,
 * without needing to know any specific key. Its label/emphasis come from config,
 * matched by position (see `WidgetConfig.additionalKpis`).
 */
export const AdditionalKpiSchema = Type.Object(kpiBaseProps, { $id: 'AdditionalKpi' })
export type AdditionalKpi = Static<typeof AdditionalKpiSchema>

/** The KPI envelope. Pure data — no display strings. */
export const KpiPayloadSchema = Type.Object(
  {
    ...kpiBaseProps,
    /** Secondary figures, rendered in order and labelled by config. */
    additional_kpis: Type.Optional(Type.Array(AdditionalKpiSchema)),
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
    /**
     * When set and the x value is a date string, the frontend parses it and
     * renders it localized — so the backend ships raw dates, not formatted
     * labels. `month` expects `YYYY-MM` → "lug 2026"; `date` expects `YYYY-MM-DD`.
     */
    label_format: Type.Optional(Type.Union([Type.Literal('month'), Type.Literal('date')])),
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

/**
 * A navigation target. The destination page is `pageId`; the query is built
 * from the payload's `filters` (not declared here), so the config stays agnostic
 * to filter names.
 */
export const WidgetActionSchema = Type.Object({
  pageId: Type.String(),
})
export type WidgetAction = Static<typeof WidgetActionSchema>

/**
 * Presentation for one entry of `payload.additional_kpis`, matched **by position**.
 * The payload supplies the number + filters; config supplies the human label and
 * how it links/looks.
 */
export const AdditionalKpiConfigSchema = Type.Object({
  /** Label, interpolated with `{ value }` / `{ count }` = the figure's number. */
  label: LabelSourceSchema,
  emphasis: Type.Optional(
    Type.Union([Type.Literal('default'), Type.Literal('warning'), Type.Literal('danger')]),
  ),
  /** When set, this figure is a link (query = the figure's own `filters`). */
  action: Type.Optional(WidgetActionSchema),
  /** Hide the row entirely when the figure is 0. Defaults false. */
  hideWhenZero: Type.Optional(Type.Boolean()),
})
export type AdditionalKpiConfig = Static<typeof AdditionalKpiConfigSchema>

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
        /** Replaces `subtext` when the payload has no `trend` (e.g. no prior period to compare). */
        noTrendSubtext: Type.Optional(LabelSourceSchema),
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
    /** Primary click target for the whole card (query = payload `filters`). */
    action: Type.Optional(WidgetActionSchema),
    /** Presentation for `payload.additional_kpis`, matched by position (KPI only). */
    additionalKpis: Type.Optional(Type.Array(AdditionalKpiConfigSchema)),
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
 * Coerce a payload's `filters` into a `createRoute` query object (string values).
 * These become the destination link's query params verbatim — the frontend never
 * needs to know the individual filter names.
 */
export function filtersToQuery(filters: Filters | undefined): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(filters ?? {})) {
    if (v !== undefined && v !== null) out[k] = String(v)
  }
  return out
}
