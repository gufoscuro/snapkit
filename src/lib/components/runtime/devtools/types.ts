import type { PageState } from '$lib/contexts/page-state'

/**
 * Function that returns current form data when called.
 * Lazy evaluation - only called when Forms tab is active.
 */
export type FormDataGetter = () => {
	values: Record<string, unknown>
	errors: Record<string, string | undefined>
	touched: Record<string, boolean | undefined>
	isValid: boolean
	isDirty: boolean
	inflight: boolean
}

/**
 * Form registration entry in the registry.
 */
export type FormDebugInfo = {
	/** Unique ID for this form instance */
	id: string
	/** Human-readable label (e.g., "Order Form", "Customer Details") */
	label: string
	/** Lazy data getter - called only when Forms tab is active */
	getData: FormDataGetter
}

/**
 * Page details registration entry.
 */
export type PageDetailsInfo = {
	/** Lazy getter for page configuration */
	getData: () => {
		title: string
		route: string
		params: Record<string, string>
		config: unknown
		tenantInterfaceDetails: unknown
	}
}

/**
 * Available tab types in the devtools panel.
 */
export type DevtoolsTab = 'page-details' | 'page-state' | 'forms'

/**
 * LocalStorage persisted state structure.
 */
export type DevtoolsPersistedState = {
	isOpen: boolean
	activeTab: DevtoolsTab
}
