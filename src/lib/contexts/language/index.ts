import { getContext, setContext } from 'svelte'
import {
  getLocale,
  setLocale,
  locales,
  type Locale
} from '$lib/paraglide/runtime.js'

const LANGUAGE_CONTEXT_KEY = Symbol('language')

export type LanguageContext = {
  /** Get current locale */
  readonly locale: Locale
  /** Change the locale (sets cookie and reloads page) */
  changeLocale: (newLocale: Locale) => void
  /** Change locale without reload (for advanced use) */
  changeLocaleNoReload: (newLocale: Locale) => void
  /** Available locales */
  readonly availableLocales: readonly Locale[]
}

function createLanguageContext(): LanguageContext {
  return {
    get locale() {
      return getLocale()
    },
    changeLocale(newLocale: Locale) {
      setLocale(newLocale)
    },
    changeLocaleNoReload(newLocale: Locale) {
      setLocale(newLocale, { reload: false })
    },
    availableLocales: locales
  }
}

export function initLanguageContext(): LanguageContext {
  const ctx = createLanguageContext()
  setContext(LANGUAGE_CONTEXT_KEY, ctx)
  return ctx
}

export function getLanguageContext(): LanguageContext {
  const ctx = getContext<LanguageContext | undefined>(LANGUAGE_CONTEXT_KEY)
  if (!ctx) {
    throw new Error('LanguageContext not found. Did you forget to call initLanguageContext()?')
  }
  return ctx
}

// Re-export useful types and utilities from runtime
export { type Locale, locales, getLocale } from '$lib/paraglide/runtime.js'
