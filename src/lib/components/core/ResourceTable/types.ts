import type { ComponentContract } from '$lib/contexts/page-state/types'
import type { FilterQuery, PaginatedResponse } from '$lib/utils/filters'
import type { Snippet } from 'svelte'
import type { BadgeVariant } from '$lib/components/ui/badge'
import type { ButtonVariant } from '$lib/components/ui/button'

/**
 * Generic component type (more permissive than Svelte's Component)
 * Compatible with both Svelte components and icon components from lucide-svelte
 */
export type AnyComponent = any

/**
 * Main ResourceTable props
 */
export type ResourceTableProps<T extends Record<string, any>> = {
	/**
	 * Function to fetch data with pagination and optional filters
	 */
	fetchFunction: (page: number, filters?: FilterQuery) => Promise<PaginatedResponse<T>>

	/**
	 * Column configurations (declarative)
	 */
	columns: ColumnConfig<T>[]

	/**
	 * Optional filter integration via ComponentContract
	 */
	filtersContract?: ComponentContract

	/**
	 * Additional CSS classes
	 */
	class?: string

	/**
	 * Custom empty state snippet
	 */
	emptyState?: Snippet

	/**
	 * Custom load more button label
	 */
	loadMoreLabel?: string

	/**
	 * Enable sticky header (default: true)
	 */
	stickyHeader?: boolean
}

/**
 * Column configuration
 */
export type ColumnConfig<T> = {
	/**
	 * Key to access data (can be nested path like "emails.0.email")
	 */
	accessorKey?: keyof T | string

	/**
	 * Column header text
	 */
	header: string

	/**
	 * Renderer type
	 */
	renderer: RendererType

	/**
	 * Renderer-specific configuration
	 */
	rendererConfig?: RendererConfig<T>

	/**
	 * Hide column conditionally
	 */
	hidden?: boolean | ((row: T) => boolean)

	/**
	 * Additional metadata for styling/behavior
	 */
	meta?: {
		cellClassName?: string
		headerClassName?: string
	}
}

/**
 * Predefined renderer types
 */
export type RendererType =
	| 'text' // Simple text with fallback "-"
	| 'link' // Link to detail page
	| 'email' // First email from array
	| 'phone' // First phone from array
	| 'date' // Formatted date
	| 'currency' // Formatted currency
	| 'badge' // Single badge with variant
	| 'badges' // Multiple badges (categories, tags)
	| 'actions' // Action buttons/dropdown
	| 'component' // Custom component
	| 'custom' // Custom render function

/**
 * Renderer configuration (union of all renderer configs)
 */
export type RendererConfig<T> =
	| TextConfig<T>
	| LinkConfig<T>
	| EmailConfig<T>
	| PhoneConfig<T>
	| BadgeConfig<T>
	| BadgesConfig<T>
	| DateConfig<T>
	| CurrencyConfig<T>
	| ActionsConfig<T>
	| ComponentConfig<T>
	| CustomConfig<T>

/**
 * Text renderer configuration
 */
export type TextConfig<T> = {
	/**
	 * Custom accessor for value extraction
	 * Default: uses accessorKey
	 */
	valueAccessor?: (row: T) => any
}

/**
 * Link renderer configuration
 */
export type LinkConfig<T> = {
	/**
	 * Function to build URL from row data
	 */
	urlBuilder: (row: T) => string

	/**
	 * Custom accessor for value extraction (link text)
	 * Default: uses accessorKey
	 */
	valueAccessor?: (row: T) => any

	/**
	 * Future: String template for serialization (e.g., "/suppliers/{id}")
	 */
	urlTemplate?: string
}

/**
 * Email renderer configuration
 */
export type EmailConfig<T> = {
	/**
	 * Custom accessor for email array field
	 * Default: uses accessorKey
	 */
	accessor?: (row: T) => any[]

	/**
	 * Future: Path notation for serialization (e.g., "emails.0.email")
	 */
	path?: string
}

/**
 * Phone renderer configuration
 */
export type PhoneConfig<T> = {
	/**
	 * Custom accessor for phone array field
	 * Default: uses accessorKey
	 */
	accessor?: (row: T) => any[]

	/**
	 * Future: Path notation for serialization (e.g., "phones.0.phone")
	 */
	path?: string
}

/**
 * Single badge renderer configuration
 */
export type BadgeConfig<T> = {
	/**
	 * Map value to badge variant
	 */
	variantMapper: (value: any) => BadgeVariant

	/**
	 * Optional label transformation
	 */
	labelMapper?: (value: any) => string
}

/**
 * Multiple badges renderer configuration (e.g., CategoryBadges)
 */
export type BadgesConfig<T> = {
	/**
	 * Component to render (e.g., CategoryBadges)
	 */
	component: AnyComponent

	/**
	 * Custom accessor for array field
	 */
	accessor?: (row: T) => any[]

	/**
	 * Future: Component name for serialization (e.g., "CategoryBadges")
	 */
	componentName?: string
}

/**
 * Date renderer configuration
 */
export type DateConfig<T> = {
	/**
	 * Date format style
	 */
	format?: 'short' | 'long' | 'iso'

	/**
	 * Locale for formatting (default: user locale)
	 */
	locale?: string
}

/**
 * Currency renderer configuration
 */
export type CurrencyConfig<T> = {
	/**
	 * Function to get currency code from row (default: "EUR")
	 */
	currencyAccessor?: (row: T) => string

	/**
	 * Locale for formatting (default: "en-US")
	 */
	locale?: string

	/**
	 * Future: Path to currency field for serialization
	 */
	currencyPath?: string
}

/**
 * Actions renderer configuration
 */
export type ActionsConfig<T> = {
	/**
	 * Array of actions to render
	 */
	actions: Action<T>[]

	/**
	 * Button size
	 */
	buttonSize?: 'sm' | 'default' | 'lg'

	/**
	 * Dropdown menu alignment
	 */
	dropdownAlign?: 'start' | 'end'
}

/**
 * Action definition
 */
export type Action<T> = {
	/**
	 * Action label (optional for single icon button)
	 */
	label?: string | ((row: T) => string)

	/**
	 * Lucide icon component
	 */
	icon?: AnyComponent

	/**
	 * Button variant
	 */
	variant?: ButtonVariant

	/**
	 * Action handler
	 */
	onClick: (row: T, helpers: ActionHelpers<T>) => void | Promise<void>

	/**
	 * Conditionally show action
	 */
	visible?: (row: T) => boolean

	/**
	 * Conditionally disable action
	 */
	disabled?: (row: T) => boolean

	/**
	 * Future: Icon name for serialization (e.g., "Archive")
	 */
	iconName?: string
}

/**
 * Helpers provided to action handlers
 */
export type ActionHelpers<T = any> = {
	/**
	 * Optimistically remove row from table
	 */
	removeRow: (id: string) => void

	/**
	 * Optimistically update row data
	 */
	updateRow: (id: string, data: Partial<T>) => void

	/**
	 * Refetch all data
	 */
	refresh: () => Promise<void>
}

/**
 * Custom component renderer configuration
 */
export type ComponentConfig<T> = {
	/**
	 * Svelte component to render
	 */
	component: AnyComponent

	/**
	 * Function to map row data to component props
	 */
	propsMapper: (row: T) => Record<string, any>
}

/**
 * Custom renderer configuration
 */
export type CustomConfig<T> = {
	/**
	 * Custom cell renderer function
	 * Returns anything that DataTable accepts (string, component, snippet, etc.)
	 */
	cellRenderer: (row: T) => any
}

// Note: BadgeVariant and ButtonVariant are imported from their respective components above
// and used in the type definitions. They are not re-exported from this module.
