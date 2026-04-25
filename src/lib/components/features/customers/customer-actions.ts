import {
	createArchiveRecordAction,
	createFlagToggleAction,
	type RecordAction,
	type RecordActionRequestOptions,
} from '$lib/utils/record-actions'
import * as m from '$lib/paraglide/messages.js'

export type CustomerFlagOptions = RecordActionRequestOptions & {
	name: string
	version: number
	suspendedAt: string | null
	ceasedAt: string | null
	isArchivable?: boolean
}

type CreateCustomerFlagActionsOptions = {
	legalEntityId: string
	onSuccess?: () => void | Promise<void>
	onArchived?: () => void
}

export function createCustomerFlagActions({ legalEntityId, onSuccess, onArchived }: CreateCustomerFlagActionsOptions): RecordAction<CustomerFlagOptions>[] {
	return [
		createFlagToggleAction<CustomerFlagOptions>({
			id: 'toggle-suspend',
			flag: 'suspended',
			isActive: (opts) => !!opts.suspendedAt,
			apiUrl: (opts) => `/legal-entities/${legalEntityId}/customers/${opts.targetId}/flags`,
			getVersion: (opts) => opts.version,
			label: {
				set: m.suspend_customer(),
				unset: m.unsuspend_customer(),
			},
			confirmation: {
				set: (opts) => m.suspend_customer_confirmation({ name: opts.name }),
				unset: (opts) => m.unsuspend_customer_confirmation({ name: opts.name }),
			},
			confirmationVariant: { set: 'destructive' },
			successMessage: {
				set: (opts) => m.customer_suspended_success({ name: opts.name }),
				unset: (opts) => m.customer_unsuspended_success({ name: opts.name }),
			},
			errorMessage: m.flag_action_error(),
			onSuccess,
		}),
		createFlagToggleAction<CustomerFlagOptions>({
			id: 'toggle-cease',
			flag: 'ceased',
			isActive: (opts) => !!opts.ceasedAt,
			apiUrl: (opts) => `/legal-entities/${legalEntityId}/customers/${opts.targetId}/flags`,
			getVersion: (opts) => opts.version,
			label: {
				set: m.cease_customer(),
				unset: m.uncease_customer(),
			},
			confirmation: {
				set: (opts) => m.cease_customer_confirmation({ name: opts.name }),
				unset: (opts) => m.uncease_customer_confirmation({ name: opts.name }),
			},
			confirmationVariant: { set: 'destructive' },
			successMessage: {
				set: (opts) => m.customer_ceased_success({ name: opts.name }),
				unset: (opts) => m.customer_unceased_success({ name: opts.name }),
			},
			errorMessage: m.flag_action_error(),
			onSuccess,
		}),
		createArchiveRecordAction<CustomerFlagOptions>({
			apiUrl: (opts) => `/legal-entities/${legalEntityId}/customers/${opts.targetId}`,
			isArchivable: (opts) => opts.isArchivable,
			confirmMessage: (opts) => m.archive_customer_confirmation({ name: opts.name }),
			successMessage: (opts) => m.customer_archived_success({ name: opts.name }),
			errorMessage: m.customer_archive_error(),
			onSuccess: () => onArchived?.(),
		}),
	]
}
