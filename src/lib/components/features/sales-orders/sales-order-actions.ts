import { createFlagToggleAction, type RecordAction, type RecordActionRequestOptions } from '$lib/utils/record-actions'
import type { SalesOrderStatus } from '$lib/types/api-types'
import { api } from '$lib/utils/request'
import * as m from '$lib/paraglide/messages.js'

export type SalesOrderActionOptions = RecordActionRequestOptions & {
	documentNumber: string
	version: number
	state: SalesOrderStatus
	sentAt: string | null
}

type CreateSalesOrderActionsOptions = {
	legalEntityId: string
	onSuccess?: () => void | Promise<void>
}

export function createSalesOrderActions({ legalEntityId, onSuccess }: CreateSalesOrderActionsOptions): RecordAction<SalesOrderActionOptions>[] {
	return [
		createFlagToggleAction<SalesOrderActionOptions>({
			id: 'toggle-sent',
			flag: 'sent',
			isActive: (opts) => !!opts.sentAt,
			apiUrl: (opts) => `/legal-entities/${legalEntityId}/sales-orders/${opts.targetId}/flags`,
			getVersion: (opts) => opts.version,
			label: {
				set: m.mark_as_sent(),
				unset: m.mark_as_not_sent(),
			},
			confirmation: {
				set: (opts) => m.mark_sales_order_as_sent_confirmation({ name: opts.documentNumber }),
				unset: (opts) => m.mark_sales_order_as_not_sent_confirmation({ name: opts.documentNumber }),
			},
			successMessage: {
				set: (opts) => m.sales_order_marked_as_sent({ name: opts.documentNumber }),
				unset: (opts) => m.sales_order_marked_as_not_sent({ name: opts.documentNumber }),
			},
			errorMessage: m.flag_action_error(),
			onSuccess,
		}),
		{
			id: 'approve',
			label: m.approve_sales_order(),
			confirmation: true,
			confirmationText: (opts) => m.approve_sales_order_confirmation({ name: opts.documentNumber }),
			successMessage: (opts) => m.sales_order_approved_success({ name: opts.documentNumber }),
			errorMessage: m.flag_action_error(),
			visible: (opts) => opts.state === 'open',
			onAction: async (opts) => {
				await api.post(`/legal-entities/${legalEntityId}/sales-orders/${opts.targetId}/transition`, {
					data: { transition: 'approve' },
				})
				await onSuccess?.()
			},
		},
		{
			id: 'reject',
			label: m.reject_sales_order(),
			confirmation: true,
			confirmationText: (opts) => m.reject_sales_order_confirmation({ name: opts.documentNumber }),
			confirmationVariant: 'destructive',
			successMessage: (opts) => m.sales_order_rejected_success({ name: opts.documentNumber }),
			errorMessage: m.flag_action_error(),
			visible: (opts) => opts.state === 'open',
			onAction: async (opts) => {
				await api.post(`/legal-entities/${legalEntityId}/sales-orders/${opts.targetId}/transition`, {
					data: { transition: 'reject' },
				})
				await onSuccess?.()
			},
		},
	]
}
