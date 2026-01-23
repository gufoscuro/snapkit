import * as m from '$lib/paraglide/messages';

export function getI18nLabel(key: string): string {
  if (key in m) {
    const fn = m[key as keyof typeof m]
    if (typeof fn === 'function') {
      return fn()
    }
  }

  return key
}