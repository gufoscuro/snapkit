// Capability tool factory: page-scoped free-text search + clear-filters for a
// listing page, returned as a ready-to-register PageContextRegistration.
// The package owns the tools and the URL-rewriting logic; the host injects how
// to read the current URL and how to navigate.
// Deps: package types + page-tools registry type — no host imports.

import type { PageContextRegistration } from '../core/page-tools-registry.svelte'
import type { ToolDefinition, ToolHandler } from '../types'

export type ListingToolsConfig = {
  /** Read the current URL (for its pathname + searchParams). */
  getUrl: () => URL
  /** Navigate to a new URL string (host bakes in its own goto options). */
  navigate: (url: string) => void | Promise<void>
  /** Structured-filter URL keys the page owns, in addition to the search key.
   * Cleared by clear_filters. Array (frozen) or getter (re-evaluated per call). */
  filterKeys?: readonly string[] | (() => readonly string[])
  /** URL key used for the free-text search. Default 'search'. */
  searchKey?: string
  /** Registration id used for register/unregister. Default 'listing-chat'. */
  id?: string
}

const searchInPageTool: ToolDefinition = {
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

const clearFiltersTool: ToolDefinition = {
  name: 'clear_filters',
  description:
    'Remove all active filters AND any free-text search from the current listing page. Use when the user asks to reset, clear, or show all records again.',
  input_schema: { type: 'object', properties: {}, required: [] },
}

/**
 * Build a page-chat registration with the two tools every listing page
 * supports: a free-text search and a "clear everything" reset. Compose
 * alongside an entity-specific filter tool when the page also exposes
 * structured filters.
 */
export function makeListingTools(config: ListingToolsConfig): PageContextRegistration {
  const { getUrl, navigate, filterKeys, searchKey = 'search', id = 'listing-chat' } = config

  function resolveKeys(): readonly string[] {
    if (!filterKeys) return []
    return typeof filterKeys === 'function' ? filterKeys() : filterKeys
  }

  async function navigateTo(params: URLSearchParams): Promise<void> {
    const url = getUrl()
    const newSearch = params.toString()
    await navigate(newSearch ? `${url.pathname}?${newSearch}` : url.pathname)
  }

  const searchInPageHandler: ToolHandler = {
    type: 'async',
    async execute(input) {
      const params = new URLSearchParams(getUrl().searchParams.toString())
      const query = typeof input.query === 'string' ? input.query.trim() : ''
      if (query.length > 0) params.set(searchKey, query)
      else params.delete(searchKey)
      await navigateTo(params)
      return JSON.stringify({ search: query || null })
    },
  }

  const clearFiltersHandler: ToolHandler = {
    type: 'async',
    async execute() {
      const params = new URLSearchParams(getUrl().searchParams.toString())
      params.delete(searchKey)
      for (const key of resolveKeys()) params.delete(key)
      await navigateTo(params)
      return JSON.stringify({ cleared: true })
    },
  }

  return {
    id,
    tools: [searchInPageTool, clearFiltersTool],
    toolHandlers: {
      search_in_page: searchInPageHandler,
      clear_filters: clearFiltersHandler,
    },
    state: () =>
      'Currently on a listing page. search_in_page and clear_filters are available. Entity-specific filter tools may also be present.',
  }
}
