/**
 * Countries configuration
 * ISO 3166-1 alpha-2 country codes
 */

export type CountryConfig = {
	/** ISO 3166-1 alpha-2 country code */
	code: string
	/** Country name (English) */
	name: string
}

/** Default country code */
export const DEFAULT_COUNTRY_CODE = 'IT'

/** Available countries */
export const COUNTRIES: CountryConfig[] = [
	{ code: 'IT', name: 'Italy' },
	{ code: 'FR', name: 'France' },
	{ code: 'DE', name: 'Germany' },
	{ code: 'ES', name: 'Spain' },
	{ code: 'GB', name: 'United Kingdom' },
	{ code: 'US', name: 'United States' },
	{ code: 'CH', name: 'Switzerland' },
	{ code: 'AT', name: 'Austria' },
	{ code: 'BE', name: 'Belgium' },
	{ code: 'NL', name: 'Netherlands' },
	{ code: 'PL', name: 'Poland' },
	{ code: 'PT', name: 'Portugal' },
	{ code: 'GR', name: 'Greece' },
	{ code: 'CZ', name: 'Czech Republic' },
	{ code: 'DK', name: 'Denmark' },
	{ code: 'SE', name: 'Sweden' },
	{ code: 'NO', name: 'Norway' },
	{ code: 'FI', name: 'Finland' },
	{ code: 'IE', name: 'Ireland' },
	{ code: 'LU', name: 'Luxembourg' },
	{ code: 'CN', name: 'China' },
	{ code: 'JP', name: 'Japan' },
	{ code: 'KR', name: 'South Korea' },
	{ code: 'IN', name: 'India' },
	{ code: 'BR', name: 'Brazil' },
	{ code: 'CA', name: 'Canada' },
	{ code: 'MX', name: 'Mexico' },
	{ code: 'AU', name: 'Australia' },
	{ code: 'NZ', name: 'New Zealand' },
	{ code: 'ZA', name: 'South Africa' },
]
