import { invalidate, invalidateAll } from '$app/navigation'
import { invalidateGlobalsCache } from '$lib/stores/globals-cache'
import type { LegalEntityConfigResponse } from '$lib/stores/tenant-config/types'
import { apiRequest } from '$lib/utils/request'

/**
 * Returns the default scaffold configuration for a legal entity dashboard.
 * Used to initialize or reset a legal entity's config via PUT.
 */
export function scaffoldDashboardStructure(): LegalEntityConfigResponse {
  return {
    version: 0,
    resources: {},
    dashboard: {
      pages: [
        {
          $id: 'home',
          title: 'Homepage',
          route: '/',
          layout: {
            componentKey: 'layouts.LeftSidebar',
            enabled: true,
          },
          snippets: {
            sidebar: {
              componentKey: 'globals.sidebars.IndexSidebar',
              enabled: true,
            },
          },
        },
        {
          $id: 'customers',
          title: 'customers',
          route: '/contacts/customers',
          layout: {
            componentKey: 'layouts.LeftSidebar',
            enabled: true,
          },
          snippets: {
            sidebar: {
              componentKey: 'globals.sidebars.IndexSidebar',
              enabled: true,
            },
            filters: {
              componentKey: 'common.filters.CustomersFilters',
              enabled: true,
            },
            content: {
              componentKey: 'customers.customerstable.default.CustomersTable',
              enabled: true,
              props: {
                highlight: true,
              },
            },
          },
          subpages: [
            {
              $id: 'customer-details',
              title: 'customers_details',
              route: '/contacts/customers/upsert{/:uuid}',
              layout: {
                componentKey: 'layouts.LeftSidebar',
                enabled: true,
              },
              snippets: {
                sidebar: {
                  componentKey: 'globals.sidebars.CustomerSidebar',
                  enabled: true,
                },
                content: {
                  componentKey: 'customers.customerdetails.default.CustomerDetails',
                  enabled: true,
                },
              },
            },
            {
              $id: 'customer-documents',
              title: 'customers_documents',
              route: '/contacts/customers/upsert/:uuid/documents',
              layout: {
                componentKey: 'layouts.LeftSidebar',
                enabled: true,
              },
              snippets: {
                sidebar: {
                  componentKey: 'globals.sidebars.CustomerSidebar',
                  enabled: true,
                },
              },
            },
          ],
        },
        {
          $id: 'suppliers',
          title: 'Suppliers',
          route: '/contacts/suppliers',
          layout: {
            componentKey: 'layouts.LeftSidebar',
            enabled: true,
          },
          snippets: {
            sidebar: {
              componentKey: 'globals.sidebars.IndexSidebar',
              enabled: true,
            },
          },
        },
        {
          $id: 'settings',
          title: 'settings',
          route: '/settings',
          layout: {
            componentKey: 'layouts.LeftSidebar',
            enabled: true,
          },
          snippets: {
            sidebar: {
              componentKey: 'globals.sidebars.SettingsSidebar',
              enabled: true,
            },
          },
        },
      ],
      menus: {
        main: {
          id: 'main',
          name: 'sections',
          items: [
            {
              label: 'Home',
              pageId: 'home',
              icon: 'House',
              type: 'link',
            },
            {
              label: 'customers',
              pageId: 'customers',
              icon: 'Users',
              type: 'link',
            },
            {
              label: 'suppliers',
              pageId: 'suppliers',
              icon: 'Contact',
              type: 'link',
            },
          ],
        },
      },
    },
    created_by: null,
    created_at: null,
  }
}

/**
 * Invalidates the globals cache and re-runs all load functions.
 * Call this after any admin operation that modifies the entity config.
 */
export async function refreshAdminConfig() {
  invalidateGlobalsCache()
  await invalidate('admin:index')
  await invalidateAll()
}

/**
 * PUTs the scaffold dashboard config to the API for the given legal entity,
 * then refreshes all admin data.
 */
export async function pushScaffoldConfig(legalEntityId: string) {
  const config = scaffoldDashboardStructure()

  await apiRequest({
    url: `/legal-entities/${legalEntityId}/config`,
    method: 'PUT',
    data: config,
  })

  await refreshAdminConfig()
}
