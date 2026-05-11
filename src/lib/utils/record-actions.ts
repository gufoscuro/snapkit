import { toast } from 'svelte-sonner'
import { confirmAction } from '$lib/components/ui/confirm-action-dialog'
import { confirmArchive } from '$lib/components/ui/confirm-archive-dialog'
import { api, apiRequest } from '$lib/utils/request'
import * as m from '$lib/paraglide/messages.js'
import type { ButtonVariant } from '$lib/components/ui/button'
import type { Component } from 'svelte'
import Archive from '@lucide/svelte/icons/archive'

/**
 * Base options passed to every action callback.
 * Extend this for domain-specific params.
 */
export type RecordActionRequestOptions = {
	targetId: string
}

/**
 * A single record action definition.
 * Pure data — no UI dependencies.
 */
export type RecordAction<T extends RecordActionRequestOptions = RecordActionRequestOptions> = {
	/** Unique action identifier (e.g., 'suspend', 'confirm-order') */
	id: string
	/** Display label — use m.xxx() from paraglide. Can be a function for dynamic labels. */
	label: string | ((options: T) => string)
	/** Optional lucide icon component */
	icon?: Component<Record<string, any>>
	/** Dynamic icon resolver — takes precedence over `icon` when provided (e.g., toggle actions) */
	resolveIcon?: (options: T) => Component<Record<string, any>> | undefined
	/** Whether this action requires confirmation before execution */
	confirmation?: boolean
	/** Custom confirmation dialog description. When omitted, uses default message. */
	confirmationText?: string | ((options: T) => string)
	/** Custom confirmation dialog title. When omitted, uses m.confirm_action(). */
	confirmationTitle?: string | ((options: T) => string)
	/** Button variant for the confirmation dialog's confirm button. Can be a function for dynamic variants. */
	confirmationVariant?: ButtonVariant | ((options: T) => ButtonVariant)
	/** Success message shown as toast after action completes */
	successMessage?: string | ((options: T) => string)
	/** Error message shown as toast if action fails */
	errorMessage?: string | ((options: T) => string)
	/** The action handler — a pure async function */
	onAction: (options: T) => Promise<void>
	/** Conditionally show this action */
	visible?: (options: T) => boolean
	/** Conditionally disable this action */
	disabled?: (options: T) => boolean
	/** Render a separator above this action in the dropdown menu (e.g. to set apart destructive actions) */
	separatorBefore?: boolean
}

/**
 * Resolves a value that can be either a string or a function returning a string.
 */
function resolveText<T>(value: string | ((options: T) => string) | undefined, options: T, fallback: string): string {
	if (value === undefined) return fallback
	return typeof value === 'function' ? value(options) : value
}

/**
 * Executes a record action, handling confirmation if required.
 * This is the bridge between pure action definitions and the UI.
 *
 * Usable anywhere: RecordActionMenu, standalone buttons, keyboard handlers, etc.
 *
 * @example
 * ```ts
 * await executeRecordAction(suspendAction, { targetId: customer.id, name: customer.name })
 * ```
 */
export async function executeRecordAction<T extends RecordActionRequestOptions>(
	action: RecordAction<T>,
	options: T
): Promise<void> {
	if (action.confirmation) {
		const variant = typeof action.confirmationVariant === 'function'
			? action.confirmationVariant(options)
			: action.confirmationVariant

		confirmAction({
			title: resolveText(action.confirmationTitle, options, m.confirm_action()),
			description: resolveText(action.confirmationText, options, m.confirm_action_default_description()),
			variant,
			onConfirm: () => action.onAction(options),
			successMessage: action.successMessage ? resolveText(action.successMessage, options, '') : undefined,
			errorMessage: action.errorMessage ? resolveText(action.errorMessage, options, '') : undefined,
		})
	} else {
		try {
			await action.onAction(options)

			const successMsg = action.successMessage ? resolveText(action.successMessage, options, '') : undefined
			if (successMsg) {
				toast.success(successMsg)
			}
		} catch (err) {
			console.error(`Action "${action.id}" failed:`, err)

			const errorMsg = action.errorMessage ? resolveText(action.errorMessage, options, '') : undefined
			if (errorMsg) {
				toast.error(errorMsg)
			}
		}
	}
}

// ---------------------------------------------------------------------------
// Flag toggle factory
// ---------------------------------------------------------------------------

/**
 * Configuration for a flag toggle action.
 * The `set` branch applies when the flag is currently OFF (will be turned ON).
 * The `unset` branch applies when the flag is currently ON (will be turned OFF).
 */
export type FlagToggleConfig<T extends RecordActionRequestOptions = RecordActionRequestOptions> = {
	/** Unique action id (e.g., 'toggle-suspend') */
	id: string
	/** The flag key sent to the API body (e.g., 'suspended', 'ceased') */
	flag: string
	/** Returns true when the flag is currently active on the record */
	isActive: (opts: T) => boolean
	/** Builds the flags endpoint URL */
	apiUrl: (opts: T) => string
	/** Extracts the optimistic concurrency version from options */
	getVersion: (opts: T) => number
	/** Labels for each direction */
	label: {
		set: string | ((opts: T) => string)
		unset: string | ((opts: T) => string)
	}
	/** Icons for each direction (optional) */
	icon?: {
		set?: Component<Record<string, any>>
		unset?: Component<Record<string, any>>
	}
	/** Confirmation texts — if provided, confirmation dialog is shown */
	confirmation?: {
		set?: string | ((opts: T) => string)
		unset?: string | ((opts: T) => string)
	}
	/** Variant for the confirmation button */
	confirmationVariant?: {
		set?: ButtonVariant
		unset?: ButtonVariant
	}
	/** Success toast messages */
	successMessage?: {
		set?: string | ((opts: T) => string)
		unset?: string | ((opts: T) => string)
	}
	/** Error toast message (shared for both directions) */
	errorMessage?: string | ((opts: T) => string)
	/** Callback after a successful flag toggle (e.g., refetch the record) */
	onSuccess?: () => void | Promise<void>
	/** Conditionally show/hide the action */
	visible?: (opts: T) => boolean
	/** Conditionally disable the action */
	disabled?: (opts: T) => boolean
}

/**
 * Creates a RecordAction that toggles a boolean flag via a `/flags` endpoint.
 *
 * The action automatically switches label, icon, confirmation text, and API payload
 * based on the current state of the flag (determined by `isActive`).
 *
 * @example
 * ```ts
 * const toggleSuspend = createFlagToggleAction<CustomerActionOptions>({
 *   id: 'toggle-suspend',
 *   flag: 'suspended',
 *   isActive: (opts) => !!opts.suspendedAt,
 *   apiUrl: (opts) => `/legal-entities/${leId}/customers/${opts.targetId}/flags`,
 *   getVersion: (opts) => opts.version,
 *   label: {
 *     set: m.suspend_customer(),
 *     unset: m.unsuspend_customer(),
 *   },
 *   confirmation: {
 *     set: (opts) => m.suspend_customer_confirmation({ name: opts.name }),
 *     unset: (opts) => m.unsuspend_customer_confirmation({ name: opts.name }),
 *   },
 *   confirmationVariant: { set: 'destructive' },
 *   successMessage: {
 *     set: (opts) => m.customer_suspended_success({ name: opts.name }),
 *     unset: (opts) => m.customer_unsuspended_success({ name: opts.name }),
 *   },
 * })
 * ```
 */
export function createFlagToggleAction<T extends RecordActionRequestOptions>(
	config: FlagToggleConfig<T>
): RecordAction<T> {
	function pick<V>(pair: { set?: V; unset?: V } | undefined, opts: T): V | undefined {
		if (!pair) return undefined
		return config.isActive(opts) ? pair.unset : pair.set
	}

	return {
		id: config.id,
		label: (opts) => {
			const l = config.isActive(opts) ? config.label.unset : config.label.set
			return typeof l === 'function' ? l(opts) : l
		},
		resolveIcon: config.icon
			? (opts: T) => {
					return config.isActive(opts) ? config.icon!.unset : config.icon!.set
				}
			: undefined,
		confirmation: !!(config.confirmation?.set || config.confirmation?.unset),
		confirmationText: config.confirmation
			? (opts) => {
					const text = pick(config.confirmation!, opts)
					if (!text) return m.confirm_action_default_description()
					return typeof text === 'function' ? text(opts) : text
				}
			: undefined,
		confirmationVariant: config.confirmationVariant
			? (opts) => {
					const v = config.isActive(opts) ? config.confirmationVariant!.unset : config.confirmationVariant!.set
					return v ?? 'default'
				}
			: undefined,
		successMessage: config.successMessage
			? (opts) => {
					const text = pick(config.successMessage!, opts)
					if (!text) return ''
					return typeof text === 'function' ? text(opts) : text
				}
			: undefined,
		errorMessage: config.errorMessage,
		onAction: async (opts) => {
			const active = config.isActive(opts)
			await api.put(config.apiUrl(opts), {
				data: { [config.flag]: !active, version: config.getVersion(opts) },
			})
			await config.onSuccess?.()
		},
		visible: config.visible,
		disabled: config.disabled,
	}
}

// ---------------------------------------------------------------------------
// Archive action factory
// ---------------------------------------------------------------------------

/**
 * Configuration for an archive record action — symmetric to `createArchiveAction`
 * (used in tables) but produces a `RecordAction<T>` for use in `RecordActionMenu`.
 */
export type ArchiveRecordActionConfig<T extends RecordActionRequestOptions = RecordActionRequestOptions> = {
	/** Builds the URL for the DELETE request */
	apiUrl: (opts: T) => string
	/** URL for the GET that reads `is_archivable`. Defaults to `apiUrl(opts)`. */
	fetchUrl?: (opts: T) => string
	/**
	 * Returns the current `is_archivable` flag if known upfront (e.g. from the
	 * record already loaded on a detail page). When this returns `false` the
	 * action renders disabled. The dialog still runs the prefetch as a safety net.
	 */
	isArchivable?: (opts: T) => boolean | undefined
	/** Confirmation dialog message */
	confirmMessage: (opts: T) => string
	/** Success toast message */
	successMessage: (opts: T) => string
	/** Error toast message (optional) */
	errorMessage?: string
	/** Callback after a successful archive (e.g. goto listing page) */
	onSuccess?: (opts: T) => void
	/** Render a separator above this action in the menu. Defaults to true. */
	separatorBefore?: boolean
}

/**
 * Creates a `RecordAction` that archives a record.
 *
 * The action manages its own dialog (via `confirmArchive`), which gates the
 * DELETE on the record's `is_archivable` flag — when blocked, an informative
 * dialog explains why.
 *
 * @example
 * ```ts
 * createArchiveRecordAction<SupplierActionOptions>({
 *   apiUrl: (opts) => `supply/supplier/${opts.targetId}`,
 *   isArchivable: (opts) => opts.isArchivable,
 *   confirmMessage: (opts) => m.archive_supplier_confirmation({ name: opts.name }),
 *   successMessage: (opts) => m.supplier_archived_success({ name: opts.name }),
 *   onSuccess: () => goto('/suppliers'),
 * })
 * ```
 */
export function createArchiveRecordAction<T extends RecordActionRequestOptions>(
	config: ArchiveRecordActionConfig<T>,
): RecordAction<T> {
	return {
		id: 'archive',
		label: m.common_archive(),
		icon: Archive,
		separatorBefore: config.separatorBefore ?? true,
		disabled: (opts) => config.isArchivable?.(opts) === false,
		onAction: async (opts) => {
			confirmArchive({
				title: m.confirm_action(),
				description: config.confirmMessage(opts),
				confirmText: m.common_archive(),
				cancelText: m.common_cancel(),
				prefetch: async () => {
					const url = (config.fetchUrl ?? config.apiUrl)(opts)
					const record = await apiRequest<{ is_archivable?: boolean }>({ url })
					return { blocked: record.is_archivable === false }
				},
				blockedTitle: m.cannot_archive_title(),
				blockedDescription: m.cannot_archive_description(),
				onArchive: async () => {
					await apiRequest({ url: config.apiUrl(opts), method: 'DELETE' })
				},
				successMessage: config.successMessage(opts),
				errorMessage: config.errorMessage,
				onSuccess: () => config.onSuccess?.(opts),
			})
		},
	}
}
