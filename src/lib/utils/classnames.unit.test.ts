import { describe, it, expect } from 'vitest'
import { joinClassnames } from './classnames'

describe('joinClassnames', () => {
	it('joins multiple classnames with space', () => {
		expect(joinClassnames('foo', 'bar', 'baz')).toBe('foo bar baz')
	})

	it('handles single classname', () => {
		expect(joinClassnames('foo')).toBe('foo')
	})

	it('handles empty call', () => {
		expect(joinClassnames()).toBe('')
	})
})
