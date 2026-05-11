/**
 * Returns a non-cryptographic random identifier suitable for UI-only purposes
 * (keys, tags, transient grouping like import-batch coloring).
 *
 * Avoids `crypto.randomUUID()` which throws in non-secure contexts (plain HTTP
 * over a non-localhost host). The output is a 20+ char base36 string —
 * collision odds are negligible for short-lived per-component lifetimes.
 */
export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`
}
