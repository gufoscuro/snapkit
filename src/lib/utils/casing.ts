/*
	Installed from @ieedan/std
*/

import { isLetter } from '$lib/utils/is-letter.js';

/** Converts a `camelCase` string to a `snake_case` string
 *
 * @param str
 * @returns
 *
 * ## Usage
 * ```ts
 * camelToSnake('helloWorld'); // hello_world
 * ```
 */
export function camelToSnake(str: string): string {
	let newStr = '';

	for (let i = 0; i < str.length; i++) {
		// is uppercase letter
		if (isLetter(str[i]) && str[i].toUpperCase() === str[i]) {
			let l = i;

			while (l < str.length && isLetter(str[l]) && str[l].toUpperCase() === str[l]) {
				l++;
			}

			newStr += `${str.slice(i, l - 1).toLocaleLowerCase()}_${str[l - 1].toLocaleLowerCase()}`;

			i = l - 1;

			continue;
		}

		newStr += str[i].toLocaleLowerCase();
	}

	return newStr;
}

/** Converts a `PascalCase` string to a `snake_case` string
 *
 * @param str
 * @returns
 *
 * ## Usage
 * ```ts
 * camelToSnake('HelloWorld'); // hello_world
 * ```
 */
export function pascalToSnake(str: string): string {
	let newStr = '';

	let firstLetter: number | undefined;

	for (let i = 0; i < str.length; i++) {
		if (firstLetter === undefined && isLetter(str[i])) {
			firstLetter = i;
		}

		// is uppercase letter (ignoring the first)
		if (
			firstLetter !== undefined &&
			i > firstLetter &&
			isLetter(str[i]) &&
			str[i].toUpperCase() === str[i]
		) {
			let l = i;

			while (l < str.length && isLetter(str[l]) && str[l].toUpperCase() === str[l]) {
				l++;
			}

			newStr += `${str.slice(i, l - 1).toLocaleLowerCase()}_${str[l - 1].toLocaleLowerCase()}`;

			i = l - 1;

			continue;
		}

		newStr += str[i].toLocaleLowerCase();
	}

	return newStr;
}

/** Converts a `camelCase` string to a `kebab-case` string
 *
 * @param str
 * @returns
 *
 * ## Usage
 * ```ts
 * camelToSnake('helloWorld'); // hello-world
 * ```
 */
export function camelToKebab(str: string): string {
	let newStr = '';

	for (let i = 0; i < str.length; i++) {
		// is uppercase letter
		if (i > 0 && isLetter(str[i]) && str[i].toUpperCase() === str[i]) {
			let l = i;

			while (l < str.length && isLetter(str[l]) && str[l].toUpperCase() === str[l]) {
				l++;
			}

			newStr += `${str.slice(i, l - 1).toLocaleLowerCase()}-${str[l - 1].toLocaleLowerCase()}`;

			i = l - 1;

			continue;
		}

		newStr += str[i].toLocaleLowerCase();
	}

	return newStr;
}

/** Converts a `PascalCase` string to a `kebab-case` string
 *
 * @param str
 * @returns
 *
 * ## Usage
 * ```ts
 * camelToSnake('HelloWorld'); // hello-world
 * ```
 */
export function pascalToKebab(str: string): string {
	let newStr = '';

	for (let i = 0; i < str.length; i++) {
		// is uppercase letter (ignoring the first)
		if (i > 0 && isLetter(str[i]) && str[i].toUpperCase() === str[i]) {
			let l = i;

			while (l < str.length && isLetter(str[l]) && str[l].toUpperCase() === str[l]) {
				l++;
			}

			newStr += `${str.slice(i, l - 1).toLocaleLowerCase()}-${str[l - 1].toLocaleLowerCase()}`;

			i = l - 1;

			continue;
		}

		newStr += str[i].toLocaleLowerCase();
	}

	return newStr;
}

/** Converts a `camelCase` string to a `PascalCase` string (makes first letter lowercase)
 *
 * @param str
 * @returns
 *
 * ## Usage
 * ```ts
 * camelToPascal('helloWorld'); // HelloWorld
 * ```
 */
export function camelToPascal(str: string): string {
	return `${str[0].toLocaleUpperCase()}${str.slice(1)}`;
}

/** Converts a `PascalCase` string to a `camelCase` string (makes first letter uppercase)
 *
 * @param str
 * @returns
 *
 * ## Usage
 * ```ts
 * camelToPascal('HelloWorld'); // helloWorld
 * ```
 */
export function pascalToCamel(str: string): string {
	return `${str[0].toLocaleLowerCase()}${str.slice(1)}`;
}

/** Converts a `snake_case` string to a `PascalCase` string
 *
 *
 * @param str
 * @returns
 *
 * ## Usage
 * ```ts
 * snakeToPascal('hello_world'); // HelloWorld
 * snakeToPascal('HELLO_WORLD'); // HelloWorld
 * ```
 */
export function snakeToPascal(str: string): string {
	let newStr = '';

	let firstLetter = true;

	for (let i = 0; i < str.length; i++) {
		// capitalize first letter
		if (firstLetter && isLetter(str[i])) {
			firstLetter = false;
			newStr += str[i].toUpperCase();
			continue;
		}

		// capitalize first after a _ (ignoring the first)
		if (!firstLetter && str[i] === '_') {
			i++;
			if (i <= str.length - 1) {
				newStr += str[i].toUpperCase();
			} else {
				newStr += '_';
			}
			continue;
		}

		newStr += str[i].toLocaleLowerCase();
	}

	return newStr;
}

/** Converts a `snake_case` string to a `camelCase` string
 *
 *
 * @param str
 * @returns
 *
 * ## Usage
 * ```ts
 * snakeToCamel('hello_world'); // helloWorld
 * snakeToCamel('HELLO_WORLD'); // helloWorld
 * ```
 */
export function snakeToCamel(str: string): string {
	let newStr = '';

	let firstLetter = true;

	for (let i = 0; i < str.length; i++) {
		// capitalize first letter
		if (firstLetter && isLetter(str[i])) {
			firstLetter = false;
			newStr += str[i].toLowerCase();
			continue;
		}

		// capitalize first after a _ (ignoring the first)
		if (!firstLetter && str[i] === '_') {
			i++;
			if (i <= str.length - 1) {
				newStr += str[i].toUpperCase();
			} else {
				newStr += '_';
			}
			continue;
		}

		newStr += str[i].toLocaleLowerCase();
	}

	return newStr;
}

/** Converts a `kebab-case` string to a `PascalCase` string
 *
 * @param str
 * @returns
 *
 * ## Usage
 * ```ts
 * kebabToPascal('hello-world'); // HelloWorld
 * ```
 */
export function kebabToPascal(str: string): string {
	let newStr = '';

	for (let i = 0; i < str.length; i++) {
		// capitalize first
		if (i === 0) {
			newStr += str[i].toUpperCase();
			continue;
		}

		// capitalize first after a -
		if (str[i] === '-') {
			i++;
			if (i <= str.length - 1) {
				newStr += str[i].toUpperCase();
			}
			continue;
		}

		newStr += str[i].toLocaleLowerCase();
	}

	return newStr;
}

/** Converts a `kebab-case` string to a `camelCase` string
 *
 *
 * @param str
 * @returns
 *
 * ## Usage
 * ```ts
 * kebabToCamel('hello-world'); // helloWorld
 * ```
 */
export function kebabToCamel(str: string): string {
	let newStr = '';

	for (let i = 0; i < str.length; i++) {
		// capitalize first after a -
		if (str[i] === '-') {
			i++;
			if (i <= str.length - 1) {
				newStr += str[i].toUpperCase();
			}
			continue;
		}

		newStr += str[i].toLocaleLowerCase();
	}

	return newStr;
}

/** Converts any text to a URL-friendly slug
 *
 * @param text
 * @returns
 *
 * ## Usage
 * ```ts
 * slugify('Hello World'); // hello-world
 * slugify('My Cool Page!'); // my-cool-page
 * slugify('  Spaced   Out  '); // spaced-out
 * slugify('Über Café'); // uber-cafe
 * ```
 */
export function slugify(text: string): string {
	return text
		.normalize('NFD') // Decompose accented characters
		.replace(/[\u0300-\u036f]/g, '') // Remove diacritics
		.toLowerCase()
		.trim()
		// Replace spaces and underscores with hyphens
		.replace(/[\s_]+/g, '-')
		// Remove special characters except hyphens
		.replace(/[^\w\-]+/g, '')
		// Replace multiple consecutive hyphens with single hyphen
		.replace(/\-\-+/g, '-')
		// Remove leading/trailing hyphens
		.replace(/^-+|-+$/g, '');
}

/** Normalizes a route path to ensure it's valid
 *
 * @param route - The route path to normalize
 * @returns Normalized route path
 *
 * ## Usage
 * ```ts
 * normalizeRoute('about'); // /about
 * normalizeRoute('//products///items'); // /products/items
 * normalizeRoute('  /contact  '); // /contact
 * normalizeRoute(':id/edit'); // /:id/edit
 * ```
 */
export function normalizeRoute(route: string): string {
	// Trim whitespace
	let normalized = route.trim();

	// If empty, return root
	if (!normalized) return '/';

	// Ensure starts with /
	if (!normalized.startsWith('/')) {
		normalized = `/${normalized}`;
	}

	// Replace multiple consecutive slashes with single slash
	normalized = normalized.replace(/\/+/g, '/');

	// Remove trailing slash (except for root)
	if (normalized.length > 1 && normalized.endsWith('/')) {
		normalized = normalized.slice(0, -1);
	}

	return normalized;
}
