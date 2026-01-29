/**
 * Mock data for FormFieldErrorMessage component preview
 *
 * This file provides realistic example data for the admin panel block preview system.
 * When creating mock data, always use plausible, business-relevant values.
 */

/**
 * Standard error message
 */
export const mockStandardError = {
	id: 'order-quantity',
	message: 'Quantity must be between 1 and 1000',
	position: 'bottom' as const
}

/**
 * Floating error message
 */
export const mockFloatingError = {
	id: 'email-input',
	message: 'Please enter a valid email address',
	position: 'floating-bottom' as const
}

/**
 * Top position error
 */
export const mockTopError = {
	id: 'vat-number',
	message: 'VAT number format is invalid',
	position: 'top' as const
}

/**
 * Required field error
 */
export const mockRequiredError = {
	id: 'customer-name',
	message: 'Customer name is required',
	position: 'bottom' as const
}

/**
 * Validation error with details
 */
export const mockValidationError = {
	id: 'phone-number',
	message: 'Phone number must be in international format (+XX XXX XXX XXXX)',
	position: 'bottom' as const
}

/**
 * Default export for simple use case
 */
export default mockStandardError
