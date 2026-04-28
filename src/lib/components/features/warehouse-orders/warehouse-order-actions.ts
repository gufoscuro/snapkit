import {
	createArchiveRecordAction,
	type RecordAction,
	type RecordActionRequestOptions,
} from '$lib/utils/record-actions'
import type { WarehouseOrderState } from '$lib/types/api-types'
import { api } from '$lib/utils/request'
import * as m from '$lib/paraglide/messages.js'

export type WarehouseOrderActionOptions = RecordActionRequestOptions & {
	documentNumber: string
	version: number
	state: WarehouseOrderState
	availableTransitions: string[]
	isArchivable?: boolean
}

type CreateWarehouseOrderActionsOptions = {
	legalEntityId: string
	onSuccess?: () => void | Promise<void>
	onArchived?: () => void
}

export function createWarehouseOrderActions({
	legalEntityId,
	onSuccess,
	onArchived,
}: CreateWarehouseOrderActionsOptions): RecordAction<WarehouseOrderActionOptions>[] {
	return [
		{
			id: 'hand-over',
			label: m.hand_over_warehouse_order(),
			confirmation: true,
			confirmationText: opts => m.hand_over_warehouse_order_confirmation({ name: opts.documentNumber }),
			successMessage: opts => m.warehouse_order_handed_over_success({ name: opts.documentNumber }),
			errorMessage: m.flag_action_error(),
			visible: opts => opts.availableTransitions.includes('hand_over'),
			onAction: async opts => {
				await api.post(`/legal-entities/${legalEntityId}/warehouse-orders/${opts.targetId}/transition`, {
					data: { transition: 'hand_over' },
				})
				await onSuccess?.()
			},
		},
		{
			id: 'reopen',
			label: m.reopen_warehouse_order(),
			confirmation: true,
			confirmationText: opts => m.reopen_warehouse_order_confirmation({ name: opts.documentNumber }),
			successMessage: opts => m.warehouse_order_reopened_success({ name: opts.documentNumber }),
			errorMessage: m.flag_action_error(),
			visible: opts => opts.availableTransitions.includes('reopen'),
			onAction: async opts => {
				await api.post(`/legal-entities/${legalEntityId}/warehouse-orders/${opts.targetId}/transition`, {
					data: { transition: 'reopen' },
				})
				await onSuccess?.()
			},
		},
		createArchiveRecordAction<WarehouseOrderActionOptions>({
			apiUrl: opts => `/legal-entities/${legalEntityId}/warehouse-orders/${opts.targetId}`,
			isArchivable: opts => opts.isArchivable,
			confirmMessage: opts => m.archive_warehouse_order_confirmation({ name: opts.documentNumber }),
			successMessage: opts => m.warehouse_order_archived_success({ name: opts.documentNumber }),
			errorMessage: m.warehouse_order_archive_error(),
			onSuccess: () => onArchived?.(),
		}),
	]
}
