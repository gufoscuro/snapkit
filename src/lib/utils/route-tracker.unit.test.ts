import { describe, it, expect, beforeEach } from 'vitest'
import { routeTracker } from './route-tracker'

describe('routeTracker', () => {
	beforeEach(() => {
		routeTracker.reset()
	})

	it('records called ids', () => {
		routeTracker.recordCall('page-a')
		routeTracker.recordCall('page-b')
		expect(routeTracker.getCalledIds()).toEqual(['page-a', 'page-b'])
	})

	it('deduplicates called ids', () => {
		routeTracker.recordCall('page-a')
		routeTracker.recordCall('page-a')
		expect(routeTracker.getCalledIds()).toEqual(['page-a'])
	})

	it('identifies broken links', () => {
		routeTracker.recordCall('page-a')
		routeTracker.recordCall('page-b')
		routeTracker.recordCall('page-c')
		routeTracker.setValidPageIds(['page-a', 'page-c'])
		expect(routeTracker.getBrokenLinkIds()).toEqual(['page-b'])
	})

	it('returns empty when all links are valid', () => {
		routeTracker.recordCall('page-a')
		routeTracker.setValidPageIds(['page-a'])
		expect(routeTracker.getBrokenLinkIds()).toEqual([])
	})

	it('reset clears called ids', () => {
		routeTracker.recordCall('page-a')
		routeTracker.reset()
		expect(routeTracker.getCalledIds()).toEqual([])
	})
})
