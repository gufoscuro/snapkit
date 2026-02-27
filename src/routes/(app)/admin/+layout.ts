import type { LegalEntityConfigResponse } from '$lib/stores/tenant-config'
import { apiRequest } from '$utils/request'
import { error } from '@sveltejs/kit'
import type { LayoutLoad, LayoutLoadEvent } from './$types'

export const load: LayoutLoad = async (event: LayoutLoadEvent) => {
  event.depends('admin:index')

  try {
    const { legalEntity } = await event.parent()
    const legalEntityId = legalEntity?.id ?? null

    if (!legalEntityId) {
      throw error(404, 'Tenant not found')
    }

    const [legalEntityConfig] = await Promise.all([
      // apiRequest<LegalEntity>({ url: `/legal-entities/${legalEntityId}` }),
      apiRequest<LegalEntityConfigResponse>({ url: `/legal-entities/${legalEntityId}/config` }),
    ])

    return {
      legalEntity,
      legalEntityConfig,
    }
  } catch {
    throw error(404, 'Tenant not found')
  }
}
