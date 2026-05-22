/**
 * Recursively converts empty strings (`''`) to `null` inside a value.
 * Used to normalize form payloads before sending them to the backend, which
 * expects `null` rather than `''` for absent optional fields.
 *
 * Skips keys ending in `_snapshot`: those are opaque blobs received from the
 * backend (item_snapshot, customer_snapshot, vat_code_snapshot, etc.) and must
 * round-trip unchanged — touching them would alter shape and corrupt history.
 *
 * Only `''` is transformed. `0`, `false`, `undefined`, `null`, `[]`, `{}` are
 * left as-is.
 */
export function emptyToNull<T>(value: T): T {
  return transform(value) as T
}

function transform(value: unknown, keyHint?: string): unknown {
  if (keyHint && keyHint.endsWith('_snapshot')) return value
  if (value === '') return null
  if (Array.isArray(value)) return value.map(v => transform(v))
  if (value && typeof value === 'object' && isPlainObject(value)) {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value)) {
      out[k] = transform(v, k)
    }
    return out
  }
  return value
}

function isPlainObject(value: object): boolean {
  const proto = Object.getPrototypeOf(value)
  return proto === null || proto === Object.prototype
}
