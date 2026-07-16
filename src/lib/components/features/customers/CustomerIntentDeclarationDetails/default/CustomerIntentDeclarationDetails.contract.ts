import { Type } from '@sinclair/typebox'
import type { ComponentContract } from '$lib/contexts/page-state'

/**
 * Schema for the intent declaration data provided by this component.
 * Matches the IntentDeclaration type from api-types.ts. Consumed by
 * IntentDeclarationSidebar and re-provided by the usages subpage.
 */
export const IntentDeclarationDataSchema = Type.Object({
  id: Type.String(),
  customer_id: Type.String(),
  protocol_number: Type.String(),
  protocol_progressive: Type.String(),
  protocol: Type.String(),
  receipt_date: Type.String(),
  reference_year: Type.Number(),
  amount_type: Type.Union([Type.Literal('single_operation'), Type.Literal('up_to_amount')]),
  declared_amount: Type.Number(),
  used_amount: Type.Number(),
  residual_amount: Type.Number(),
  is_customs: Type.Boolean(),
  status: Type.Union([
    Type.Literal('draft'),
    Type.Literal('active'),
    Type.Literal('exhausted'),
    Type.Literal('revoked'),
    Type.Literal('invalidated'),
    Type.Literal('expired'),
  ]),
  verified_at: Type.Union([Type.String(), Type.Null()]),
  verified_by: Type.Union([Type.String(), Type.Null()]),
  revoked_at: Type.Union([Type.String(), Type.Null()]),
  invalidated_at: Type.Union([Type.String(), Type.Null()]),
  note: Type.String(),
  version: Type.Number(),
})

/**
 * Contract for CustomerIntentDeclarationDetails component.
 * - Provides: intentDeclaration data (shared with the sidebar on the same page)
 * - Consumes: nothing
 */
export const CustomerIntentDeclarationDetailsContract = {
  $id: 'CustomerIntentDeclarationDetails',
  provides: {
    intentDeclaration: IntentDeclarationDataSchema,
  },
  consumes: {},
} as const satisfies ComponentContract
