import type { PageConfig, PageDetails } from '$lib/utils/page-registry'
import { match } from 'path-to-regexp'
import { fetchTenantConfigFromSource } from './fetcher'
import type { TenantConfigData } from './types'

/**
 * Search pages recursively for a matching route
 */
function searchPages(pages: PageConfig[], route: string): PageDetails | null {
  for (const page of pages) {
    const matcher = match(page.route, { decode: decodeURIComponent })
    const result = matcher(route)

    if (result) {
      return {
        config: page,
        params: result.params as Record<string, string>,
      }
    }

    // Search subpages recursively
    if (page.subpages?.length) {
      const subResult = searchPages(page.subpages, route)
      if (subResult) return subResult
    }
  }
  return null
}

/**
 * Find a page by its $id, searching recursively through subpages
 */
function findPageById(id: string, pages: PageConfig[]): PageConfig | null {
  for (const page of pages) {
    if (page.$id === id) return page
    if (page.subpages) {
      const found = findPageById(id, page.subpages)
      if (found) return found
    }
  }
  return null
}

/**
 * Collect all page $ids recursively
 */
function collectAllPageIds(pages: PageConfig[]): string[] {
  const ids: string[] = []
  for (const page of pages) {
    ids.push(page.$id)
    if (page.subpages) {
      ids.push(...collectAllPageIds(page.subpages))
    }
  }
  return ids
}

function createTenantConfigStore() {
  // In-memory cache: Map<vanity, TenantConfigData>
  const cache = new Map<string, TenantConfigData>()

  // Pending fetch promise - allows waiting for in-flight requests
  let pendingFetch: Promise<TenantConfigData> | null = null

  // Reactive state using Svelte 5 runes
  let currentTenant = $state<TenantConfigData | null>(null)
  let currentVanity = $state<string | null>(null)
  let loading = $state(false)
  let error = $state<string | null>(null)

  /**
   * Fetch and cache tenant configuration
   * Returns cached data if available, otherwise fetches from source
   *
   * @param vanity - Tenant subdomain identifier
   * @returns Tenant configuration
   * @throws Error if tenant not found
   */
  async function fetchTenantConfig(vanity: string): Promise<TenantConfigData> {
    // Return current tenant if already loaded (same vanity)
    if (cache.has(vanity) && currentVanity === vanity && currentTenant) {
      return currentTenant
    }

    // Check cache (might be switching back to previously loaded tenant)
    if (cache.has(vanity)) {
      currentTenant = cache.get(vanity)!
      currentVanity = vanity
      return currentTenant
    }

    // If there's already a fetch in progress for any tenant, wait for it
    // (in practice, layout always fetches first, so this handles the race condition)
    if (pendingFetch) {
      return pendingFetch
    }

    // Fetch from source
    loading = true
    error = null

    pendingFetch = (async () => {
      try {
        const config = await fetchTenantConfigFromSource(vanity)

        if (!config) {
          throw new Error(`Tenant not found: ${vanity}`)
        }

        cache.set(vanity, config)
        currentTenant = config
        currentVanity = vanity
        return config
      } catch (e) {
        error = e instanceof Error ? e.message : 'Failed to load tenant configuration'
        throw e
      } finally {
        loading = false
        pendingFetch = null
      }
    })()

    return pendingFetch
  }

  /**
   * Wait for tenant config to be ready
   * Useful when you need to ensure data is loaded before proceeding
   */
  async function waitForReady(): Promise<TenantConfigData | null> {
    if (currentTenant) {
      return currentTenant
    }
    if (pendingFetch) {
      return pendingFetch
    }

    return null
  }

  /**
   * Invalidate cache to force refetch on next access
   *
   * @param vanity - Specific tenant to invalidate, or undefined for all
   */
  function invalidate(vanity?: string): void {
    if (vanity) {
      cache.delete(vanity)
      if (currentVanity === vanity) {
        currentTenant = null
        currentVanity = null
      }
    } else {
      cache.clear()
      currentTenant = null
      currentVanity = null
    }
  }

  /**
   * Get page configuration by route (async, waits for data if fetch is in progress)
   *
   * @param route - Route path to match (e.g., '/purchase/orders')
   * @param vanity - Optional tenant vanity to fetch if not already loaded
   * @returns Page details with matched params, or null if not found
   */
  async function getPageByRoute(
    route: string,
    vanity?: string,
  ): Promise<PageDetails | null> {
    // Wait for data if fetch is in progress
    let tenant = await waitForReady()

    // If no tenant data and vanity provided, trigger fetch
    if (!tenant && vanity) {
      try {
        tenant = await fetchTenantConfig(vanity)
      } catch (e) {
        console.error('getPageByRoute: failed to fetch tenant config', e)
        return null
      }
    }

    if (!tenant) {
      console.warn('getPageByRoute called but no tenant data available')
      return null
    }

    return searchPages(tenant.pages, route)
  }

  /**
   * Get current tenant ID (synchronous)
   */
  function getTenantId(): string | null {
    return currentTenant?.id ?? null
  }

  /**
   * Get page configuration by $id (synchronous)
   * Returns null if tenant not loaded or page not found
   *
   * @param $id - Page $id to find
   * @returns Page configuration or null
   */
  function getPageById($id: string): PageConfig | null {
    if (!currentTenant) return null
    return findPageById($id, currentTenant.pages)
  }

  /**
   * Get all page $ids (synchronous)
   * Returns empty array if tenant not loaded
   *
   * @returns Array of all page $ids
   */
  function getAllPageIds(): string[] {
    if (!currentTenant) return []
    return collectAllPageIds(currentTenant.pages)
  }

  return {
    // Reactive getters
    get currentTenant() {
      return currentTenant
    },
    get currentVanity() {
      return currentVanity
    },
    get loading() {
      return loading
    },
    get error() {
      return error
    },

    // Methods
    fetchTenantConfig,
    waitForReady,
    invalidate,
    getPageByRoute,
    getTenantId,
    getPageById,
    getAllPageIds,
  }
}

// Export singleton instance
export const tenantConfigStore = createTenantConfigStore()
