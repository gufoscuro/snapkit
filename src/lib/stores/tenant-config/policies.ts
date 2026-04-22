import type { LegalEntityConfigResponse } from './types'

export const ItemCodeGeneration = {
  Automatic: 'automatic',
  Manual: 'manual',
} as const
export type ItemCodeGenerationMode = (typeof ItemCodeGeneration)[keyof typeof ItemCodeGeneration]

export type LegalEntityPolicies = {
  item_code_generation: ItemCodeGenerationMode
}

export const POLICY_DEFAULTS: LegalEntityPolicies = {
  item_code_generation: ItemCodeGeneration.Automatic,
}

export function getPolicy<K extends keyof LegalEntityPolicies>(
  entityConfig: LegalEntityConfigResponse | null | undefined,
  key: K,
): LegalEntityPolicies[K] {
  return (entityConfig?.policies?.[key] ?? POLICY_DEFAULTS[key]) as LegalEntityPolicies[K]
}
