// Capability tool factory: navigate the user to a named page.
// The package owns the tool shape + param normalization + goto orchestration;
// the host injects route resolution (its own page registry / route builder)
// and the actual navigation primitive.
// Deps: package types only — no host imports.

import type { ToolDefinition, ToolHandler } from '../types'

/** Result of resolving a page id (+ params) to an href. On failure, the
 * `error` (and optional `details`) are surfaced back to the model so it can
 * self-correct — e.g. realize it forgot a required route param. */
export type NavigateResolution =
  | { ok: true; href: string }
  | { ok: false; error: string; details?: string }

export type NavigateAdapter = {
  /** Resolve a page id and optional route params to an href, or an error. */
  resolveHref: (pageId: string, params?: Record<string, string>) => NavigateResolution
  /** Perform the navigation to the resolved href. */
  goto: (href: string) => void | Promise<void>
}

const navigateToPageTool: ToolDefinition = {
  name: 'navigate_to_page',
  description:
    'Navigate the user to one of the pages listed in `## Available pages`. Pass the page id (the part before the dash). When a page entry shows "(requires: <names>)", you MUST pass the matching `params` object — typically obtained from a prior search_<entity> call (e.g. `{ uuid: "abc-123" }`).',
  input_schema: {
    type: 'object',
    properties: {
      page_id: {
        type: 'string',
        description:
          'The $id of the page as listed in `## Available pages` (e.g. "customer-list" or "customer-details").',
      },
      params: {
        type: 'object',
        description:
          'Route parameters required by detail pages. Keys are the names shown in "(requires: <names>)"; values are typically UUIDs from search_<entity> tools.',
      },
    },
    required: ['page_id'],
  },
}

export function makeNavigateTool(adapter: NavigateAdapter): {
  tool: ToolDefinition
  handler: ToolHandler
} {
  const handler: ToolHandler = {
    type: 'async',
    async execute(input) {
      const pageId = typeof input.page_id === 'string' ? input.page_id.trim() : ''
      if (!pageId) return JSON.stringify({ error: 'page_id is required' })

      const params = normalizeParams(input.params)
      const resolved = adapter.resolveHref(pageId, params)
      if (!resolved.ok) {
        return JSON.stringify({ error: resolved.error, details: resolved.details })
      }

      await adapter.goto(resolved.href)
      return JSON.stringify({ navigated: true, page_id: pageId, url: resolved.href })
    },
  }
  return { tool: navigateToPageTool, handler }
}

function normalizeParams(raw: unknown): Record<string, string> | undefined {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return undefined
  const out: Record<string, string> = {}
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof value === 'string') out[key] = value
    else if (typeof value === 'number' && Number.isFinite(value)) out[key] = String(value)
  }
  return Object.keys(out).length > 0 ? out : undefined
}
