import { SvelteMap } from 'svelte/reactivity'
import type { PageState } from '$lib/contexts/page-state'
import type { FormDebugInfo, PageDetailsInfo } from './types'

/**
 * Singleton devtools registry using module-level state.
 * This exists once per application and persists across component mounts/unmounts.
 */

// Module-level reactive state (singleton pattern)
// Using SvelteMap for proper reactivity with $state()
let forms = $state(new SvelteMap<string, FormDebugInfo>())
let pageDetails = $state<PageDetailsInfo | null>(null)
let pageState = $state<PageState | null>(null)

/**
 * Register a form for debugging.
 * Multiple forms can be registered simultaneously (e.g., nested forms, modals).
 *
 * @param info - Form debug information with lazy data getter
 * @returns Cleanup function to call on component unmount
 */
export function registerForm(info: FormDebugInfo): () => void {
	// SvelteMap is reactive, so .set() automatically triggers updates
	forms.set(info.id, info)

	console.log('[Devtools] Form registered:', info.id, 'Total forms:', forms.size)

	// Return cleanup function
	return () => {
		// SvelteMap is reactive, so .delete() automatically triggers updates
		forms.delete(info.id)

		console.log('[Devtools] Form unregistered:', info.id, 'Total forms:', forms.size)
	}
}

/**
 * Register page details for debugging.
 * Only one page can be active at a time (last registration wins).
 *
 * @param info - Page details information with lazy data getter
 * @returns Cleanup function to call on component unmount
 */
export function registerPageDetails(info: PageDetailsInfo): () => void {
	pageDetails = info

	return () => {
		pageDetails = null
	}
}

/**
 * Register PageState instance for debugging.
 * Only one PageState exists per page (last registration wins).
 *
 * @param state - PageState instance
 * @returns Cleanup function to call on component unmount
 */
export function registerPageState(state: PageState): () => void {
	pageState = state

	return () => {
		pageState = null
	}
}

/**
 * Get all registered forms.
 * Returns a reactive SvelteMap that automatically updates when forms are registered/unregistered.
 */
export function getForms() {
	return forms
}

/**
 * Get registered page details.
 */
export function getPageDetails() {
	return pageDetails
}

/**
 * Get registered PageState.
 */
export function getPageState() {
	return pageState
}

/**
 * Check if any debuggable content is registered.
 * Used to determine if devtools panel should be available.
 */
export function hasDebugContent(): boolean {
	return forms.size > 0 || pageDetails !== null || pageState !== null
}
