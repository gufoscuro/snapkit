import { Value } from '@sinclair/typebox/value'
import { compile } from 'path-to-regexp'
import { PAGES, type PageConfig } from './page-registry'

/** Cache of compiled route functions to avoid recompilation on each call */
const compiledRoutes = new Map<string, (params: Record<string, string>) => string>()

export interface CreateRouteOptions {
  /** The $id of the page to generate a route for */
  $id: string
  /** Path parameters to interpolate into the route pattern */
  params?: Record<string, string | number>
  /** Query parameters to append to the URL */
  query?: Record<string, string | number | boolean | undefined>
}

/**
 * Generates a URL from a page $id and parameters.
 *
 * @example
 * // Simple route without params
 * createRoute({ $id: 'order-list' })
 * // → '/orders'
 *
 * @example
 * // Route with path params
 * createRoute({ $id: 'order-detail', params: { uuid: '123' } })
 * // → '/orders/123'
 *
 * @example
 * // Route with query params
 * createRoute({ $id: 'order-list', query: { status: 'pending', page: 1 } })
 * // → '/orders?status=pending&page=1'
 */
export function createRoute(options: CreateRouteOptions): string {
  const { $id, params = {}, query } = options

  const page = findPageById($id)
  if (!page) {
    return '/broken-link?link-id=' + encodeURIComponent($id)
    // throw new Error(`[createRoute] Page with $id "${$id}" not found`)
  }

  // Dev-only validation against TypeBox schema
  if (import.meta.env.DEV && page.$params) {
    if (!Value.Check(page.$params, params)) {
      const errors = [...Value.Errors(page.$params, params)]
      console.warn(`[createRoute] Invalid params for "${$id}":`, errors)
    }
  }

  // Compile and cache the path generator function
  if (!compiledRoutes.has($id)) {
    compiledRoutes.set($id, compile(page.route))
  }

  const toPath = compiledRoutes.get($id)!

  // Convert all params to strings for path-to-regexp
  const stringParams = Object.fromEntries(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  )

  let path = toPath(stringParams)

  // Append query parameters if provided
  if (query) {
    const searchParams = new URLSearchParams()
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) {
        searchParams.set(key, String(value))
      }
    }
    const queryString = searchParams.toString()
    if (queryString) {
      path += `?${queryString}`
    }
  }

  return path
}

/**
 * Finds a page by its $id, searching recursively through subpages.
 */
function findPageById(id: string, pages: PageConfig[] = PAGES): PageConfig | undefined {
  for (const page of pages) {
    if (page.$id === id) return page
    if (page.subpages) {
      const found = findPageById(id, page.subpages)
      if (found) return found
    }
  }
  return undefined
}

/**
 * Returns all page $ids defined in the registry.
 * Useful for validation or autocomplete features.
 */
export function getAllPageIds(): string[] {
  const ids: string[] = []
  function collect(pages: PageConfig[]) {
    for (const page of pages) {
      ids.push(page.$id)
      if (page.subpages) collect(page.subpages)
    }
  }
  collect(PAGES)
  return ids
}
