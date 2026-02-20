import { tenantConfigStore } from '$lib/stores/tenant-config'
import type { UserResource } from '$lib/types/api-types'
import { apiRequest } from '$utils/request'
import { error } from '@sveltejs/kit'
import type { LayoutLoad, LayoutLoadEvent } from './$types'

const unauthenticatedRoutes = ['/(app)/login']

async function fetchGlobals(isAuthenticated: boolean) {
  await apiRequest({
    url: '/tenant',
  })

  if (!isAuthenticated) return {}

  const user = await apiRequest<UserResource>({
    url: '/user',
  })

  const legalEntityId = user?.tenant?.legal_entities?.[0]?.id ?? null

  if (legalEntityId) {
    await tenantConfigStore.setActiveLegalEntity(legalEntityId)
  }

  console.log('layout load function')

  return {
    user,
  }
}

export const load: LayoutLoad = async (event: LayoutLoadEvent) => {
  try {
    return await fetchGlobals(!unauthenticatedRoutes.includes(event.route.id))
  } catch {
    throw error(404, 'Tenant not found')
  }
}
