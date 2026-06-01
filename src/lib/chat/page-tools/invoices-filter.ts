import { goto } from '$app/navigation'
import { page } from '$app/state'
import type { PageContextRegistration } from '$lib/chat/core/page-tools-registry.svelte'
import type { ToolDefinition, ToolHandler } from '@diaphora/chat'

const INVOICE_STATES = [
  'draft',
  'sent',
  'delivered',
  'accepted',
  'rejected',
  'archived',
  'error',
] as const

export const filterInvoicesTool: ToolDefinition = {
  name: 'filter_invoices',
  description:
    'Apply filters to the invoices list currently displayed. Only available while the user is on the invoices list page. Replaces the current filter set with the supplied fields — omit a field to leave it unchanged.',
  input_schema: {
    type: 'object',
    properties: {
      customer_id: {
        type: 'string',
        description:
          'Customer UUID to filter by. Typically obtained from a prior search_customers call.',
      },
      state: {
        type: 'array',
        items: { type: 'string', enum: [...INVOICE_STATES] },
        description:
          'One or more invoice states to filter by. Pass an empty array or omit to clear the state filter.',
      },
      document_date_from: {
        type: 'string',
        description: 'Start of the document date range, ISO format (YYYY-MM-DD).',
      },
      document_date_to: {
        type: 'string',
        description: 'End of the document date range, ISO format (YYYY-MM-DD).',
      },
    },
    required: [],
  },
}

export const filterInvoicesHandler: ToolHandler = {
  type: 'async',
  async execute(input) {
    const params = new URLSearchParams(page.url.searchParams.toString())

    setParam(params, 'customer_id', input.customer_id)
    setDateParam(params, 'document_date_from', input.document_date_from, 'startOf')
    setDateParam(params, 'document_date_to', input.document_date_to, 'endOf')

    if (Array.isArray(input.state)) {
      const validStates = input.state.filter(
        (s): s is string => typeof s === 'string' && (INVOICE_STATES as readonly string[]).includes(s),
      )
      if (validStates.length > 0) params.set('state', validStates.join(','))
      else params.delete('state')
    }

    const newSearch = params.toString()
    const url = newSearch ? `${page.url.pathname}?${newSearch}` : page.url.pathname

    // `goto` (unlike `replaceState` from $app/navigation, which is shallow-routing-only
    // and does NOT update `page.url`) triggers a real navigation: the catchall page's
    // load function reruns (cheap in-memory lookup) and `page.url` is replaced.
    // GenericFilters' URL-watching effect then propagates the new filters to both its
    // own UI state and the shared PageState that InvoicesTable consumes.
    await goto(url, { replaceState: true, keepFocus: true, noScroll: true })

    return JSON.stringify({ applied: cleanInput(input), url })
  },
}

export const invoicesFilterChatRegistration: PageContextRegistration = {
  id: 'invoices-filter',
  tools: [filterInvoicesTool],
  toolHandlers: { filter_invoices: filterInvoicesHandler },
  state: () =>
    'Currently on the invoices list page. The filter_invoices tool can set customer, state, or document-date-range filters on top of the universal search_in_page and clear_filters.',
}

function setParam(params: URLSearchParams, key: string, value: unknown) {
  if (typeof value !== 'string') return
  const trimmed = value.trim()
  if (trimmed.length > 0) params.set(key, trimmed)
  else params.delete(key)
}

/**
 * Write a date filter param using the same ISO format `serializeFilters` produces.
 *
 * Why this matters: `FilterDropdown` deserializes the URL value to a `CalendarDate`,
 * then re-serializes it back to ISO (local-TZ start/end of day) via an `$effect`.
 * If we wrote a YYYY-MM-DD literal, that re-serialized ISO would NOT match what's
 * in `page.url.searchParams`, and `GenericFilters`' writeUrl path would call
 * `replaceState` to "correct" the URL. But `replaceState` from `$app/navigation`
 * does NOT update `page.url` — it only mutates the address bar and reassigns
 * `root.page` via `$set`, which re-fires GenericFilters' URL-watching effect
 * against a STALE `page.url`. The effect reverts the state, FilterDropdown
 * re-emits ISO, writeUrl re-corrects, and so on infinitely (effect_update_depth_exceeded).
 *
 * Emitting ISO directly keeps the round-trip serialize/deserialize at fixed point,
 * `lastWrittenSearchString` matches on the first writeUrl check, no replaceState
 * fires, no loop.
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
  // Accept YYYY-MM-DD (preferred) or an ISO datetime — normalize to a JS Date
  // representing the user's local calendar date, then snap to start/end of day
  // in the user's local timezone, matching `serializeFilters`' output exactly.
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
