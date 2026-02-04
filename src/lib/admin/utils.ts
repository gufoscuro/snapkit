/**
 * Utility functions for admin panel
 */

/**
 * Formats a PascalCase or camelCase component name into a human-readable string
 *
 * @example
 * formatBlockName('FormFieldErrorMessage') // 'Form field error message'
 * formatBlockName('PageTitle') // 'Page title'
 * formatBlockName('DemoTable') // 'Demo table'
 */
export function formatBlockName(name: string): string {
	// Add space before capital letters (except the first one)
	const withSpaces = name.replace(/([A-Z])/g, ' $1').trim()

	// Capitalize the first letter of every word
	return withSpaces
		.split(' ')
		.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(' ')
}

/**
 * Formats a ComponentKey into a human-readable string by extracting the last part
 * and applying formatBlockName
 *
 * @example
 * formatComponentKey('x.yz.default.ComponentName') // 'Component Name'
 * formatComponentKey('common.orderssearchfilter.default.OrdersSearchFilter') // 'Orders Search Filter'
 * formatComponentKey('supply.supplyorderstable.default.SupplyOrdersTable') // 'Supply Orders Table'
 */
export function formatComponentKey(componentKey: string): string {
	// Extract the last part after the last dot
	const parts = componentKey.split('.')
	const lastPart = parts[parts.length - 1]

	// Apply the existing formatBlockName function
	return formatBlockName(lastPart)
}
