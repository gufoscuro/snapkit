import type { Static } from '@sinclair/typebox'
import { getContext, setContext } from 'svelte'
import { getPageState } from './page-state.svelte.js'
import type { BindingConfig, ComponentContract, ResolvedBindings, StateHandle } from './types.js'

const BINDINGS_KEY = Symbol('snippet-bindings')

/**
 * Resolve bindings by applying defaults where not explicitly specified.
 * Default: logical name = namespace name
 */
export function resolveBindings(contract: ComponentContract, config?: BindingConfig): ResolvedBindings {
  const resolved: ResolvedBindings = {
    provides: {},
    consumes: {},
  }

  // Resolve provides bindings
  for (const logicalName of Object.keys(contract.provides)) {
    resolved.provides[logicalName] = config?.provides?.[logicalName] ?? logicalName
  }

  // Resolve consumes bindings
  for (const logicalName of Object.keys(contract.consumes)) {
    resolved.consumes[logicalName] = config?.consumes?.[logicalName] ?? logicalName
  }

  return resolved
}

/**
 * Set resolved bindings in context. Call this in the SnippetProvider.
 */
export function setSnippetBindings(bindings: ResolvedBindings): void {
  setContext(BINDINGS_KEY, bindings)
}

/**
 * Get resolved bindings from context.
 */
export function getSnippetBindings(): ResolvedBindings {
  const bindings = getContext<ResolvedBindings | undefined>(BINDINGS_KEY)
  if (!bindings) {
    throw new Error('Snippet bindings not found. Is the component wrapped in a SnippetProvider?')
  }
  return bindings
}

/**
 * Create a typed state handle for a "provides" binding.
 * Use this when your component writes state.
 */
export function useProvides<C extends ComponentContract, K extends keyof C['provides'] & string>(
  contract: C,
  logicalName: K,
): StateHandle<Static<C['provides'][K]>> {
  const pageState = getPageState()
  const bindings = getSnippetBindings()
  const namespace = bindings.provides[logicalName]

  if (!namespace) {
    throw new Error(`No binding found for provides "${logicalName}" in contract "${contract.$id}"`)
  }

  type T = Static<C['provides'][K]>

  return {
    get(): T {
      return pageState.get<T>(namespace) as T
    },
    set(value: T): void {
      pageState.set(namespace, value)
    },
    unset(): void {
      pageState.set(namespace, undefined)
    },
    update(fn: (current: T) => T): void {
      pageState.update<T>(namespace, current => fn(current as T))
    },
  }
}

/**
 * Create a typed state handle for a "consumes" binding.
 * Use this when your component reads state.
 */
export function useConsumes<C extends ComponentContract, K extends keyof C['consumes'] & string>(
  contract: C,
  logicalName: K,
): { get(): Static<C['consumes'][K]> | undefined } {
  const pageState = getPageState()
  const bindings = getSnippetBindings()
  const namespace = bindings.consumes[logicalName]

  if (!namespace) {
    throw new Error(`No binding found for consumes "${logicalName}" in contract "${contract.$id}"`)
  }

  type T = Static<C['consumes'][K]>

  return {
    get(): T | undefined {
      return pageState.get<T>(namespace)
    },
  }
}
