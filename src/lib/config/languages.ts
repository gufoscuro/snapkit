/**
 * Languages configuration
 * ISO 639-1 language codes
 */

export type LanguageConfig = {
	/** ISO 639-1 language code */
	code: string
	/** Language name (English) */
	name: string
}

/** Default language code */
export const DEFAULT_LANGUAGE_CODE = 'it'

/** Available languages */
export const LANGUAGES: LanguageConfig[] = [
	{ code: 'it', name: 'Italian' },
	{ code: 'en', name: 'English' },
	{ code: 'fr', name: 'French' },
	{ code: 'de', name: 'German' },
	{ code: 'es', name: 'Spanish' },
	{ code: 'pt', name: 'Portuguese' },
	{ code: 'nl', name: 'Dutch' },
	{ code: 'pl', name: 'Polish' },
	{ code: 'cs', name: 'Czech' },
	{ code: 'da', name: 'Danish' },
	{ code: 'sv', name: 'Swedish' },
	{ code: 'no', name: 'Norwegian' },
	{ code: 'fi', name: 'Finnish' },
	{ code: 'el', name: 'Greek' },
	{ code: 'ro', name: 'Romanian' },
	{ code: 'hu', name: 'Hungarian' },
	{ code: 'bg', name: 'Bulgarian' },
	{ code: 'hr', name: 'Croatian' },
	{ code: 'sk', name: 'Slovak' },
	{ code: 'sl', name: 'Slovenian' },
	{ code: 'zh', name: 'Chinese' },
	{ code: 'ja', name: 'Japanese' },
	{ code: 'ko', name: 'Korean' },
	{ code: 'ar', name: 'Arabic' },
	{ code: 'ru', name: 'Russian' },
	{ code: 'tr', name: 'Turkish' },
]
