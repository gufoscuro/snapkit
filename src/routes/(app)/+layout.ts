import { tenantConfigStore } from '$lib/stores/tenant-config'
import { type LegalEntityConfigResponse } from '$lib/stores/tenant-config/types'
import type { LegalEntity, UserResource } from '$lib/types/api-types'
import { apiRequest } from '$utils/request'
import { error } from '@sveltejs/kit'
import type { LayoutLoad, LayoutLoadEvent } from './$types'

const unauthenticatedRoutes = ['/(app)/login']

async function fetchGlobals(isAuthenticated: boolean, cookieLegalEntityId: string | null) {
  await apiRequest({
    url: '/tenant',
  })

  if (!isAuthenticated)
    return {
      user: null,
      legalEntity: null,
      entityConfig: null,
    }

  const user = await apiRequest<UserResource>({
    url: '/user',
  })

  const entities = user?.tenant?.legal_entities ?? []

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

  return {
    user,
    legalEntity,
    entityConfig,
  }
}

export const load: LayoutLoad = async (event: LayoutLoadEvent) => {
  try {
    const { legalEntityId } = await event.parent()
    return await fetchGlobals(!unauthenticatedRoutes.includes(event.route.id), legalEntityId)
  } catch {
    throw error(404, 'Tenant not found')
  }
}
