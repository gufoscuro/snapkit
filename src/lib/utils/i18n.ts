import * as m from '$lib/paraglide/messages';

export function getI18nLabel(key: string): string {
  if (key in m) {
    const fn = m[key as keyof typeof m]
    if (typeof fn === 'function') {
      // Paraglide message functions accept an inputs object — pass an empty
      // one for messages without parameters.
      return (fn as (inputs?: Record<string, unknown>) => string)({})
    }
  }

  return key
}