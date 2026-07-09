import { goto } from '$app/navigation'
import { page } from '$app/state'
import type { PageContextRegistration, ToolDefinition, ToolHandler } from '@diaphora/chat'
import type { FilterConfig, FilterConfigEntry } from '$lib/utils/filters'

export type FilterChatOptions = {
  /** Stable registration id (e.g. 'sales-orders-filter'). */
  id: string
  /** Tool name exposed to the model (e.g. 'filter_sales_orders'). */
  toolName: string
  /**
   * Human, plural resource label woven into the tool + ambient descriptions
   * (e.g. 'sales orders', 'quotations'). English — chat tools are English.
   */
  resourceLabel: string
  /** The same declarative `FilterConfig` the listing component passes to `GenericFilters`. */
  config: FilterConfig
}

/**
 * Build a page-chat registration that lets the assistant *set* the structured
 * filters of a `GenericFilters`-based listing page.
 *
 * Both the tool's input schema and the URL-writing handler are derived from the
 * page's own `FilterConfig`, so enum values and query-param names stay in
 * lockstep with the UI — one source of truth per page, and one implementation
 * of the date-serialization gotcha (see `setDateParam`).
 *
 * This complements the universal `search_in_page` / `clear_filters` tools that
 * `GenericFilters` already registers for every listing page.
 */
export function makeFilterChatRegistration(opts: FilterChatOptions): PageContextRegistration {
  const { id, toolName, resourceLabel, config } = opts

  const tool: ToolDefinition = {
    name: toolName,
    description:
      `Apply filters to the ${resourceLabel} list currently displayed. Only available while the user is on the ${resourceLabel} list page. ` +
      `Sets the supplied filter fields — omit a field to leave it unchanged, pass an empty string/array to clear it.`,
    input_schema: {
      type: 'object',
      properties: buildProperties(config),
      required: [],
    },
  }

  const handler: ToolHandler = {
    type: 'async',
    async execute(input) {
      const params = new URLSearchParams(page.url.searchParams.toString())

      for (const [key, entry] of Object.entries(config)) {
        applyEntry(params, key, entry, input)
      }

      const newSearch = params.toString()
      const url = newSearch ? `${page.url.pathname}?${newSearch}` : page.url.pathname

      // A real `goto` navigation (not the shallow `replaceState` from
      // `$app/navigation`) reruns the catchall page load and replaces `page.url`.
      // GenericFilters' URL-watching effect then propagates the new filters to
      // both its own UI state and the shared PageState the table consumes.
      await goto(url, { replaceState: true, keepFocus: true, noScroll: true })

      return JSON.stringify({ applied: cleanInput(input), url })
    },
  }

  return {
    id,
    tools: [tool],
    toolHandlers: { [toolName]: handler },
    state: () =>
      `Currently on the ${resourceLabel} list page. The ${toolName} tool can set these filters: ${Object.keys(config).join(', ')}. ` +
      `The universal search_in_page and clear_filters tools are also available.`,
  }
}

// ---------------------------------------------------------------------------
// Schema derivation
// ---------------------------------------------------------------------------

type JsonSchemaProp = Record<string, unknown>

/** Allowed values of an enum/tags filter, taken from its static `options`. */
function optionValues(entry: FilterConfigEntry): string[] {
  if ((entry.type === 'enum' || entry.type === 'tags') && entry.options) {
    return entry.options.map(o => o.value)
  }
  return []
}

function buildProperties(config: FilterConfig): Record<string, JsonSchemaProp> {
  const props: Record<string, JsonSchemaProp> = {}

  for (const [key, entry] of Object.entries(config)) {
    switch (entry.type) {
      case 'customer': {
        props[key] = {
          type: 'string',
          description: `${entry.label} UUID to filter by. Typically obtained from a prior search_customers call.`,
        }
        break
      }
      case 'enum': {
        const values = optionValues(entry)
        props[key] = {
          type: 'string',
          ...(values.length ? { enum: values } : {}),
          description: `${entry.label}.${values.length ? ` One of: ${values.join(', ')}.` : ''} Pass an empty string to clear.`,
        }
        break
      }
      case 'tags': {
        const values = optionValues(entry)
        props[key] = {
          type: 'array',
          items: { type: 'string', ...(values.length ? { enum: values } : {}) },
          description: `${entry.label}.${values.length ? ` One or more of: ${values.join(', ')}.` : ''} Pass an empty array to clear.`,
        }
        break
      }
      case 'date': {
        props[key] = {
          type: 'string',
          description: `${entry.label}, ISO date (YYYY-MM-DD).`,
        }
        break
      }
      case 'amount': {
        props[entry.fromKey] = {
          type: 'number',
          description: `${entry.label} lower bound${entry.unit ? ` (${entry.unit})` : ''}.`,
        }
        props[entry.toKey] = {
          type: 'number',
          description: `${entry.label} upper bound${entry.unit ? ` (${entry.unit})` : ''}.`,
        }
        break
      }
    }
  }

  return props
}

// ---------------------------------------------------------------------------
// URL writing — mirrors `serializeFilters` (see `$lib/utils/filters`)
// ---------------------------------------------------------------------------

function applyEntry(
  params: URLSearchParams,
  key: string,
  entry: FilterConfigEntry,
  input: Record<string, unknown>,
) {
  switch (entry.type) {
    case 'customer': {
      setParam(params, key, input[key])
      break
    }
    case 'enum': {
      const value = input[key]
      if (typeof value !== 'string') break
      const trimmed = value.trim()
      if (trimmed === '') {
        params.delete(key)
        break
      }
      const allowed = optionValues(entry)
      if (!allowed.length || allowed.includes(trimmed)) params.set(key, trimmed)
      break
    }
    case 'tags': {
      const value = input[key]
      if (!Array.isArray(value)) break
      const allowed = optionValues(entry)
      const valid = value.filter(
        (v): v is string => typeof v === 'string' && (!allowed.length || allowed.includes(v)),
      )
      if (valid.length > 0) params.set(key, valid.join(','))
      else params.delete(key)
      break
    }
    case 'date': {
      setDateParam(params, key, input[key], entry.dayBoundary ?? 'startOf')
      break
    }
    case 'amount': {
      setNumberParam(params, entry.fromKey, input[entry.fromKey])
      setNumberParam(params, entry.toKey, input[entry.toKey])
      break
    }
  }
}

function setParam(params: URLSearchParams, key: string, value: unknown) {
  if (typeof value !== 'string') return
  const trimmed = value.trim()
  if (trimmed.length > 0) params.set(key, trimmed)
  else params.delete(key)
}

function setNumberParam(params: URLSearchParams, key: string, value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) params.set(key, String(value))
  else if (value === null) params.delete(key)
  // omitted (undefined) → leave unchanged
}

/**
 * Write a date filter param in the same ISO boundary format `serializeFilters`
 * produces (local-TZ start/end of day), NOT a plain `YYYY-MM-DD` literal.
 *
 * Why: `FilterDropdown` deserializes the URL value to a `CalendarDate`, then an
 * `$effect` re-serializes it back to ISO. A plain literal fails that round-trip,
 * so GenericFilters' writeUrl path fires `replaceState` to "correct" the URL —
 * but `replaceState` doesn't update `page.url`, retriggering the URL-watching
 * effect against stale state in an infinite loop (`effect_update_depth_exceeded`).
 * Emitting ISO directly keeps the serialize/deserialize round-trip at a fixed
 * point: no correction, no loop.
 */
function setDateParam(
  params: URLSearchParams,
  key: string,
  value: unknown,
  boundary: 'startOf' | 'endOf',
) {
  if (typeof value !== 'string') return
  const trimmed = value.trim()
  if (trimmed.length === 0) {
    params.delete(key)
    return
  }
  const iso = toIsoBoundary(trimmed, boundary)
  if (iso) params.set(key, iso)
}

function toIsoBoundary(value: string, boundary: 'startOf' | 'endOf'): string | null {
  const ymdMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
  if (!ymdMatch) return null
  const year = Number(ymdMatch[1])
  const month = Number(ymdMatch[2])
  const day = Number(ymdMatch[3])
  if (!year || !month || !day) return null
  const d = new Date(year, month - 1, day)
  if (Number.isNaN(d.getTime())) return null
  if (boundary === 'endOf') d.setHours(23, 59, 59, 999)
  else d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

function cleanInput(input: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(input).filter(([, v]) => v !== undefined && v !== null))
}
