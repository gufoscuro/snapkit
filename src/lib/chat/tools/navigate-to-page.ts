import { goto } from '$app/navigation'
import { tenantConfigStore } from '$lib/stores/tenant-config'
import { createRoute } from '$lib/utils/route-builder'
import type { ToolDefinition, ToolHandler } from '@diaphora/chat'

export const navigateToPageTool: ToolDefinition = {
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

export const navigateToPageHandler: ToolHandler = {
  type: 'async',
  async execute(input) {
    const pageId = typeof input.page_id === 'string' ? input.page_id.trim() : ''
    if (!pageId) {
      return JSON.stringify({ error: 'page_id is required' })
    }
    const page = tenantConfigStore.getPageById(pageId)
    if (!page) {
      return JSON.stringify({ error: `unknown page_id "${pageId}"` })
    }

    const params = normalizeParams(input.params)

    let url: string
    try {
      url = createRoute({ $id: pageId, params })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      return JSON.stringify({
        error: `failed to build route — likely missing required params for "${pageId}"`,
        details: message,
      })
    }

    await goto(url)
    return JSON.stringify({ navigated: true, page_id: pageId, url })
  },
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
