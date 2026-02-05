import { COUNTRIES, DEFAULT_COUNTRY_CODE, type CountryConfig } from '$lib/config/countries'
import type { ExtendedOption } from './generics'

export { DEFAULT_COUNTRY_CODE, type CountryConfig } from '$lib/config/countries'

/**
 * Find a country by code
 */
export function findCountry(code: string): CountryConfig | undefined {
	return COUNTRIES.find((c) => c.code === code)
}

/**
 * Get country name from code
 */
export function getCountryName(code: string): string {
	return findCountry(code)?.name ?? code
}

/**
 * Get country options for selectors
 */
export function getCountryOptions(): Array<ExtendedOption> {
	return COUNTRIES.map((country) => ({
		label: country.name,
		value: country.code,
	}))
}

/**
 * Validate a country code
 */
export function validateCountry(code: string): boolean {
	if (!code) return false
	return COUNTRIES.some((c) => c.code === code)
}
