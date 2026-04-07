import { browser } from '$app/environment'
import { parseJSON, stringifyJSON } from './json'

const PREFIX = 'snapkit'

let currentUserKey: string | null = null

function buildGlobalKey(key: string): string {
	return `${PREFIX}:${key}`
}

function buildUserKey(key: string): string | null {
	if (!currentUserKey) {
		console.warn('[StorageUtil] User key not set. Call setUserKey() first.')
		return null
	}
	return `${PREFIX}:user:${currentUserKey}:${key}`
}

/**
 * Set the current user UUID for per-user storage operations.
 * Call once when user data becomes available (e.g., in root layout).
 */
export function setUserKey(uuid: string): void {
	currentUserKey = uuid
}

/**
 * Clear the current user key (e.g., on logout).
 */
export function clearUserKey(): void {
	currentUserKey = null
}

/**
 * Get a value from global storage.
 */
export function get<T = unknown>(key: string): T | null {
	if (!browser) return null
	try {
		const raw = localStorage.getItem(buildGlobalKey(key))
		return parseJSON<T>(raw)
	} catch (error) {
		console.warn(`[StorageUtil] Failed to get key "${key}":`, error)
		return null
	}
}

/**
 * Set a value in global storage.
 */
export function set(key: string, value: unknown): void {
	if (!browser) return
	try {
		const serialized = stringifyJSON(value)
		if (serialized === null) return
		localStorage.setItem(buildGlobalKey(key), serialized)
	} catch (error) {
		console.warn(`[StorageUtil] Failed to set key "${key}":`, error)
	}
}

/**
 * Remove a value from global storage.
 */
export function remove(key: string): void {
	if (!browser) return
	localStorage.removeItem(buildGlobalKey(key))
}

/**
 * Get a value from per-user storage.
 * Requires setUserKey() to have been called.
 */
export function getByUser<T = unknown>(key: string): T | null {
	if (!browser) return null
	const storageKey = buildUserKey(key)
	if (!storageKey) return null
	try {
		const raw = localStorage.getItem(storageKey)
		return parseJSON<T>(raw)
	} catch (error) {
		console.warn(`[StorageUtil] Failed to getByUser key "${key}":`, error)
		return null
	}
}

/**
 * Set a value in per-user storage.
 * Requires setUserKey() to have been called.
 */
export function setByUser(key: string, value: unknown): void {
	if (!browser) return
	const storageKey = buildUserKey(key)
	if (!storageKey) return
	try {
		const serialized = stringifyJSON(value)
		if (serialized === null) return
		localStorage.setItem(storageKey, serialized)
	} catch (error) {
		console.warn(`[StorageUtil] Failed to setByUser key "${key}":`, error)
	}
}

/**
 * Remove a value from per-user storage.
 * Requires setUserKey() to have been called.
 */
export function removeByUser(key: string): void {
	if (!browser) return
	const storageKey = buildUserKey(key)
	if (!storageKey) return
	localStorage.removeItem(storageKey)
}
