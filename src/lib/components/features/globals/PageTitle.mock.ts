/**
 * Mock data for PageTitle component preview
 *
 * This file provides realistic example data for the admin panel block preview system.
 * When creating mock data, always use plausible, business-relevant values.
 */

import type { SnippetProps } from '$utils/runtime'
import type { PageConfig } from '$utils/page-registry'

/**
 * Helper to create minimal PageConfig for preview
 */
function createMockPageConfig(title: string): PageConfig {
	return {
		$id: 'mock-page',
		title,
		route: '/mock',
		layout: {
			componentKey: 'layouts.List',
			enabled: true
		},
		snippets: {}
	}
}

/**
 * Helper to create SnippetProps with only pageDetails
 */
function createMockSnippetProps(title: string): Pick<SnippetProps, 'pageDetails'> {
	return {
		pageDetails: {
			config: createMockPageConfig(title),
			params: {}
		}
	}
}

/**
 * Standard page title
 */
export const mockStandardTitle = createMockSnippetProps('Sales Dashboard')

/**
 * Simple page title
 */
export const mockSimpleTitle = createMockSnippetProps('Customer Management')

/**
 * Long title to test truncation and layout
 */
export const mockLongTitle = createMockSnippetProps(
	'Comprehensive Annual Financial Report and Analysis Dashboard'
)

/**
 * Default export for simple use case
 */
export default mockStandardTitle
