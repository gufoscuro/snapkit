import type { BuilderPageConfig } from './types'

/**
 * Internal representation of page with parent tracking
 * Used for flat storage in admin store
 */
export interface FlatBuilderPageConfig extends BuilderPageConfig {
	parentId?: string | null // null or undefined = root level page
}

/**
 * Convert flat array with parentId to nested structure with subpages
 * Used during serialization (save to file)
 */
export function flatToNested(pages: FlatBuilderPageConfig[]): BuilderPageConfig[] {
	// Build map of parentId -> children for fast lookup
	const childrenMap = new Map<string, FlatBuilderPageConfig[]>()
	const rootPages: FlatBuilderPageConfig[] = []

	// First pass: categorize pages
	for (const page of pages) {
		if (!page.parentId) {
			rootPages.push(page)
		} else {
			if (!childrenMap.has(page.parentId)) {
				childrenMap.set(page.parentId, [])
			}
			childrenMap.get(page.parentId)!.push(page)
		}
	}

	// Recursive function to build nested structure
	function buildNested(page: FlatBuilderPageConfig): BuilderPageConfig {
		const { parentId, ...pageWithoutParentId } = page
		const children = childrenMap.get(page.$id) || []

		if (children.length > 0) {
			return {
				...pageWithoutParentId,
				subpages: children.map(buildNested)
			}
		}

		// Remove subpages field if empty to keep JSON clean
		const { subpages, ...pageWithoutSubpages } = pageWithoutParentId
		return pageWithoutSubpages as BuilderPageConfig
	}

	return rootPages.map(buildNested)
}

/**
 * Convert nested structure with subpages to flat array with parentId
 * Used during deserialization (load from file)
 */
export function nestedToFlat(
	pages: BuilderPageConfig[],
	parentId: string | null = null
): FlatBuilderPageConfig[] {
	const flat: FlatBuilderPageConfig[] = []

	for (const page of pages) {
		const { subpages, ...pageWithoutSubpages } = page

		// Add current page with parentId
		flat.push({
			...pageWithoutSubpages,
			parentId
		} as FlatBuilderPageConfig)

		// Recursively flatten subpages
		if (subpages && subpages.length > 0) {
			flat.push(...nestedToFlat(subpages, page.$id))
		}
	}

	return flat
}

/**
 * Find page by ID in flat array
 */
export function findPageById(
	id: string,
	pages: FlatBuilderPageConfig[]
): FlatBuilderPageConfig | null {
	return pages.find((p) => p.$id === id) ?? null
}

/**
 * Get all ancestor IDs for a page (breadcrumb path from root to page)
 */
export function getPageAncestors(pageId: string, pages: FlatBuilderPageConfig[]): string[] {
	const ancestors: string[] = []
	let currentId: string | null = pageId

	// Walk up the parent chain
	while (currentId) {
		const page = findPageById(currentId, pages)
		if (!page) break

		ancestors.unshift(currentId)
		currentId = page.parentId ?? null
	}

	return ancestors
}

/**
 * Get immediate children of a page
 */
export function getChildPages(
	parentId: string,
	pages: FlatBuilderPageConfig[]
): FlatBuilderPageConfig[] {
	return pages.filter((p) => p.parentId === parentId)
}

/**
 * Get all descendants of a page recursively
 */
export function getAllDescendants(
	pageId: string,
	pages: FlatBuilderPageConfig[]
): FlatBuilderPageConfig[] {
	const descendants: FlatBuilderPageConfig[] = []
	const children = getChildPages(pageId, pages)

	for (const child of children) {
		descendants.push(child)
		descendants.push(...getAllDescendants(child.$id, pages))
	}

	return descendants
}

/**
 * Validate that setting newParentId won't create circular reference
 */
export function validateNoCircularRefs(
	pageId: string,
	newParentId: string | null,
	pages: FlatBuilderPageConfig[]
): boolean {
	if (!newParentId) return true // Moving to root is always safe

	// Check if newParentId is a descendant of pageId
	const descendants = getAllDescendants(pageId, pages)
	return !descendants.some((d) => d.$id === newParentId)
}

/**
 * Validate route uniqueness within a tenant
 */
export function validateRouteUnique(
	route: string,
	tenantId: string,
	excludePageId: string | null,
	pages: FlatBuilderPageConfig[]
): boolean {
	return !pages.some(
		(p) => p.route === route && p.tenantId === tenantId && p.$id !== excludePageId
	)
}

/**
 * Validate entire page hierarchy for integrity
 */
export function validatePageHierarchy(pages: FlatBuilderPageConfig[]): {
	valid: boolean
	errors: string[]
} {
	const errors: string[] = []

	// 1. Check for orphaned pages (parentId points to non-existent page)
	for (const page of pages) {
		if (page.parentId && !findPageById(page.parentId, pages)) {
			errors.push(
				`Page "${page.title}" (${page.$id}) has invalid parentId: ${page.parentId}`
			)
		}
	}

	// 2. Check for circular references
	for (const page of pages) {
		if (page.parentId) {
			const ancestors = getPageAncestors(page.$id, pages)
			// Remove self from ancestors check
			const ancestorsWithoutSelf = ancestors.filter((id) => id !== page.$id)
			if (ancestorsWithoutSelf.includes(page.$id)) {
				errors.push(`Circular reference detected for page: ${page.title} (${page.$id})`)
			}
		}
	}

	// 3. Check route uniqueness per tenant
	const routesByTenant = new Map<string, Map<string, string>>()
	for (const page of pages) {
		if (!routesByTenant.has(page.tenantId)) {
			routesByTenant.set(page.tenantId, new Map())
		}
		const routes = routesByTenant.get(page.tenantId)!
		if (routes.has(page.route)) {
			errors.push(
				`Duplicate route "${page.route}" in tenant ${page.tenantId}: ` +
					`pages ${routes.get(page.route)} and ${page.$id}`
			)
		}
		routes.set(page.route, page.$id)
	}

	return {
		valid: errors.length === 0,
		errors
	}
}

/**
 * Get page depth (0 = root, 1 = first level subpage, etc.)
 */
export function getPageDepth(pageId: string, pages: FlatBuilderPageConfig[]): number {
	const ancestors = getPageAncestors(pageId, pages)
	return ancestors.length - 1 // Subtract 1 because ancestors includes the page itself
}

/**
 * Check if page can have subpages added (depth limit check)
 */
export function canAddSubpage(
	parentId: string,
	pages: FlatBuilderPageConfig[],
	maxDepth: number = 10
): boolean {
	const depth = getPageDepth(parentId, pages)
	return depth < maxDepth
}

/**
 * Get full route path by concatenating parent routes
 * For display purposes only - actual routing uses independent routes
 */
export function getFullRoutePath(pageId: string, pages: FlatBuilderPageConfig[]): string {
	const ancestors = getPageAncestors(pageId, pages)
	const routes: string[] = []

	for (const ancestorId of ancestors) {
		const page = findPageById(ancestorId, pages)
		if (page) {
			routes.push(page.route)
		}
	}

	return routes.join('')
}
