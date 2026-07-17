import type { Tenant } from '$lib/types/api-types'

/**
 * Mock data for TenantLegalEntitySelector preview: the shape of GET /api/tenants,
 * trimmed to the fields the selector reads (it groups by tenant and lists entities).
 */
export const mockTenants: Partial<Tenant>[] = [
  {
    id: '3f2b8c10-4e5a-4c31-9a77-1d2e3f4a5b60',
    name: 'Moddo S.r.l.',
    vanity: 'moddo',
    legal_entities: [
      { id: 'a1b2c3d4-1111-4a2b-8c3d-000000000001', name: 'Moddo S.r.l.' },
      { id: 'a1b2c3d4-1111-4a2b-8c3d-000000000002', name: 'Moddo Logistics S.r.l.' },
    ] as Tenant['legal_entities'],
  },
  {
    id: '7c9d1e20-6f7a-4b53-8e91-2a3b4c5d6e70',
    name: 'Acme Industriale S.p.A.',
    vanity: 'acme',
    legal_entities: [
      { id: 'b2c3d4e5-2222-4b3c-9d4e-000000000001', name: 'Acme Industriale S.p.A.' },
    ] as Tenant['legal_entities'],
  },
  {
    id: '9e1f3a40-8b9c-4d75-a012-3c4d5e6f7a80',
    name: 'Costruzioni Metalliche Lombarde S.r.l.',
    vanity: 'cml',
    legal_entities: [
      { id: 'c3d4e5f6-3333-4c4d-ae5f-000000000001', name: 'CML Produzione S.r.l.' },
      { id: 'c3d4e5f6-3333-4c4d-ae5f-000000000002', name: 'CML Service S.r.l.' },
    ] as Tenant['legal_entities'],
  },
]

/** The tenant owning the current origin in the preview — drives same-vs-cross-tenant rendering. */
export const mockOriginTenantId = '3f2b8c10-4e5a-4c31-9a77-1d2e3f4a5b60'
