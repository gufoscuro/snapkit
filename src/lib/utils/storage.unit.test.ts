import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('$app/environment', () => ({ browser: true }))

import {
	setUserKey,
	clearUserKey,
	get,
	set,
	remove,
	getByUser,
	setByUser,
	removeByUser
} from './storage'

const store = new Map<string, string>()

const localStorageMock = {
	getItem: vi.fn((key: string) => store.get(key) ?? null),
	setItem: vi.fn((key: string, value: string) => store.set(key, value)),
	removeItem: vi.fn((key: string) => store.delete(key))
}

vi.stubGlobal('localStorage', localStorageMock)

beforeEach(() => {
	store.clear()
	vi.clearAllMocks()
	clearUserKey()
})

describe('global storage', () => {
	it('set and get an object', () => {
		set('theme', { dark: true })
		expect(get('theme')).toEqual({ dark: true })
	})

	it('set and get an array', () => {
		set('items', [1, 2, 3])
		expect(get('items')).toEqual([1, 2, 3])
	})

	it('returns null for missing key', () => {
		expect(get('nonexistent')).toBeNull()
	})

	it('remove deletes the key', () => {
		set('toRemove', { a: 1 })
		remove('toRemove')
		expect(get('toRemove')).toBeNull()
	})

	it('uses snapkit: prefix', () => {
		set('test', { v: 1 })
		expect(localStorageMock.setItem).toHaveBeenCalledWith('snapkit:test', '{"v":1}')
	})
})

describe('per-user storage', () => {
	const UUID = 'user-abc-123'

	beforeEach(() => {
		setUserKey(UUID)
	})

	it('setByUser and getByUser round-trip', () => {
		setByUser('filters', { status: 'active' })
		expect(getByUser('filters')).toEqual({ status: 'active' })
	})

	it('uses snapkit:user:<uuid>:<key> prefix', () => {
		setByUser('pref', [1])
		expect(localStorageMock.setItem).toHaveBeenCalledWith(
			`snapkit:user:${UUID}:pref`,
			'[1]'
		)
	})

	it('isolates data between users', () => {
		setByUser('color', { value: 'blue' })

		setUserKey('other-user-456')
		expect(getByUser('color')).toBeNull()
	})

	it('removeByUser deletes the key', () => {
		setByUser('temp', { x: 1 })
		removeByUser('temp')
		expect(getByUser('temp')).toBeNull()
	})
})

describe('user key not set', () => {
	it('getByUser returns null and warns', () => {
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
		expect(getByUser('key')).toBeNull()
		expect(warnSpy).toHaveBeenCalledWith(
			'[StorageUtil] User key not set. Call setUserKey() first.'
		)
		warnSpy.mockRestore()
	})

	it('setByUser does nothing and warns', () => {
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
		setByUser('key', { a: 1 })
		expect(localStorageMock.setItem).not.toHaveBeenCalled()
		expect(warnSpy).toHaveBeenCalled()
		warnSpy.mockRestore()
	})
})

describe('error handling', () => {
	it('get handles localStorage throwing', () => {
		localStorageMock.getItem.mockImplementationOnce(() => {
			throw new Error('QuotaExceeded')
		})
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
		expect(get('key')).toBeNull()
		expect(warnSpy).toHaveBeenCalled()
		warnSpy.mockRestore()
	})

	it('set handles localStorage throwing', () => {
		localStorageMock.setItem.mockImplementationOnce(() => {
			throw new Error('QuotaExceeded')
		})
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
		set('key', { a: 1 })
		expect(warnSpy).toHaveBeenCalled()
		warnSpy.mockRestore()
	})
})
