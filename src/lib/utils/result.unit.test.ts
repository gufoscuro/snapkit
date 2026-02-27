import { describe, it, expect } from 'vitest'
import { Ok, Err } from './result'

describe('Ok', () => {
	it('isOk returns true', () => {
		expect(Ok('value').isOk()).toBe(true)
	})

	it('isErr returns false', () => {
		expect(Ok('value').isErr()).toBe(false)
	})

	it('unwrap returns value', () => {
		expect(Ok(42).unwrap()).toBe(42)
	})

	it('unwrapOr returns value (not default)', () => {
		expect(Ok(42).unwrapOr(0)).toBe(42)
	})

	it('unwrapErr throws', () => {
		expect(() => Ok('value').unwrapErr()).toThrow()
	})

	it('expect returns value', () => {
		expect(Ok('hello').expect('should not fail')).toBe('hello')
	})

	it('expectErr throws with message', () => {
		expect(() => Ok('value').expectErr('custom msg')).toThrow('custom msg')
	})
})

describe('Err', () => {
	it('isOk returns false', () => {
		expect(Err('oops').isOk()).toBe(false)
	})

	it('isErr returns true', () => {
		expect(Err('oops').isErr()).toBe(true)
	})

	it('unwrap throws', () => {
		expect(() => Err('oops').unwrap()).toThrow()
	})

	it('unwrapErr returns error', () => {
		expect(Err('oops').unwrapErr()).toBe('oops')
	})

	it('unwrapOr returns default', () => {
		expect(Err('oops').unwrapOr(42)).toBe(42)
	})

	it('unwrapErrOr returns error (not default)', () => {
		expect(Err('oops').unwrapErrOr('default')).toBe('oops')
	})

	it('expect throws with message', () => {
		expect(() => Err('oops').expect('custom msg')).toThrow('custom msg')
	})

	it('expectErr returns error', () => {
		expect(Err('oops').expectErr('should not fail')).toBe('oops')
	})
})

describe('match', () => {
	it('calls success for Ok', () => {
		const result = Ok('hello').match(
			(val) => val.length,
			() => 0
		)
		expect(result).toBe(5)
	})

	it('calls failure for Err', () => {
		const result = Err('oops').match(
			() => 0,
			(err) => err.length
		)
		expect(result).toBe(4)
	})
})

describe('map', () => {
	it('maps Ok value', () => {
		expect(Ok('foo').map((v) => v.length).unwrap()).toBe(3)
	})

	it('passes through Err', () => {
		expect(Err('oops').map(() => 42).unwrapErr()).toBe('oops')
	})
})

describe('mapOr', () => {
	it('maps Ok value', () => {
		expect(Ok('foo').mapOr(0, (v) => v.length)).toBe(3)
	})

	it('returns default for Err', () => {
		expect(Err('oops').mapOr(0, () => 42)).toBe(0)
	})
})

describe('mapOrElse', () => {
	it('maps Ok value', () => {
		expect(Ok('foo').mapOrElse(() => 0, (v) => v.length)).toBe(3)
	})

	it('calls default fn for Err', () => {
		expect(Err('oops').mapOrElse((e) => e.length, () => 0)).toBe(4)
	})
})

describe('mapErr', () => {
	it('maps Err value', () => {
		expect(Err(10).mapErr((e) => `Error: ${e}`).unwrapErr()).toBe('Error: 10')
	})

	it('passes through Ok', () => {
		expect(Ok('hello').mapErr(() => 'err').unwrap()).toBe('hello')
	})
})

describe('mapErrOr', () => {
	it('returns default for Ok', () => {
		expect(Ok('foo').mapErrOr('default', () => 'mapped')).toBe('default')
	})

	it('maps Err', () => {
		expect(Err('oops').mapErrOr('default', (e) => e.toUpperCase())).toBe('OOPS')
	})
})

describe('unwrapOrElse / unwrapErrOrElse', () => {
	it('unwrapOrElse returns value for Ok', () => {
		expect(Ok(42).unwrapOrElse(() => 0)).toBe(42)
	})

	it('unwrapOrElse calls fn for Err', () => {
		expect(Err('oops').unwrapOrElse(() => 42)).toBe(42)
	})

	it('unwrapErrOrElse returns error for Err', () => {
		expect(Err('oops').unwrapErrOrElse(() => 'fallback')).toBe('oops')
	})

	it('unwrapErrOrElse calls fn for Ok', () => {
		expect(Ok('val').unwrapErrOrElse(() => 'fallback')).toBe('fallback')
	})
})
