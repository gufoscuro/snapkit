/**
 * Mock data for FormFieldMessages component preview
 *
 * This file provides realistic example data for the admin panel block preview system.
 * When creating mock data, always use plausible, business-relevant values.
 */

/**
 * Standard error message
 */
export const mockErrorMessage = {
	id: 'order-quantity',
	error: 'Quantity must be greater than 0',
	showErrorMessage: true
}

/**
 * Warning message
 */
export const mockWarningMessage = {
	id: 'stock-level',
	warning: 'Low stock - consider reordering soon',
	showErrorMessage: true
}

/**
 * No message (valid field)
 */
export const mockNoMessage = {
	id: 'customer-name',
	showErrorMessage: true
}

/**
 * Error with custom position
 */
export const mockFloatingError = {
	id: 'email-field',
	error: 'Invalid email format',
	errorPosition: 'floating-bottom' as const,
	showErrorMessage: true
}

/**
 * Warning with custom position
 */
export const mockFloatingWarning = {
	id: 'password-field',
	warning: 'Password strength: weak',
	warningPosition: 'floating-bottom' as const,
	showErrorMessage: true
}

/**
 * Error message at top
 */
export const mockTopError = {
	id: 'price-field',
	error: 'Price cannot be negative',
	errorPosition: 'top' as const,
	showErrorMessage: true
}

/**
 * Default export for simple use case
 */
export default mockErrorMessage
