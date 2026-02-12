import type { CellContext } from '@tanstack/table-core'
import type { ColumnConfig, EmailConfig } from '../types'

/**
 * Email renderer - displays first email from array
 *
 * Expects data structure like:
 * emails: [{ email: "test@example.com" }, ...]
 *
 * @example
 * {
 *   accessorKey: 'emails',
 *   header: 'Email',
 *   renderer: 'email'
 * }
 */
export function createEmailRenderer<T>(config: ColumnConfig<T>) {
	return (context: CellContext<T, unknown>) => {
		const row = context.row.original
		const emailConfig = config.rendererConfig as EmailConfig<T> | undefined

		// Use custom accessor if provided, otherwise use accessorKey value
		const emails = emailConfig?.accessor
			? emailConfig.accessor(row)
			: (context.getValue() as any[])

		// Handle missing/empty arrays
		if (!emails || !Array.isArray(emails) || emails.length === 0) {
			return '-'
		}

		// Get first email
		const firstEmail = emails[0]

		// Handle different data structures
		if (typeof firstEmail === 'string') {
			return firstEmail
		}

		if (firstEmail && typeof firstEmail === 'object' && 'email' in firstEmail) {
			return firstEmail.email || '-'
		}

		return '-'
	}
}
