import type { PageConfig, PageDetails } from '$lib/utils/page-registry'
import { match } from 'path-to-regexp'
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
  // eslint-disable-next-line svelte/prefer-svelte-reactivity
  const cache = new Map<string, TenantConfigData>()

  // Reactive state using Svelte 5 runes
  let currentTenant = $state<TenantConfigData | null>(null)
  let currentLegalEntityId = $state<string | null>(null)

  /**
   * Set the active legal entity from pre-fetched config data.
   *
   * The config is expected to come from the layout load function, which is
   * responsible for fetching it. This method only handles caching and state.
   *
   * @param legalEntityId - UUID of the legal entity
   * @param config - Pre-fetched TenantConfigData (dashboard field from the config response)
   */
  function setActiveLegalEntity(legalEntityId: string, config: TenantConfigData): void {
    cache.set(legalEntityId, config)
    currentTenant = config
    currentLegalEntityId = legalEntityId
  }

  /**
   * Invalidate cache to force a re-fetch on the next layout load.
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
  function getPageByRoute(route: string): PageDetails | null {
    if (!currentTenant) {
      console.warn('getPageByRoute called but no config data available')
      return null
    }

    return searchPages(currentTenant.pages, route)
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

    // Methods
    setActiveLegalEntity,
    invalidate,
    getPageByRoute,
    getLegalEntityId,
    getPageById,
    getAllPageIds,
  }
}

// Export singleton instance
export const tenantConfigStore = createTenantConfigStore()
