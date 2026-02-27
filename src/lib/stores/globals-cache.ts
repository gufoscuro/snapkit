import type { LegalEntityConfigResponse } from '$lib/stores/tenant-config/types'
import type { LegalEntity, UserResource } from '$lib/types/api-types'

interface GlobalsCache {
  legalEntityId: string | null
  user: UserResource | null
  legalEntity: LegalEntity | null
  entityConfig: LegalEntityConfigResponse | null
}

let globalsCache: GlobalsCache | null = null

export function getGlobalsCache() {
  return globalsCache
}

export function setGlobalsCache(cache: GlobalsCache) {
  globalsCache = cache
}

export function invalidateGlobalsCache() {
  globalsCache = null
}
