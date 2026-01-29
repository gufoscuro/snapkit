/**
 * Mock data for ProductionCalendar component preview
 *
 * This file provides realistic example data for the admin panel block preview system.
 * When creating mock data, always use plausible, business-relevant values.
 */

/**
 * ProductionCalendar doesn't accept props - it's a self-contained component
 * that manages its own data fetching and calendar rendering.
 *
 * The component uses:
 * - apiRequest to fetch production items from 'product/production/_search' endpoint
 * - FullCalendar for rendering with custom event mapping
 * - Internal state for calendar API
 *
 * This mock file exists for consistency in the component system.
 */
export const mockProductionCalendar = {}

/**
 * Default export for consistency
 */
export default mockProductionCalendar
