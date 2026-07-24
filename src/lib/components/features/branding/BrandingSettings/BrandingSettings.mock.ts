import type { LegalEntity, UserResource } from '$lib/types/api-types'

/**
 * Mock props for BrandingSettings preview. The component reads only `legalEntity.id`
 * (to build the branding API paths) and the user's edit permission, so the mocks are
 * trimmed to those fields.
 */
export const mockLegalEntity: Partial<LegalEntity> = {
  id: 'a1b2c3d4-1111-4a2b-8c3d-000000000001',
  name: 'Acme Industriale S.p.A.',
}

/** A user allowed to edit branding — drives the editable (vs read-only) rendering. */
export const mockUser: Partial<UserResource> = {
  id: 'u1b2c3d4-1111-4a2b-8c3d-000000000001',
  name: 'Preview User',
  is_superadmin: false,
  all_permissions: ['view-legal-entities', 'edit-legal-entities'],
}
