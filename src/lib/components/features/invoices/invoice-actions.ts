import type { InvoiceState, InvoiceTransition } from '$lib/types/api-types'
import * as m from '$lib/paraglide/messages.js'
import {
  createArchiveRecordAction,
  type RecordAction,
  type RecordActionRequestOptions,
} from '$lib/utils/record-actions'
import { api, ApiError } from '$lib/utils/request'
import { toast } from 'svelte-sonner'

export type InvoiceActionOptions = RecordActionRequestOptions & {
  documentNumber: string
  version: number
  state: InvoiceState
  availableTransitions: InvoiceTransition[]
}

/**
 * Single SDI validation failure entry returned by `POST /invoices/{id}/validate`
 * inside `errors.violations[]` when the response is HTTP 400.
 */
export type SdiViolation = {
  propertyPath: string
  propertyContent?: string
  message: string
}

type CreateInvoiceActionsOptions = {
  legalEntityId: string
  onSuccess?: () => void | Promise<void>
  onDeleted?: () => void
  /** Called when the SDI validation passes — the UI shows a persistent badge. */
  onValidateSuccess?: () => void
  /**
   * Called when the SDI validation fails with HTTP 400 + a violations array.
   * The UI displays the violations at the top of the form. Other failure
   * kinds (network errors, 5xx, …) fall back to the generic error toast.
   */
  onValidateError?: (violations: SdiViolation[]) => void
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
  onValidateSuccess,
  onValidateError,
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
      // Toasts are handled inside `onAction` so a 400 with SDI violations can be
      // surfaced inline in the form (via `onValidateError`) without the generic
      // error toast firing on top of it.
      // Validate non muta lo stato — esponiamolo finché la bozza è modificabile.
      visible: opts => opts.state === 'draft',
      onAction: async opts => {
        try {
          await api.post(`/legal-entities/${legalEntityId}/invoices/${opts.targetId}/validate`)
          toast.success(m.invoice_validated_successfully())
          onValidateSuccess?.()
          // Intentionally skip `onSuccess` (refetch): validate is a pure check and
          // does not mutate the record. Refetching would replay the load promise
          // and make RequestPlaceholder unmount/remount FormUtil — visible flicker.
        } catch (err) {
          if (err instanceof ApiError && err.status === 400) {
            const violations = (err.data?.errors as { violations?: unknown })?.violations
            if (Array.isArray(violations) && violations.length > 0) {
              onValidateError?.(violations as SdiViolation[])
              return
            }
          }
          toast.error(m.invoice_action_error())
        }
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
