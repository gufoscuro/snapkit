import { dev } from '$app/environment'

/**
 * Single source of truth for whether the chat assistant is enabled in this
 * build/runtime. Used by the layout (mount), the server endpoint (404 gate),
 * and the chat store (lazy-init short-circuit).
 *
 * Currently subordinated to `dev`: production builds inline this as `false`,
 * so Vite tree-shakes the chat infrastructure out of the production bundle
 * (the store init never runs, no UI mounts, the Gemini endpoint 404s).
 *
 * To enable the chat in production, replace `dev` with `true` (or compose
 * with other conditions — env flag, per-user feature flag, etc.). All three
 * call sites flip together.
 */
export const chatEnabled = dev
