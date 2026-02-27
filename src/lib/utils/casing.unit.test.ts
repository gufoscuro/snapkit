import { describe, it, expect } from 'vitest'
import {
	camelToSnake,
	pascalToSnake,
	camelToKebab,
	pascalToKebab,
	camelToPascal,
	pascalToCamel,
	snakeToPascal,
	snakeToCamel,
	kebabToPascal,
	kebabToCamel,
	slugify,
	normalizeRoute,
} from './casing'

describe('camelToSnake', () => {
	it('converts simple camelCase', () => {
		expect(camelToSnake('helloWorld')).toBe('hello_world')
	})

	it('handles multiple words', () => {
		expect(camelToSnake('helloWorldFoo')).toBe('hello_world_foo')
	})

	it('handles single word', () => {
		expect(camelToSnake('hello')).toBe('hello')
	})

	it('handles consecutive uppercase (acronyms)', () => {
		// Library splits acronym runs: last char gets the separator
		expect(camelToSnake('parseHTML')).toBe('parsehtm_l')
	})
})

describe('pascalToSnake', () => {
	it('converts PascalCase to snake_case', () => {
		expect(pascalToSnake('HelloWorld')).toBe('hello_world')
	})

	it('handles single word', () => {
		expect(pascalToSnake('Hello')).toBe('hello')
	})

	it('handles consecutive uppercase', () => {
		expect(pascalToSnake('ParseHTML')).toBe('parsehtm_l')
	})
})

describe('camelToKebab', () => {
	it('converts camelCase to kebab-case', () => {
		expect(camelToKebab('helloWorld')).toBe('hello-world')
	})

	it('handles multiple words', () => {
		expect(camelToKebab('helloWorldFoo')).toBe('hello-world-foo')
	})

	it('handles consecutive uppercase', () => {
		expect(camelToKebab('parseHTML')).toBe('parsehtm-l')
	})
})

describe('pascalToKebab', () => {
	it('converts PascalCase to kebab-case', () => {
		expect(pascalToKebab('HelloWorld')).toBe('hello-world')
	})

	it('handles single word', () => {
		expect(pascalToKebab('Hello')).toBe('hello')
	})
})

describe('camelToPascal', () => {
	it('capitalizes first letter', () => {
		expect(camelToPascal('helloWorld')).toBe('HelloWorld')
	})

	it('handles single char', () => {
		expect(camelToPascal('h')).toBe('H')
	})
})

describe('pascalToCamel', () => {
	it('lowercases first letter', () => {
		expect(pascalToCamel('HelloWorld')).toBe('helloWorld')
	})

	it('handles single char', () => {
		expect(pascalToCamel('H')).toBe('h')
	})
})

describe('snakeToPascal', () => {
	it('converts snake_case to PascalCase', () => {
		expect(snakeToPascal('hello_world')).toBe('HelloWorld')
	})

	it('handles SCREAMING_SNAKE_CASE', () => {
		expect(snakeToPascal('HELLO_WORLD')).toBe('HelloWorld')
	})

	it('handles single word', () => {
		expect(snakeToPascal('hello')).toBe('Hello')
	})
})

describe('snakeToCamel', () => {
	it('converts snake_case to camelCase', () => {
		expect(snakeToCamel('hello_world')).toBe('helloWorld')
	})

	it('handles SCREAMING_SNAKE_CASE', () => {
		expect(snakeToCamel('HELLO_WORLD')).toBe('helloWorld')
	})

	it('handles single word', () => {
		expect(snakeToCamel('hello')).toBe('hello')
	})
})

describe('kebabToPascal', () => {
	it('converts kebab-case to PascalCase', () => {
		expect(kebabToPascal('hello-world')).toBe('HelloWorld')
	})

	it('handles single word', () => {
		expect(kebabToPascal('hello')).toBe('Hello')
	})

	it('handles multiple segments', () => {
		expect(kebabToPascal('hello-world-foo')).toBe('HelloWorldFoo')
	})
})

describe('kebabToCamel', () => {
	it('converts kebab-case to camelCase', () => {
		expect(kebabToCamel('hello-world')).toBe('helloWorld')
	})

	it('handles single word', () => {
		expect(kebabToCamel('hello')).toBe('hello')
	})
})

describe('slugify', () => {
	it('converts spaces to hyphens and lowercases', () => {
		expect(slugify('Hello World')).toBe('hello-world')
	})

	it('strips special characters', () => {
		expect(slugify('My Cool Page!')).toBe('my-cool-page')
	})

	it('trims and collapses whitespace', () => {
		expect(slugify('  Spaced   Out  ')).toBe('spaced-out')
	})

	it('handles accented characters', () => {
		expect(slugify('Über Café')).toBe('uber-cafe')
	})

	it('converts underscores to hyphens', () => {
		expect(slugify('hello_world')).toBe('hello-world')
	})
})

describe('normalizeRoute', () => {
	it('adds leading slash', () => {
		expect(normalizeRoute('about')).toBe('/about')
	})

	it('collapses multiple slashes', () => {
		expect(normalizeRoute('//products///items')).toBe('/products/items')
	})

	it('trims whitespace', () => {
		expect(normalizeRoute('  /contact  ')).toBe('/contact')
	})

	it('handles params', () => {
		expect(normalizeRoute(':id/edit')).toBe('/:id/edit')
	})

	it('returns root for empty string', () => {
		expect(normalizeRoute('')).toBe('/')
	})

	it('removes trailing slash', () => {
		expect(normalizeRoute('/about/')).toBe('/about')
	})

	it('keeps root as-is', () => {
		expect(normalizeRoute('/')).toBe('/')
	})
})
