/**
 * Safely parse a JSON string into an object
 * @param input {string | null} - The JSON string to parse
 * @returns {T | null} - The parsed object, or null if parsing fails
 */
export function parseJSON<T = unknown>(input: string | null): T | null {
  if (!input) return null

  try {
    return JSON.parse(input) as T
  } catch {
    return null
  }
}

/**
 * Safely stringify an object into a JSON string
 * @param input {unknown} - The object to stringify
 * @returns {string | null} - The JSON string, or null if stringifying fails
 */
export function stringifyJSON(input: unknown): string | null {
  if (!input) return null

  try {
    return JSON.stringify(input)
  } catch {
    return null
  }
}
