import type { ColumnConfig } from '../types'

/**
 * Represents a user's preference for a single column: order (by array position) and visibility.
 */
export type ColumnPreference = { id: string; visible: boolean }

/**
 * Derive a stable ID for a column config.
 * Uses accessorKey when available, otherwise falls back to renderer + original index.
 */
export function getColumnId<T>(col: ColumnConfig<T>, index: number): string {
	if (col.accessorKey) return String(col.accessorKey)
	return `__${col.renderer}_${index}`
}

/**
 * A column is customizable (reorderable/hideable) if it has a non-empty header string.
 * Columns without a header (state indicators, tag badges, actions) stay fixed.
 */
export function isCustomizable<T>(col: ColumnConfig<T>): boolean {
	return col.header.trim().length > 0
}

/**
 * Apply saved preferences to a columns array.
 * - Fixed columns (empty header) retain their relative position (leading/trailing).
 * - Customizable columns are reordered per preferences, hidden ones are filtered out.
 * - New columns (not in preferences) are appended at the end, visible by default.
 * - Stale preference IDs (removed columns) are silently ignored.
 */
export function applyPreferences<T>(
	columns: ColumnConfig<T>[],
	preferences: ColumnPreference[] | null
): ColumnConfig<T>[] {
	if (!preferences) return columns

	const indexed = columns.map((col, i) => ({ col, originalIndex: i }))
	const fixed = indexed.filter(({ col }) => !isCustomizable(col))
	const customizable = indexed.filter(({ col }) => isCustomizable(col))

	// Map column ID → entry for fast lookup
	const colMap = new Map(
		customizable.map((entry) => [getColumnId(entry.col, entry.originalIndex), entry])
	)

	const reordered: typeof customizable = []
	const seen = new Set<string>()

	// Apply saved order, skip hidden
	for (const pref of preferences) {
		const entry = colMap.get(pref.id)
		if (entry && pref.visible) {
			reordered.push(entry)
		}
		if (entry) seen.add(pref.id)
	}

	// Append new columns not present in saved preferences
	for (const entry of customizable) {
		const id = getColumnId(entry.col, entry.originalIndex)
		if (!seen.has(id)) {
			reordered.push(entry)
		}
	}

	// Reconstruct: leading fixed + reordered customizable + trailing fixed
	const firstCustomIdx = customizable.length > 0 ? customizable[0].originalIndex : columns.length
	const lastCustomIdx =
		customizable.length > 0 ? customizable[customizable.length - 1].originalIndex : -1

	const leading = fixed.filter((f) => f.originalIndex < firstCustomIdx)
	const trailing = fixed.filter((f) => f.originalIndex > lastCustomIdx)

	return [
		...leading.map((e) => e.col),
		...reordered.map((e) => e.col),
		...trailing.map((e) => e.col),
	]
}

/**
 * Merge saved preferences with current column definitions for the customizer dialog.
 * Returns an ordered list of customizable columns with their visibility state.
 * Drops stale IDs, appends new columns at the end (visible by default).
 */
export function mergePreferences<T>(
	columns: ColumnConfig<T>[],
	saved: ColumnPreference[] | null
): (ColumnPreference & { header: string })[] {
	const customizable = columns
		.map((col, i) => ({ col, originalIndex: i }))
		.filter(({ col }) => isCustomizable(col))

	const colMap = new Map(
		customizable.map((entry) => [getColumnId(entry.col, entry.originalIndex), entry.col.header])
	)

	const result: (ColumnPreference & { header: string })[] = []
	const seen = new Set<string>()

	// Saved preferences in order (drop stale IDs)
	if (saved) {
		for (const pref of saved) {
			const header = colMap.get(pref.id)
			if (header !== undefined) {
				result.push({ id: pref.id, visible: pref.visible, header })
				seen.add(pref.id)
			}
		}
	}

	// New columns not in saved preferences
	for (const entry of customizable) {
		const id = getColumnId(entry.col, entry.originalIndex)
		if (!seen.has(id)) {
			result.push({ id, visible: true, header: entry.col.header })
		}
	}

	return result
}
