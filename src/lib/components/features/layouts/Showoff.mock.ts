/**
 * Mock data for Showoff layout component preview
 *
 * This file provides realistic example data for the admin panel block preview system.
 * When creating mock data, always use plausible, business-relevant values.
 */

import type { SnippetProps } from '$utils/runtime'
import type { PageConfig } from '$utils/page-registry'

/**
 * Helper to create PageConfig for Showoff layout
 */
function createMockPageConfig(title: string): PageConfig {
	return {
		$id: 'mock-page',
		title,
		route: '/mock',
		layout: {
			componentKey: 'layouts.Showoff',
			enabled: true
		},
		snippets: {
			appHeader: {
				componentKey: 'globals.AppHeader',
				enabled: true
			},
			title: {
				componentKey: 'globals.PageTitle',
				enabled: true
			},
			target: {
				componentKey: 'production.ProductionCalendar',
				enabled: true
			}
		}
	}
}

/**
 * Helper to create SnippetProps for Showoff layout
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
 * Production calendar showoff
 */
export const mockProductionShowoff = createMockSnippetProps('Production Schedule')

/**
 * Analytics dashboard showoff
 */
export const mockAnalyticsShowoff = createMockSnippetProps('Analytics Dashboard')

/**
 * KPI metrics showoff
 */
export const mockKPIShowoff = createMockSnippetProps('Key Performance Indicators')

/**
 * Default export for simple use case
 */
export default mockProductionShowoff
