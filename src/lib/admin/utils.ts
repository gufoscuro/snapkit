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

	// Lowercase the entire string, then capitalize only the first letter
	return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1).toLowerCase()
}
