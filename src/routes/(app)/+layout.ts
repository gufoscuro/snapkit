import { getGlobalsCache, setGlobalsCache } from '$lib/stores/globals-cache'
import { tenantConfigStore } from '$lib/stores/tenant-config'
import { type LegalEntityConfigResponse } from '$lib/stores/tenant-config/types'
import type { LegalEntity, UserResource } from '$lib/types/api-types'
import type { PaginatedResponse } from '$lib/utils/filters'
import { isShadowing } from '$lib/utils/tenant'
import { ensureOriginTenant } from '$lib/utils/tenant-session'
import { apiRequest } from '$utils/request'
import { error } from '@sveltejs/kit'
import type { LayoutLoad, LayoutLoadEvent } from './$types'

const unauthenticatedRoutes = ['/(app)/login']

async function fetchGlobals(isAuthenticated: boolean, cookieLegalEntityId: string | null) {
  if (!isAuthenticated) {
    await apiRequest({
      url: '/tenant',
    })

    return {
      user: null,
      legalEntity: null,
      entityConfig: null,
      shadowing: false,
      originTenantId: null,
    }
  }

  // Cache hit: same legal entity, skip heavy API calls
  const cached = getGlobalsCache()
  if (cached !== null && cached.legalEntityId === cookieLegalEntityId) {
    return {
      user: cached.user,
      legalEntity: cached.legalEntity,
      entityConfig: cached.entityConfig,
      shadowing: cached.shadowing,
      originTenantId: cached.originTenantId,
    }
  }

  await apiRequest({
    url: '/tenant',
  })

  // Carries `X-Tenant` like every other call — no exception, deliberately. It's safe
  // as the home identity: the endpoint resolves `tenant` from the authenticated
  // user's own relation, not from the initialized tenancy, so `user.tenant` is the
  // home tenant whatever the header says. That's what makes the shadow comparison
  // below meaningful rather than a value against itself.
  const user = await apiRequest<UserResource>({
    url: '/user',
  })

  const originTenantId = await ensureOriginTenant(user?.is_superadmin ?? false)
  const shadowing = isShadowing(user?.tenant?.id, originTenantId)

  // In our own tenant the user payload already carries the entity list, so don't pay
  // for a second call. While shadowing it describes the *home* tenant — the wrong
  // one — so ask for the list the `X-Tenant` header scopes to the origin instead.
  const entities = shadowing
    ? ((await apiRequest<PaginatedResponse<LegalEntity>>({ url: '/legal-entities' }))?.data ?? [])
    : (user?.tenant?.legal_entities ?? [])

  // Use cookie value if it matches a valid entity, otherwise fall back to the first one
  const legalEntityId =
    cookieLegalEntityId && entities.some(e => e.id === cookieLegalEntityId)
      ? cookieLegalEntityId
      : (entities[0]?.id ?? null)

  let legalEntity: LegalEntity | null = null
  let entityConfig: LegalEntityConfigResponse | null = null

  if (legalEntityId) {
    const [fetchedEntity, fetchedEntityConfig] = await Promise.all([
      apiRequest<LegalEntity>({ url: `/legal-entities/${legalEntityId}` }),
      apiRequest<LegalEntityConfigResponse>({ url: `/legal-entities/${legalEntityId}/config` }),
    ])
    legalEntity = fetchedEntity ?? null
    entityConfig = fetchedEntityConfig ?? null

    if (fetchedEntityConfig?.dashboard) {
      tenantConfigStore.setActiveLegalEntity(legalEntityId, fetchedEntityConfig.dashboard)
    }
  }

  setGlobalsCache({
    legalEntityId: cookieLegalEntityId,
    user,
    legalEntity,
    entityConfig,
    shadowing,
    originTenantId,
  })

  return {
    user,
    legalEntity,
    entityConfig,
    shadowing,
    originTenantId,
  }
}

export const load: LayoutLoad = async (event: LayoutLoadEvent) => {
  try {
    const { legalEntityId } = (await event.parent()) as { legalEntityId: string | null }
    return await fetchGlobals(!unauthenticatedRoutes.includes(event.route.id), legalEntityId)
  } catch {
    throw error(404, 'Tenant not found')
  }
}
