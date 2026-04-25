import {
	createArchiveRecordAction,
	createFlagToggleAction,
	type RecordAction,
	type RecordActionRequestOptions,
} from '$lib/utils/record-actions'
import * as m from '$lib/paraglide/messages.js'

export type SupplierFlagOptions = RecordActionRequestOptions & {
	name: string
	version: number
	suspendedAt: string | null
	ceasedAt: string | null
	isArchivable?: boolean
}

type CreateSupplierFlagActionsOptions = {
	legalEntityId: string
	onSuccess?: () => void | Promise<void>
	onArchived?: () => void
}

export function createSupplierFlagActions({ legalEntityId, onSuccess, onArchived }: CreateSupplierFlagActionsOptions): RecordAction<SupplierFlagOptions>[] {
	return [
		createFlagToggleAction<SupplierFlagOptions>({
			id: 'toggle-suspend',
			flag: 'suspended',
			isActive: (opts) => !!opts.suspendedAt,
			apiUrl: (opts) => `/legal-entities/${legalEntityId}/suppliers/${opts.targetId}/flags`,
			getVersion: (opts) => opts.version,
			label: {
				set: m.suspend_supplier(),
				unset: m.unsuspend_supplier(),
			},
			confirmation: {
				set: (opts) => m.suspend_supplier_confirmation({ name: opts.name }),
				unset: (opts) => m.unsuspend_supplier_confirmation({ name: opts.name }),
			},
			confirmationVariant: { set: 'destructive' },
			successMessage: {
				set: (opts) => m.supplier_suspended_success({ name: opts.name }),
				unset: (opts) => m.supplier_unsuspended_success({ name: opts.name }),
			},
			errorMessage: m.flag_action_error(),
			onSuccess,
		}),
		createFlagToggleAction<SupplierFlagOptions>({
			id: 'toggle-cease',
			flag: 'ceased',
			isActive: (opts) => !!opts.ceasedAt,
			apiUrl: (opts) => `/legal-entities/${legalEntityId}/suppliers/${opts.targetId}/flags`,
			getVersion: (opts) => opts.version,
			label: {
				set: m.cease_supplier(),
				unset: m.uncease_supplier(),
			},
			confirmation: {
				set: (opts) => m.cease_supplier_confirmation({ name: opts.name }),
				unset: (opts) => m.uncease_supplier_confirmation({ name: opts.name }),
			},
			confirmationVariant: { set: 'destructive' },
			successMessage: {
				set: (opts) => m.supplier_ceased_success({ name: opts.name }),
				unset: (opts) => m.supplier_unceased_success({ name: opts.name }),
			},
			errorMessage: m.flag_action_error(),
			onSuccess,
		}),
		createArchiveRecordAction<SupplierFlagOptions>({
			apiUrl: (opts) => `/legal-entities/${legalEntityId}/suppliers/${opts.targetId}`,
			isArchivable: (opts) => opts.isArchivable,
			confirmMessage: (opts) => m.archive_supplier_confirmation({ name: opts.name }),
			successMessage: (opts) => m.supplier_archived_success({ name: opts.name }),
			errorMessage: m.supplier_archive_error(),
			onSuccess: () => onArchived?.(),
		}),
	]
}
