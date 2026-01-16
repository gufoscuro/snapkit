import { getContext, setContext } from 'svelte'

const PAGE_STATE_KEY = Symbol('page-state')

export type PageStateData = Record<string, unknown>

/**
 * Creates a reactive page state registry.
 * This is the central store for all component state within a page.
 */
function createPageState() {
  let state = $state<PageStateData>({})

  return {
    /**
     * Get a value by its full namespaced key.
     */
    get<T>(key: string): T | undefined {
      return state[key] as T | undefined
    },

    /**
     * Set a value by its full namespaced key.
     */
    set<T>(key: string, value: T): void {
      state[key] = value
    },

    /**
     * Update a value using a function.
     */
    update<T>(key: string, fn: (current: T | undefined) => T): void {
      state[key] = fn(state[key] as T | undefined)
    },

    /**
     * Get all values in a namespace (keys starting with "namespace.").
     */
    getNamespace<T extends Record<string, unknown>>(namespace: string): T {
      const prefix = `${namespace}.`
      const result: Record<string, unknown> = {}

      for (const [key, value] of Object.entries(state)) {
        if (key.startsWith(prefix)) {
          const shortKey = key.slice(prefix.length)
          result[shortKey] = value
        }
      }

      return result as T
    },

    /**
     * Get the raw state (for debugging).
     */
    get _debug() {
      return state
    }
  }
}

export type PageState = ReturnType<typeof createPageState>

/**
 * Initialize the page state context. Call this in the layout.
 */
export function initPageState(): PageState {
  const pageState = createPageState()
  setContext(PAGE_STATE_KEY, pageState)
  return pageState
}

/**
 * Get the page state from context.
 */
export function getPageState(): PageState {
  const pageState = getContext<PageState | undefined>(PAGE_STATE_KEY)
  if (!pageState) {
    throw new Error('PageState not found. Did you forget to call initPageState() in the layout?')
  }
  return pageState
}
