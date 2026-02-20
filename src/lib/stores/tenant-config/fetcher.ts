import { apiRequest } from '$utils/request'
import type { LegalEntityConfigResponse, TenantConfigData } from './types'

/**
 * Fetch legal entity configuration from the backend API
 *
 * GET /api/legal-entities/{legalEntityId}/config
 * Returns the full config resource; the UI config lives in `dashboard`.
 *
 * @param legalEntityId - UUID of the legal entity
 * @returns TenantConfigData (the `dashboard` field) or null if not found
 */
export async function fetchLegalEntityConfig(legalEntityId: string): Promise<TenantConfigData | null> {
  try {
    const response = await apiRequest<LegalEntityConfigResponse>({
      url: `/legal-entities/${legalEntityId}/config`,
    })

    return {
      pages: [
        {
          $id: 'home',
          title: 'Home',
          route: '/home',
          layout: {
            componentKey: 'layouts.LeftSidebar',
            enabled: true,
          },
          snippets: {
            sidebar: {
              componentKey: 'globals.LeftSidebarMenu',
              enabled: true,
            },
          },
        },
      ],
      menus: {
        main: {
          id: 'main',
          name: 'Main Menu',
          items: [
            {
              label: 'Home',
              pageId: 'home',
              type: 'link',
            },
          ],
        },
      },
    }

    return response?.dashboard ?? null
  } catch (error) {
    console.error(`Error fetching config for legal entity ${legalEntityId}:`, error)
    return null
  }
}
