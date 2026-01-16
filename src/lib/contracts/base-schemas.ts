import { Type, type Static } from '@sinclair/typebox'

/**
 * Base schema for filter state.
 * Components that produce/consume filters should use or extend this.
 */
export const FilterStateSchema = Type.Object({
  search: Type.Optional(Type.String()),
  status: Type.Optional(Type.Array(Type.String())),
}, { $id: 'FilterState' })

export type FilterState = Static<typeof FilterStateSchema>

/**
 * Base schema for selection state.
 * Components that manage selection should use or extend this.
 */
export const SelectionStateSchema = Type.Object({
  rows: Type.Array(Type.String()),
}, { $id: 'SelectionState' })

export type SelectionState = Static<typeof SelectionStateSchema>

/**
 * Helper to create a filter state with additional fields.
 */
export function extendFilterSchema<T extends Record<string, ReturnType<typeof Type.Any>>>(
  additionalFields: T
) {
  return Type.Object({
    search: Type.Optional(Type.String()),
    status: Type.Optional(Type.Array(Type.String())),
    ...additionalFields,
  })
}
