import type { LegalEntityConfigResponse } from '$lib/stores/tenant-config/types'
import type { DashboardOverride } from './types'

export { applyOverrides, type ApplyOverridesResult } from './apply'
export {
  type OverrideError,
  OVERRIDE_OPS,
  parseOverrides,
  type ParseOverridesResult,
  validateOverrides,
} from './schema'
export * from './types'

/** Overrides stored in a legal entity config (empty when there is no config or none were saved). */
export function getStoredOverrides(config: LegalEntityConfigResponse | null | undefined): DashboardOverride[] {
  return config?.dashboard?.overrides ?? []
}

/** One-line, human-readable target of an override, e.g. `transport-document-details › content`. */
export function describeOverride(override: DashboardOverride): string {
  switch (override.op) {
    case 'snippet':
      return `${override.page} › ${override.slot}`
    case 'page.add':
      return `+ ${override.parent ? `${override.parent} › ` : ''}${override.page.$id}`
  }
}
