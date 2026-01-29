/**
 * Mock data for FormFieldSkeleton component preview
 *
 * This file provides realistic example data for the admin panel block preview system.
 * When creating mock data, always use plausible, business-relevant values.
 */

/**
 * Standard field skeleton with label
 */
export const mockStandardSkeleton = {
	showLabel: true,
	width: 'w-full'
}

/**
 * Field skeleton without label
 */
export const mockNoLabelSkeleton = {
	showLabel: false,
	width: 'w-full'
}

/**
 * Narrow field skeleton
 */
export const mockNarrowSkeleton = {
	showLabel: true,
	width: 'w-48'
}

/**
 * Wide field skeleton
 */
export const mockWideSkeleton = {
	showLabel: true,
	width: 'w-96'
}

/**
 * Default export for simple use case
 */
export default mockStandardSkeleton
