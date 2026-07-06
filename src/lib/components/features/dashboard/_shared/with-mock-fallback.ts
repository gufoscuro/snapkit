import { ApiError } from '$lib/utils/request'

/**
 * A fetched value tagged with its provenance. `demo` is `true` when the value
 * came from a local mock because the real endpoint isn't live yet.
 */
export interface Sourced<T> {
  value: T
  demo: boolean
}

/**
 * Runs the real fetcher; if the endpoint is not implemented yet (HTTP 404),
 * transparently falls back to the provided mock and flags it as `demo`. Any
 * other error (401/403/500/network) propagates so the widget surfaces a real
 * error state instead of masking it with fake data.
 *
 * Removal path: once the backend ships the endpoint, delete the
 * `withMockFallback` wrapper and call `apiRequest` directly.
 */
export async function withMockFallback<T>(
  real: () => Promise<T>,
  mock: T
): Promise<Sourced<T>> {
  try {
    return { value: await real(), demo: false }
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      return { value: mock, demo: true }
    }
    throw err
  }
}
