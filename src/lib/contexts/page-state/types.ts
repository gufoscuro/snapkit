import type { TSchema, Static } from '@sinclair/typebox'

/**
 * Contract that defines what a component provides and consumes.
 * Uses TypeBox schemas for both runtime validation and TypeScript type inference.
 */
export interface ComponentContract<
  TProvides extends Record<string, TSchema> = Record<string, TSchema>,
  TConsumes extends Record<string, TSchema> = Record<string, TSchema>
> {
  /** Unique identifier for the contract */
  $id: string
  /** Schemas for data this component writes to the state */
  provides: TProvides
  /** Schemas for data this component reads from the state */
  consumes: TConsumes
}

/**
 * Binding configuration that maps logical names to actual namespaces.
 * If not specified, the logical name is used as the namespace (default binding).
 */
export interface BindingConfig {
  provides?: Record<string, string>
  consumes?: Record<string, string>
}

/**
 * A typed handle for reading/writing a specific piece of state.
 * The component uses this without knowing the actual namespace.
 */
export interface StateHandle<T> {
  get(): T
  set(value: T): void
  update(fn: (current: T) => T): void
}

/**
 * Infer the TypeScript type from a ComponentContract's provides or consumes.
 */
export type InferContractProvides<C extends ComponentContract> = {
  [K in keyof C['provides']]: Static<C['provides'][K]>
}

export type InferContractConsumes<C extends ComponentContract> = {
  [K in keyof C['consumes']]: Static<C['consumes'][K]>
}

/**
 * Resolved bindings with the actual namespace for each logical name.
 */
export interface ResolvedBindings {
  provides: Record<string, string>
  consumes: Record<string, string>
}
