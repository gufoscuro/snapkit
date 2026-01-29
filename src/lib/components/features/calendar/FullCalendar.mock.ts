/**
 * Mock data for FullCalendar component preview
 *
 * This file provides realistic example data for the admin panel block preview system.
 * When creating mock data, always use plausible, business-relevant values.
 *
 * NOTE: Functions cannot be included in mock data as they are not serializable
 * when passed from server to client in SvelteKit.
 */

import type { CalendarOptions } from 'svelte-fullcalendar'

/**
 * Standard calendar in month view
 * Note: Functions like onEventClick and onFetchEvents are omitted because
 * they cannot be serialized by SvelteKit when loading data server-side.
 */
export const mockMonthCalendar = {
	mode: 'dayGridMonth' as const,
	options: {} as CalendarOptions
}

/**
 * Calendar in year view
 */
export const mockYearCalendar = {
	mode: 'dayGridYear' as const,
	options: {} as CalendarOptions
}

/**
 * Selectable calendar
 */
export const mockSelectableCalendar = {
	mode: 'dayGridMonth' as const,
	options: {
		selectable: true
	} as CalendarOptions
}

/**
 * Calendar with custom options
 */
export const mockCustomCalendar = {
	mode: 'dayGridMonth' as const,
	options: {
		weekends: true,
		hiddenDays: []
	} as CalendarOptions
}

/**
 * Default export for simple use case
 */
export default mockMonthCalendar
