import { browser } from '$app/environment'
import type { DevtoolsPersistedState, DevtoolsTab } from './types'

export const DEVTOOLS_STORAGE_KEY = 'snapkit-devtools-state'

const DEFAULT_STATE: DevtoolsPersistedState = {
	isOpen: false,
	activeTab: 'page-details'
}

/**
 * Load devtools state from localStorage.
 * Returns default state if not found or invalid.
 */
export function loadDevtoolsState(): DevtoolsPersistedState {
	if (!browser) return DEFAULT_STATE

	try {
		const stored = localStorage.getItem(DEVTOOLS_STORAGE_KEY)
		if (!stored) return DEFAULT_STATE

		const parsed = JSON.parse(stored) as DevtoolsPersistedState

		// Validate structure
		if (
			typeof parsed.isOpen !== 'boolean' ||
			!['page-details', 'page-state', 'forms'].includes(parsed.activeTab)
		) {
			console.warn('Invalid devtools state in localStorage, using defaults')
			return DEFAULT_STATE
		}

		return parsed
	} catch (error) {
		console.error('Failed to load devtools state:', error)
		return DEFAULT_STATE
	}
}

/**
 * Save devtools state to localStorage.
 */
export function saveDevtoolsState(state: DevtoolsPersistedState): void {
	if (!browser) return

	try {
		localStorage.setItem(DEVTOOLS_STORAGE_KEY, JSON.stringify(state))
	} catch (error) {
		console.error('Failed to save devtools state:', error)
	}
}

/**
 * Clear devtools state from localStorage.
 */
export function clearDevtoolsState(): void {
	if (!browser) return
	localStorage.removeItem(DEVTOOLS_STORAGE_KEY)
}
