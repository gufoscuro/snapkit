import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockCreateRoute } = vi.hoisted(() => ({
	mockCreateRoute: vi.fn(),
}))

vi.mock('./route-builder', () => ({
	createRoute: mockCreateRoute,
}))

import { resolveMenuItem, resolveMenuItems, type ResolvedMenuItem } from './menu-resolver'
import type { MenuItem, NavItem, SimpleMenuItem, MenuItemWithSubmenu } from '$lib/stores/tenant-config/types'

beforeEach(() => {
	vi.clearAllMocks()
	mockCreateRoute.mockImplementation(({ $id }: { $id: string }) => `/resolved/${$id}`)
})

describe('resolveMenuItem', () => {
	describe('simple link items', () => {
		it('resolves a simple link item with href from createRoute', () => {
			const item: SimpleMenuItem = {
				type: 'link',
				label: 'Orders',
				pageId: 'order-list',
			}

			const result = resolveMenuItem(item)

			expect(result.type).toBe('link')
			expect(result.label).toBe('Orders')
			expect(result.href).toBe('/resolved/order-list')
			expect(result.visible).toBe(true)
			expect(result.disabled).toBe(false)
			expect(mockCreateRoute).toHaveBeenCalledWith({
				$id: 'order-list',
				params: undefined,
				query: undefined,
			})
		})

		it('passes params and query to createRoute', () => {
			const item: SimpleMenuItem = {
				type: 'link',
				label: 'Order Detail',
				pageId: 'order-detail',
				params: { uuid: '123' },
				query: { tab: 'info' },
			}

			resolveMenuItem(item)

			expect(mockCreateRoute).toHaveBeenCalledWith({
				$id: 'order-detail',
				params: { uuid: '123' },
				query: { tab: 'info' },
			})
		})

		it('preserves visible and disabled flags', () => {
			const item: SimpleMenuItem = {
				type: 'link',
				label: 'Hidden',
				pageId: 'page-1',
				visible: false,
				disabled: true,
			}

			const result = resolveMenuItem(item)
			expect(result.visible).toBe(false)
			expect(result.disabled).toBe(true)
		})

		it('preserves icon', () => {
			const item: SimpleMenuItem = {
				type: 'link',
				label: 'Settings',
				pageId: 'settings',
				icon: 'settings',
			}

			const result = resolveMenuItem(item)
			expect(result.icon).toBe('settings')
		})
	})

	describe('submenu items', () => {
		it('resolves a submenu with children', () => {
			const item: MenuItemWithSubmenu = {
				type: 'submenu',
				label: 'Sales',
				submenuStyle: 'list',
				children: [
					{ type: 'link', label: 'Orders', pageId: 'sales-orders' },
					{ type: 'link', label: 'Invoices', pageId: 'sales-invoices' },
				],
			}

			const result = resolveMenuItem(item)

			expect(result.type).toBe('submenu')
			expect(result.label).toBe('Sales')
			expect(result.href).toBeNull()
			expect(result.submenuStyle).toBe('list')
			expect(result.children).toHaveLength(2)
			expect(result.children![0].href).toBe('/resolved/sales-orders')
			expect(result.children![1].href).toBe('/resolved/sales-invoices')
		})

		it('resolves submenu with its own pageId', () => {
			const item: MenuItemWithSubmenu = {
				type: 'submenu',
				label: 'Supply',
				pageId: 'supply-dashboard',
				submenuStyle: 'simple',
				children: [],
			}

			const result = resolveMenuItem(item)

			expect(result.href).toBe('/resolved/supply-dashboard')
			expect(result.children).toEqual([])
		})

		it('preserves description on submenu', () => {
			const item: MenuItemWithSubmenu = {
				type: 'submenu',
				label: 'Admin',
				submenuStyle: 'list',
				description: 'Admin tools',
				children: [],
			}

			const result = resolveMenuItem(item)
			expect(result.description).toBe('Admin tools')
		})

		it('resolves nested submenus recursively', () => {
			const item: MenuItemWithSubmenu = {
				type: 'submenu',
				label: 'Top',
				submenuStyle: 'list',
				children: [
					{
						type: 'submenu',
						label: 'Nested',
						submenuStyle: 'simple',
						children: [{ type: 'link', label: 'Leaf', pageId: 'leaf-page' }],
					},
				],
			}

			const result = resolveMenuItem(item)

			expect(result.children).toHaveLength(1)
			expect(result.children![0].type).toBe('submenu')
			expect(result.children![0].children).toHaveLength(1)
			expect(result.children![0].children![0].href).toBe('/resolved/leaf-page')
		})
	})

	describe('legacy NavItem format', () => {
		it('resolves a legacy NavItem with href directly', () => {
			const item: NavItem = {
				label: 'Old Link',
				href: '/legacy/path',
			}

			const result = resolveMenuItem(item)

			expect(result.type).toBe('link')
			expect(result.label).toBe('Old Link')
			expect(result.href).toBe('/legacy/path')
			expect(result.visible).toBe(true)
			expect(result.disabled).toBe(false)
			expect(mockCreateRoute).not.toHaveBeenCalled()
		})

		it('preserves visible/disabled from legacy format', () => {
			const item: NavItem = {
				label: 'Disabled',
				href: '/old',
				visible: false,
				disabled: true,
			}

			const result = resolveMenuItem(item)
			expect(result.visible).toBe(false)
			expect(result.disabled).toBe(true)
		})
	})
})

describe('resolveMenuItems', () => {
	it('resolves an array of mixed items', () => {
		const items: MenuItem[] = [
			{ type: 'link', label: 'Page A', pageId: 'a' },
			{ type: 'link', label: 'Page B', pageId: 'b' },
		]

		const results = resolveMenuItems(items)

		expect(results).toHaveLength(2)
		expect(results[0].href).toBe('/resolved/a')
		expect(results[1].href).toBe('/resolved/b')
	})

	it('returns empty array for empty input', () => {
		expect(resolveMenuItems([])).toEqual([])
	})

	it('returns empty array for non-array input', () => {
		// @ts-expect-error testing invalid input
		expect(resolveMenuItems(null)).toEqual([])
		// @ts-expect-error testing invalid input
		expect(resolveMenuItems(undefined)).toEqual([])
	})

	it('resolves legacy NavItem arrays', () => {
		const items: NavItem[] = [
			{ label: 'Old A', href: '/a' },
			{ label: 'Old B', href: '/b' },
		]

		const results = resolveMenuItems(items)

		expect(results).toHaveLength(2)
		expect(results[0].href).toBe('/a')
		expect(results[1].href).toBe('/b')
	})
})
