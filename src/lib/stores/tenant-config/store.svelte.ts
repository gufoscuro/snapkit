import type { PageConfig, PageDetails } from '$lib/utils/page-registry'
import { match } from 'path-to-regexp'
import { fetchLegalEntityConfig } from './fetcher'
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
  // In-memory cache: Map<legalEntityId, TenantConfigData>
  const cache = new Map<string, TenantConfigData>()

  // Pending fetch promise - allows waiting for in-flight requests
  let pendingFetch: Promise<TenantConfigData> | null = null

  // Reactive state using Svelte 5 runes
  let currentTenant = $state<TenantConfigData | null>(null)
  let currentLegalEntityId = $state<string | null>(null)
  let loading = $state(false)
  let error = $state<string | null>(null)

  /**
   * Fetch and cache legal entity configuration.
   * Sets the active legal entity in the store.
   * Returns cached data if available, otherwise fetches from the backend.
   *
   * Call this from the layout load function to initialise the store before
   * page load functions run.
   *
   * @param legalEntityId - UUID of the legal entity
   * @returns Legal entity UI configuration
   * @throws Error if config not found
   */
  async function setActiveLegalEntity(legalEntityId: string): Promise<TenantConfigData> {
    // Return current config if already loaded for this legal entity
    if (cache.has(legalEntityId) && currentLegalEntityId === legalEntityId && currentTenant) {
      return currentTenant
    }

    // Check cache (switching back to a previously loaded entity)
    if (cache.has(legalEntityId)) {
      currentTenant = cache.get(legalEntityId)!
      currentLegalEntityId = legalEntityId
      return currentTenant
    }

    // If there's already a fetch in progress, wait for it
    if (pendingFetch) {
      return pendingFetch
    }

    loading = true
    error = null

    pendingFetch = (async () => {
      try {
        const config = await fetchLegalEntityConfig(legalEntityId)

        console.log('fetch config', config)

        if (!config) {
          throw new Error(`Config not found for legal entity: ${legalEntityId}`)
        }

        cache.set(legalEntityId, config)
        currentTenant = config
        currentLegalEntityId = legalEntityId
        return config
      } catch (e) {
        error = e instanceof Error ? e.message : 'Failed to load legal entity configuration'
        throw e
      } finally {
        loading = false
        pendingFetch = null
      }
    })()

    return pendingFetch
  }

  /**
   * Wait for config to be ready.
   * Resolves immediately if already loaded, or waits for the in-flight fetch.
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
   * @param legalEntityId - Specific entity to invalidate, or undefined for all
   */
  function invalidate(legalEntityId?: string): void {
    if (legalEntityId) {
      cache.delete(legalEntityId)
      if (currentLegalEntityId === legalEntityId) {
        currentTenant = null
        currentLegalEntityId = null
      }
    } else {
      cache.clear()
      currentTenant = null
      currentLegalEntityId = null
    }
  }

  /**
   * Get page configuration by route.
   * Requires the store to be already initialised via setActiveLegalEntity().
   *
   * @param route - Route path to match (e.g., '/purchase/orders')
   * @returns Page details with matched params, or null if not found
   */
  async function getPageByRoute(route: string): Promise<PageDetails | null> {
    const tenant = await waitForReady()

    if (!tenant) {
      console.warn('getPageByRoute called but no config data available')
      return null
    }

    console.log('getPageByRoute', { route, tenant })

    return searchPages(tenant.pages, route)
  }

  /**
   * Get current legal entity ID (synchronous)
   */
  function getLegalEntityId(): string | null {
    return currentLegalEntityId
  }

  /**
   * Get page configuration by $id (synchronous)
   * Returns null if config not loaded or page not found
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
   * Returns empty array if config not loaded
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
    get currentLegalEntityId() {
      return currentLegalEntityId
    },
    get loading() {
      return loading
    },
    get error() {
      return error
    },

    // Methods
    setActiveLegalEntity,
    waitForReady,
    invalidate,
    getPageByRoute,
    getLegalEntityId,
    getPageById,
    getAllPageIds,
  }
}

// Export singleton instance
export const tenantConfigStore = createTenantConfigStore()
