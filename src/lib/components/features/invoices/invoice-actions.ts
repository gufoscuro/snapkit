import type { InvoiceState, InvoiceTransition } from '$lib/types/api-types'
import * as m from '$lib/paraglide/messages.js'
import {
  createArchiveRecordAction,
  type RecordAction,
  type RecordActionRequestOptions,
} from '$lib/utils/record-actions'
import { api } from '$lib/utils/request'

export type InvoiceActionOptions = RecordActionRequestOptions & {
  documentNumber: string
  version: number
  state: InvoiceState
  availableTransitions: InvoiceTransition[]
}

type CreateInvoiceActionsOptions = {
  legalEntityId: string
  onSuccess?: () => void | Promise<void>
  onDeleted?: () => void
}

/**
 * Build the action set for an invoice record. Visibility of each entry is
 * driven by `availableTransitions` returned by the API plus the current
 * `state`, so the FE never duplicates the backend's transition rules.
 */
export function createInvoiceActions({
  legalEntityId,
  onSuccess,
  onDeleted,
}: CreateInvoiceActionsOptions): RecordAction<InvoiceActionOptions>[] {
  return [
    {
      id: 'submit',
      label: m.invoice_submit_to_sdi(),
      confirmation: true,
      confirmationText: opts => m.invoice_submit_confirmation({ name: opts.documentNumber }),
      successMessage: () => m.invoice_submitted_successfully(),
      errorMessage: m.invoice_action_error(),
      visible: opts => opts.availableTransitions.includes('submit'),
      onAction: async opts => {
        await api.post(`/legal-entities/${legalEntityId}/invoices/${opts.targetId}/transition`, {
          data: { transition: 'submit' },
        })
        await onSuccess?.()
      },
    },
    {
      id: 'resubmit',
      label: m.invoice_resubmit_to_sdi(),
      confirmation: true,
      confirmationText: opts => m.invoice_resubmit_confirmation({ name: opts.documentNumber }),
      successMessage: () => m.invoice_submitted_successfully(),
      errorMessage: m.invoice_action_error(),
      visible: opts => opts.availableTransitions.includes('resubmit'),
      onAction: async opts => {
        await api.post(`/legal-entities/${legalEntityId}/invoices/${opts.targetId}/transition`, {
          data: { transition: 'resubmit' },
        })
        await onSuccess?.()
      },
    },
    {
      id: 'validate',
      label: m.invoice_validate(),
      successMessage: () => m.invoice_validated_successfully(),
      errorMessage: m.invoice_action_error(),
      // Validate non muta lo stato — esponiamolo finché la bozza è modificabile.
      visible: opts => opts.state === 'draft',
      onAction: async opts => {
        await api.post(`/legal-entities/${legalEntityId}/invoices/${opts.targetId}/validate`)
        await onSuccess?.()
      },
    },
    {
      id: 'archive',
      label: m.invoice_archive(),
      confirmation: true,
      confirmationText: opts => m.invoice_archive_confirmation({ name: opts.documentNumber }),
      successMessage: () => m.invoice_archived_successfully(),
      errorMessage: m.invoice_action_error(),
      visible: opts => opts.availableTransitions.includes('archive'),
      onAction: async opts => {
        await api.post(`/legal-entities/${legalEntityId}/invoices/${opts.targetId}/transition`, {
          data: { transition: 'archive' },
        })
        await onSuccess?.()
      },
    },
    // Hard delete only meaningful on a `draft` row that the user wants to drop
    // entirely (e.g. a wrong test invoice). For sent/accepted/error rows the
    // backend exposes the `archive` transition above instead.
    createArchiveRecordAction<InvoiceActionOptions>({
      apiUrl: opts => `/legal-entities/${legalEntityId}/invoices/${opts.targetId}`,
      isArchivable: opts => opts.state === 'draft',
      confirmMessage: opts => m.invoice_delete_confirmation({ name: opts.documentNumber }),
      successMessage: () => m.invoice_deleted_successfully(),
      errorMessage: m.invoice_action_error(),
      onSuccess: () => onDeleted?.(),
    }),
  ]
}
