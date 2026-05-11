import {
	createArchiveRecordAction,
	type RecordAction,
	type RecordActionRequestOptions,
} from '$lib/utils/record-actions'
import type { TransportDocumentState } from '$lib/types/api-types'
import { api } from '$lib/utils/request'
import * as m from '$lib/paraglide/messages.js'

export type TransportDocumentActionOptions = RecordActionRequestOptions & {
	documentNumber: string
	version: number
	state: TransportDocumentState
	availableTransitions: string[]
	isArchivable?: boolean
}

type CreateTransportDocumentActionsOptions = {
	legalEntityId: string
	onSuccess?: () => void | Promise<void>
	onArchived?: () => void
}

export function createTransportDocumentActions({
	legalEntityId,
	onSuccess,
	onArchived,
}: CreateTransportDocumentActionsOptions): RecordAction<TransportDocumentActionOptions>[] {
	return [
		{
			id: 'carry',
			label: m.carry_transport_document(),
			confirmation: true,
			confirmationText: opts => m.carry_transport_document_confirmation({ name: opts.documentNumber }),
			successMessage: opts => m.transport_document_carried_success({ name: opts.documentNumber }),
			errorMessage: m.flag_action_error(),
			visible: opts => opts.availableTransitions.includes('carry'),
			onAction: async opts => {
				await api.post(`/legal-entities/${legalEntityId}/transport-documents/${opts.targetId}/transition`, {
					data: { transition: 'carry' },
				})
				await onSuccess?.()
			},
		},
		{
			id: 'reopen',
			label: m.reopen_transport_document(),
			confirmation: true,
			confirmationText: opts => m.reopen_transport_document_confirmation({ name: opts.documentNumber }),
			successMessage: opts => m.transport_document_reopened_success({ name: opts.documentNumber }),
			errorMessage: m.flag_action_error(),
			visible: opts => opts.availableTransitions.includes('reopen'),
			onAction: async opts => {
				await api.post(`/legal-entities/${legalEntityId}/transport-documents/${opts.targetId}/transition`, {
					data: { transition: 'reopen' },
				})
				await onSuccess?.()
			},
		},
		createArchiveRecordAction<TransportDocumentActionOptions>({
			apiUrl: opts => `/legal-entities/${legalEntityId}/transport-documents/${opts.targetId}`,
			isArchivable: opts => opts.isArchivable,
			confirmMessage: opts => m.archive_transport_document_confirmation({ name: opts.documentNumber }),
			successMessage: opts => m.transport_document_archived_success({ name: opts.documentNumber }),
			errorMessage: m.transport_document_archive_error(),
			onSuccess: () => onArchived?.(),
		}),
	]
}
