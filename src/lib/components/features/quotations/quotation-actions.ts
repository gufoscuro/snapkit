import * as m from '$lib/paraglide/messages.js'
import type { QuotationStatus } from '$lib/types/api-types'
import { createFlagToggleAction, type RecordAction, type RecordActionRequestOptions } from '$lib/utils/record-actions'
import { api } from '$lib/utils/request'

export type QuotationActionOptions = RecordActionRequestOptions & {
  documentNumber: string
  version: number
  state: QuotationStatus
  sentAt: string | null
  availableTransitions: string[]
}

type CreateQuotationActionsOptions = {
  legalEntityId: string
  onSuccess?: () => void | Promise<void>
}

export function createQuotationActions({
  legalEntityId,
  onSuccess,
}: CreateQuotationActionsOptions): RecordAction<QuotationActionOptions>[] {
  return [
    createFlagToggleAction<QuotationActionOptions>({
      id: 'toggle-sent',
      flag: 'sent',
      isActive: opts => !!opts.sentAt,
      apiUrl: opts => `/legal-entities/${legalEntityId}/quotations/${opts.targetId}/flags`,
      getVersion: opts => opts.version,
      label: {
        set: m.mark_as_sent(),
        unset: m.mark_as_not_sent(),
      },
      confirmation: {
        set: opts => m.mark_as_sent_confirmation({ name: opts.documentNumber }),
        unset: opts => m.mark_as_not_sent_confirmation({ name: opts.documentNumber }),
      },
      successMessage: {
        set: opts => m.quotation_marked_as_sent({ name: opts.documentNumber }),
        unset: opts => m.quotation_marked_as_not_sent({ name: opts.documentNumber }),
      },
      errorMessage: m.flag_action_error(),
      visible: opts => opts.state === 'open',
      onSuccess,
    }),
    {
      id: 'approve',
      label: m.approve_quotation(),
      confirmation: true,
      confirmationText: opts => m.approve_quotation_confirmation({ name: opts.documentNumber }),
      successMessage: opts => m.quotation_approved_success({ name: opts.documentNumber }),
      errorMessage: m.flag_action_error(),
      visible: opts => opts.availableTransitions.includes('approve'),
      onAction: async opts => {
        await api.post(`/legal-entities/${legalEntityId}/quotations/${opts.targetId}/transition`, {
          data: { transition: 'approve' },
        })
        await onSuccess?.()
      },
    },
    {
      id: 'reject',
      label: m.reject_quotation(),
      confirmation: true,
      confirmationText: opts => m.reject_quotation_confirmation({ name: opts.documentNumber }),
      confirmationVariant: 'destructive',
      successMessage: opts => m.quotation_rejected_success({ name: opts.documentNumber }),
      errorMessage: m.flag_action_error(),
      visible: opts => opts.availableTransitions.includes('reject'),
      onAction: async opts => {
        await api.post(`/legal-entities/${legalEntityId}/quotations/${opts.targetId}/transition`, {
          data: { transition: 'reject' },
        })
        await onSuccess?.()
      },
    },
    {
      id: 'reopen',
      label: m.reopen_quotation(),
      confirmation: true,
      confirmationText: opts => m.reopen_quotation_confirmation({ name: opts.documentNumber }),
      successMessage: opts => m.quotation_reopened_success({ name: opts.documentNumber }),
      errorMessage: m.flag_action_error(),
      visible: opts => opts.availableTransitions.includes('reopen'),
      onAction: async opts => {
        await api.post(`/legal-entities/${legalEntityId}/quotations/${opts.targetId}/transition`, {
          data: { transition: 'reopen' },
        })
        await onSuccess?.()
      },
    },
  ]
}
