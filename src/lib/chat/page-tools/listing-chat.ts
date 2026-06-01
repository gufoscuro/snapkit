import { goto } from '$app/navigation'
import { page } from '$app/state'
import type { PageContextRegistration } from '$lib/chat/core/page-tools-registry.svelte'
import type { ToolDefinition, ToolHandler } from '@diaphora/chat'

export type ListingChatOptions = {
  /**
   * Structured-filter URL keys the page owns, in addition to the universal
   * `search` key. Cleared by clear_filters. Can be passed as an array (frozen
   * at mount) or a getter (re-evaluated on every tool call — preferred when
   * the underlying filter config could change).
   */
  filterKeys?: readonly string[] | (() => readonly string[])
}

export const searchInPageTool: ToolDefinition = {
  name: 'search_in_page',
  description:
    'Apply a free-text search on the current listing page. The query is matched server-side across the records (e.g. customer name, document number, references). Pass an empty string to remove the search.',
  input_schema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Free-text search query. Pass empty string to remove the search.',
      },
    },
    required: [],
  },
}

export const clearFiltersTool: ToolDefinition = {
  name: 'clear_filters',
  description:
    'Remove all active filters AND any free-text search from the current listing page. Use when the user asks to reset, clear, or show all records again.',
  input_schema: { type: 'object', properties: {}, required: [] },
}

/**
 * Page-chat registration with the two tools every `GenericFilters`-based
 * listing page supports: a free-text search and a "clear everything" reset.
 * Compose alongside an entity-specific filter tool (e.g. `filter_invoices`)
 * when the page also exposes structured filters.
 */
export function makeListingChatRegistration(opts: ListingChatOptions = {}): PageContextRegistration {
  const { filterKeys } = opts

  function resolveKeys(): readonly string[] {
    if (!filterKeys) return []
    return typeof filterKeys === 'function' ? filterKeys() : filterKeys
  }

  const searchInPageHandler: ToolHandler = {
    type: 'async',
    async execute(input) {
      const params = new URLSearchParams(page.url.searchParams.toString())
      const query = typeof input.query === 'string' ? input.query.trim() : ''
      if (query.length > 0) params.set('search', query)
      else params.delete('search')
      await navigateTo(params)
      return JSON.stringify({ search: query || null })
    },
  }

  const clearFiltersHandler: ToolHandler = {
    type: 'async',
    async execute() {
      const params = new URLSearchParams(page.url.searchParams.toString())
      params.delete('search')
      for (const key of resolveKeys()) params.delete(key)
      await navigateTo(params)
      return JSON.stringify({ cleared: true })
    },
  }

  return {
    id: 'listing-chat',
    tools: [searchInPageTool, clearFiltersTool],
    toolHandlers: {
      search_in_page: searchInPageHandler,
      clear_filters: clearFiltersHandler,
    },
    state: () =>
      'Currently on a listing page. search_in_page and clear_filters are available. Entity-specific filter tools may also be present.',
  }
}

async function navigateTo(params: URLSearchParams): Promise<void> {
  const newSearch = params.toString()
  const url = newSearch ? `${page.url.pathname}?${newSearch}` : page.url.pathname
  await goto(url, { replaceState: true, keepFocus: true, noScroll: true })
}
