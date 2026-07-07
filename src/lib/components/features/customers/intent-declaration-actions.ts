import {
  createArchiveRecordAction,
  type RecordAction,
  type RecordActionRequestOptions,
} from '$lib/utils/record-actions'
import type { IntentDeclarationStatus } from '$lib/types/api-types'
import { api } from '$lib/utils/request'
import * as m from '$lib/paraglide/messages.js'

export type IntentDeclarationActionOptions = RecordActionRequestOptions & {
  protocol: string
  version: number
  status: IntentDeclarationStatus
  verifiedAt: string | null
  revokedAt: string | null
  invalidatedAt: string | null
  isArchivable?: boolean
}

type CreateIntentDeclarationActionsOptions = {
  legalEntityId: string
  customerId: string
  onSuccess?: () => void | Promise<void>
  onArchived?: () => void
}

/**
 * Lifecycle record actions for an intent declaration.
 *
 * Unlike documents with a Spatie state machine, intent declarations expose no
 * `available_transitions`. Visibility mirrors the backend rules from the computed
 * status + flags: `verify` only from draft, `revoke` once verified and still alive,
 * `invalidate` from any non-invalidated state (also the manual PEC entry point).
 * Each verb POSTs to its dedicated endpoint (empty body) and refetches on success.
 */
export function createIntentDeclarationActions({
  legalEntityId,
  customerId,
  onSuccess,
  onArchived,
}: CreateIntentDeclarationActionsOptions): RecordAction<IntentDeclarationActionOptions>[] {
  const base = (id: string) => `/legal-entities/${legalEntityId}/customers/${customerId}/intent-declarations/${id}`

  return [
    {
      id: 'verify',
      label: m.verify_intent_declaration(),
      confirmation: true,
      confirmationText: opts => m.verify_intent_declaration_confirmation({ protocol: opts.protocol }),
      successMessage: opts => m.intent_declaration_verified_success({ protocol: opts.protocol }),
      errorMessage: m.intent_declaration_action_error(),
      visible: opts => opts.status === 'draft',
      onAction: async opts => {
        await api.post(`${base(opts.targetId)}/verify`, { data: {} })
        await onSuccess?.()
      },
    },
    {
      id: 'revoke',
      label: m.revoke_intent_declaration(),
      confirmation: true,
      confirmationVariant: 'destructive',
      confirmationText: opts => m.revoke_intent_declaration_confirmation({ protocol: opts.protocol }),
      successMessage: opts => m.intent_declaration_revoked_success({ protocol: opts.protocol }),
      errorMessage: m.intent_declaration_action_error(),
      // Verified and still alive (a wrong draft is deleted, not revoked).
      visible: opts => ['active', 'exhausted', 'expired'].includes(opts.status),
      onAction: async opts => {
        await api.post(`${base(opts.targetId)}/revoke`, { data: {} })
        await onSuccess?.()
      },
    },
    {
      id: 'invalidate',
      label: m.invalidate_intent_declaration(),
      confirmation: true,
      confirmationVariant: 'destructive',
      confirmationText: opts => m.invalidate_intent_declaration_confirmation({ protocol: opts.protocol }),
      successMessage: opts => m.intent_declaration_invalidated_success({ protocol: opts.protocol }),
      errorMessage: m.intent_declaration_action_error(),
      visible: opts => opts.status !== 'invalidated',
      onAction: async opts => {
        await api.post(`${base(opts.targetId)}/invalidate`, { data: {} })
        await onSuccess?.()
      },
    },
    createArchiveRecordAction<IntentDeclarationActionOptions>({
      apiUrl: opts => base(opts.targetId),
      isArchivable: opts => opts.isArchivable,
      confirmMessage: () => m.archive_intent_declaration_confirmation(),
      successMessage: () => m.intent_declaration_archived_success(),
      errorMessage: m.intent_declaration_archive_error(),
      onSuccess: () => onArchived?.(),
    }),
  ]
}
