import type { LegalEntityConfigResponse } from '$lib/stores/tenant-config/types'

export const mockLegalEntityConfig: LegalEntityConfigResponse = {
  version: 1,
  resources: {
    customers: {
      fields: {
        email: { visible: true, required: true },
        phone: { visible: true, required: false },
        vat_number: { visible: true, required: false },
      },
      custom_fields: [
        { key: 'loyalty_tier', label: 'Loyalty Tier', type: 'select', required: false, options: ['bronze', 'silver', 'gold'] },
      ],
    },
    suppliers: {
      fields: {
        email: { visible: true, required: true },
        website: { visible: false },
      },
      custom_fields: [],
    },
  },
  dashboard: {
    pages: [
      {
        $id: 'dashboard-home',
        title: 'Dashboard',
        route: '/',
        layout: { componentKey: 'DefaultLayout', props: {} },
        snippets: {},
      },
    ],
    menus: {
      main: {
        id: 'main',
        name: 'Main Menu',
        items: [
          { type: 'link', label: 'Dashboard', pageId: 'dashboard-home', icon: 'home' },
        ],
      },
    },
  },
  created_by: 'mock-user',
  created_at: '2026-01-15T10:00:00Z',
}
