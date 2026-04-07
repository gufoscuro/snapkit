import { LANGUAGES, DEFAULT_LANGUAGE_CODE, type LanguageConfig } from '$lib/config/languages'
import type { ExtendedOption } from './generics'

export { DEFAULT_LANGUAGE_CODE, type LanguageConfig } from '$lib/config/languages'

/**
 * Find a language by code
 */
export function findLanguage(code: string): LanguageConfig | undefined {
	return LANGUAGES.find((l) => l.code === code)
}

/**
 * Get language name from code
 */
export function getLanguageName(code: string): string {
	return findLanguage(code)?.name ?? code
}

/**
 * Get language options for selectors
 */
export function getLanguageOptions(): Array<ExtendedOption> {
	return LANGUAGES.map((language) => ({
		label: language.name,
		value: language.code,
	}))
}

/**
 * Validate a language code
 */
export function validateLanguage(code: string): boolean {
	if (!code) return false
	return LANGUAGES.some((l) => l.code === code)
}
