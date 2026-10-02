import type { LegalEntityConfigResponse } from '$lib/stores/tenant-config'
import type { LegalEntity } from '$lib/types/api-types'
import { readAdminTarget, tenantRequestOptions } from '$lib/utils/tenant'
import { apiRequest } from '$utils/request'
import { error } from '@sveltejs/kit'
import type { LayoutLoad, LayoutLoadEvent } from './$types'

export const load: LayoutLoad = async (event: LayoutLoadEvent) => {
  event.depends('admin:index')

  try {
    const parent = await event.parent()
    const target = readAdminTarget(event.url)

    // A target in another tenant is reached by these requests only, sent without
    // `X-Tenant` — the origin, its cookies and the rest of the app stay on the
    // origin's tenant. A target in the origin's own tenant needs no override.
    const targetTenantId = target && target.tenantId !== parent.originTenantId ? target.tenantId : null
    const scope = tenantRequestOptions(targetTenantId)

    const legalEntity = target
      ? await apiRequest<LegalEntity>({ url: `/legal-entities/${target.legalEntityId}`, ...scope })
      : parent.legalEntity
    const legalEntityId = legalEntity?.id ?? null

    if (!legalEntityId) {
      throw error(404, 'Tenant not found')
    }

    const legalEntityConfig = await apiRequest<LegalEntityConfigResponse>({
      url: `/legal-entities/${legalEntityId}/config`,
      ...scope,
    })

    return {
      legalEntity,
      legalEntityConfig,
      targetTenantId,
    }
  } catch {
    throw error(404, 'Tenant not found')
  }
}
