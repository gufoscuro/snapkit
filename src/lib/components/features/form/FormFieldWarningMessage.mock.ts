/**
 * Mock data for FormFieldWarningMessage component preview
 *
 * This file provides realistic example data for the admin panel block preview system.
 * When creating mock data, always use plausible, business-relevant values.
 */

/**
 * Standard warning message
 */
export const mockStandardWarning = {
	id: 'inventory-level',
	message: 'Stock level is below recommended threshold',
	position: 'bottom' as const
}

/**
 * Floating warning message
 */
export const mockFloatingWarning = {
	id: 'delivery-date',
	message: 'Delivery date is outside normal business hours',
	position: 'floating-bottom' as const
}

/**
 * Top position warning
 */
export const mockTopWarning = {
	id: 'price-override',
	message: 'Manual price override detected',
	position: 'top' as const
}

/**
 * Long warning message
 */
export const mockLongWarning = {
	id: 'payment-terms',
	message: 'Customer has pending invoices. Consider reviewing payment terms before processing',
	position: 'bottom' as const
}

/**
 * Default export for simple use case
 */
export default mockStandardWarning
