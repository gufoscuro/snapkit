/**
 * Mock data for ShadowModeIndicator preview.
 *
 * The realistic shape: a Moddo operator (the team building the product) acting
 * inside a customer's tenant.
 */
export const mockShadowModeIndicator = {
  homeTenantName: 'Moddo S.r.l.',
  homeVanity: 'moddo',
  actingAsVanity: 'acme',
}

/** A tenant whose vanity is long enough to exercise truncation. */
export const mockShadowModeIndicatorLongVanity = {
  homeTenantName: 'Moddo S.r.l.',
  homeVanity: 'moddo',
  actingAsVanity: 'costruzioni-metalliche-lombarde',
}
