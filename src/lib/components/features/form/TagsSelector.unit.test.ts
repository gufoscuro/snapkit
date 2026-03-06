import { render, cleanup } from '@testing-library/svelte'
import { describe, expect, it, vi, afterEach, beforeEach } from 'vitest'

let capturedProps: Record<string, any> = {}

vi.mock('$app/environment', () => ({ browser: true }))
vi.mock('$lib/paraglide/messages.js', () => ({
	document_tags: () => 'Document Tags',
	select_tags: () => 'Select tags...',
}))
vi.mock('$lib/utils/request', () => ({
	apiRequest: vi.fn(),
}))
vi.mock('$lib/components/core/form/FormGenericMultiSelector.svelte', () => ({
	default: vi.fn((_, props) => {
		capturedProps = { ...props }
	}),
}))

import TagsSelector from './TagsSelector.svelte'
import { apiRequest } from '$lib/utils/request'

describe('TagsSelector', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		capturedProps = {}
	})

	afterEach(() => cleanup())

	describe('rendering', () => {
		it('passes correct default props to FormGenericMultiSelector', () => {
			render(TagsSelector, { props: { legalEntityId: 'le-1' } })

			expect(capturedProps.name).toBe('tags')
			expect(capturedProps.label).toBe('Document Tags')
			expect(capturedProps.placeholder).toBe('Select tags...')
			expect(capturedProps.showLabel).toBe(true)
			expect(capturedProps.allowCreate).toBe(true)
			expect(capturedProps.value).toEqual([])
		})

		it('passes custom name prop', () => {
			render(TagsSelector, { props: { legalEntityId: 'le-1', name: 'custom-tags' } })
			expect(capturedProps.name).toBe('custom-tags')
		})

		it('passes value prop', () => {
			render(TagsSelector, { props: { legalEntityId: 'le-1', value: ['tag1', 'tag2'] } })
			expect(capturedProps.value).toEqual(['tag1', 'tag2'])
		})

		it('passes showLabel=false', () => {
			render(TagsSelector, { props: { legalEntityId: 'le-1', showLabel: false } })
			expect(capturedProps.showLabel).toBe(false)
		})
	})

	describe('fetchFunction', () => {
		it('calls apiRequest with correct URL using legalEntityId', async () => {
			vi.mocked(apiRequest).mockResolvedValue({ data: [] })

			render(TagsSelector, { props: { legalEntityId: 'le-123' } })

			await capturedProps.fetchFunction()

			expect(apiRequest).toHaveBeenCalledWith({
				url: '/legal-entities/le-123/document-tags',
			})
		})

		it('returns data array from response', async () => {
			const tags = [
				{ name: 'Invoice', slug: 'invoice' },
				{ name: 'Receipt', slug: 'receipt' },
			]
			vi.mocked(apiRequest).mockResolvedValue({ data: tags })

			render(TagsSelector, { props: { legalEntityId: 'le-1' } })

			const result = await capturedProps.fetchFunction()
			expect(result).toEqual(tags)
		})

		it('handles legacy response format without data wrapper', async () => {
			const tags = [{ name: 'Invoice', slug: 'invoice' }]
			vi.mocked(apiRequest).mockResolvedValue(tags)

			render(TagsSelector, { props: { legalEntityId: 'le-1' } })

			const result = await capturedProps.fetchFunction()
			expect(result).toEqual(tags)
		})
	})

	describe('optionMappingFunction', () => {
		it('maps DocumentTag to ExtendedOption with label, value, and attr', () => {
			render(TagsSelector, { props: { legalEntityId: 'le-1' } })

			const tag = { name: 'Invoice', slug: 'invoice', id: '1' }
			const result = capturedProps.optionMappingFunction(tag)

			expect(result).toEqual({
				label: 'Invoice',
				value: 'invoice',
				attr: tag,
			})
		})
	})

	describe('onChange', () => {
		it('calls onChange prop with labels of selected items', () => {
			const onChange = vi.fn()
			render(TagsSelector, { props: { legalEntityId: 'le-1', onChange } })

			capturedProps.onChange([
				{ label: 'Invoice', value: 'invoice' },
				{ label: 'Receipt', value: 'receipt' },
			])

			expect(onChange).toHaveBeenCalledWith(['Invoice', 'Receipt'])
		})

		it('does not throw when onChange prop is not provided', () => {
			render(TagsSelector, { props: { legalEntityId: 'le-1' } })

			expect(() =>
				capturedProps.onChange([{ label: 'Invoice', value: 'invoice' }])
			).not.toThrow()
		})

		it('calls onChange with empty array when no items selected', () => {
			const onChange = vi.fn()
			render(TagsSelector, { props: { legalEntityId: 'le-1', onChange } })

			capturedProps.onChange([])

			expect(onChange).toHaveBeenCalledWith([])
		})
	})
})
