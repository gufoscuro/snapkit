import { extractApiErrorMessage } from '$lib/utils/request'

/**
 * A rune-based async resource for self-enclosed, lazy data fetching.
 *
 * Wraps a fetcher and exposes reactive `loading` / `error` / `data` plus a
 * `reload()` for retry. Fetches immediately on construction (opt out with
 * `{ immediate: false }` and call `reload()` yourself).
 *
 * ## Usage
 * ```svelte
 * <script lang="ts">
 *   const res = new Resource(() => apiRequest<Foo>({ url: '/foo' }))
 * </script>
 *
 * {#if res.loading}…{:else if res.error}{res.error}{:else}{res.data}{/if}
 * ```
 */
export class Resource<T> {
  #loading = $state(true)
  #error = $state<string | null>(null)
  #data = $state<T | undefined>(undefined)
  #fetcher: () => Promise<T>

  constructor(fetcher: () => Promise<T>, options?: { immediate?: boolean }) {
    this.#fetcher = fetcher
    if (options?.immediate !== false) {
      // Fire-and-forget: reactivity picks up the state transitions.
      void this.load()
    }
  }

  /** True while a fetch is in flight. */
  get loading(): boolean {
    return this.#loading
  }

  /** A localized error message when the last fetch failed, else `null`. */
  get error(): string | null {
    return this.#error
  }

  /** The last successfully fetched value, or `undefined`. */
  get data(): T | undefined {
    return this.#data
  }

  /** Runs the fetcher, updating `loading` / `error` / `data`. */
  load = async (): Promise<void> => {
    this.#loading = true
    this.#error = null
    try {
      this.#data = await this.#fetcher()
    } catch (err) {
      this.#error = extractApiErrorMessage(err) ?? 'error'
    } finally {
      this.#loading = false
    }
  }

  /** Alias for `load()` — reads better as a retry handler. */
  reload = (): Promise<void> => this.load()
}
