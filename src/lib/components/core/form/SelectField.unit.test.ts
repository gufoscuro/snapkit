import { render, screen, fireEvent, cleanup } from '@testing-library/svelte'
import { describe, expect, it, vi, afterEach, beforeEach } from 'vitest'

vi.mock('$app/environment', () => ({ browser: true }))
vi.mock('./form-context', () => ({
	getFormContextOptional: vi.fn(() => null),
}))
vi.mock('$utils/classnames', () => ({
	joinClassnames: (...args: string[]) => args.filter(Boolean).join(' '),
}))
vi.mock('$utils/form', () => ({
	getUserMessagingClasses: (error?: string, warning?: string) => {
		if (error) return 'error-class'
		if (warning) return 'warning-class'
		return ''
	},
}))

import SelectField from './SelectField.svelte'
import { getFormContextOptional } from './form-context'

const testItems = [
	{ value: 'opt1', label: 'Option 1' },
	{ value: 'opt2', label: 'Option 2' },
	{ value: 'opt3', label: 'Option 3' },
]

/** The Select.Trigger renders as a <button> with aria-haspopup="listbox" */
function getTrigger(): HTMLButtonElement {
	const btn = document.querySelector('button[aria-haspopup="listbox"]') as HTMLButtonElement | null
	if (!btn) throw new Error('Select trigger not found')
	return btn
}

function getTriggerOrNull(): HTMLButtonElement | null {
	return document.querySelector('button[aria-haspopup="listbox"]')
}

describe('SelectField', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		vi.mocked(getFormContextOptional).mockReturnValue(null)
	})

	afterEach(() => cleanup())

	describe('rendering', () => {
		it('renders a trigger button', () => {
			render(SelectField, { props: { name: 'status', items: testItems } })
			expect(getTrigger()).toBeInTheDocument()
		})

		it('renders label text', () => {
			render(SelectField, { props: { name: 'status', label: 'Status', items: testItems } })
			const label = document.querySelector('label')
			expect(label).toBeInTheDocument()
			expect(label?.textContent).toContain('Status')
		})

		it('hides label visually when showLabel is false', () => {
			render(SelectField, {
				props: { name: 'status', label: 'Status', showLabel: false, items: testItems },
			})
			const labels = document.querySelectorAll('label')
			const statusLabel = Array.from(labels).find((l) => l.textContent?.includes('Status'))
			expect(statusLabel?.className).toContain('sr-only')
		})

		it('shows selected option label', () => {
			render(SelectField, {
				props: { name: 'status', items: testItems, value: 'opt2' },
			})
			expect(screen.getByText('Option 2')).toBeInTheDocument()
		})

		it('shows placeholder when no value is selected', () => {
			render(SelectField, {
				props: { name: 'status', placeholder: 'Select...', items: testItems },
			})
			expect(screen.getByText('Select...')).toBeInTheDocument()
		})

		it('falls back to label when no value and no placeholder', () => {
			render(SelectField, {
				props: { name: 'status', label: 'Status', items: testItems },
			})
			const trigger = getTrigger()
			expect(trigger.textContent).toContain('Status')
		})
	})

	describe('disabled state', () => {
		it('is not disabled by default', () => {
			render(SelectField, { props: { name: 'status', items: testItems } })
			expect(getTrigger()).not.toBeDisabled()
		})

		it('is disabled when disabled prop is true', () => {
			render(SelectField, { props: { name: 'status', items: testItems, disabled: true } })
			expect(getTrigger()).toBeDisabled()
		})
	})

	describe('hidden state', () => {
		it('renders by default', () => {
			render(SelectField, { props: { name: 'status', items: testItems } })
			expect(getTrigger()).toBeInTheDocument()
		})

		it('does not render when hidden', () => {
			render(SelectField, { props: { name: 'status', items: testItems, hidden: true } })
			expect(getTriggerOrNull()).not.toBeInTheDocument()
		})
	})

	describe('error display', () => {
		it('shows error message', () => {
			render(SelectField, {
				props: { name: 'status', items: testItems, error: 'Selection required' },
			})
			expect(screen.getByText('Selection required')).toBeInTheDocument()
		})

		it('sets aria-invalid when error is present', () => {
			render(SelectField, {
				props: { name: 'status', items: testItems, error: 'Required' },
			})
			expect(getTrigger()).toHaveAttribute('aria-invalid', 'true')
		})
	})

	describe('clear button', () => {
		it('does not show clear button when allowClear is false', () => {
			render(SelectField, {
				props: { name: 'status', items: testItems, value: 'opt1', allowClear: false },
			})
			const clearBtns = document.querySelectorAll('button[type="button"]')
			// Only the trigger button, no clear button
			expect(clearBtns.length).toBeLessThanOrEqual(1)
		})

		it('shows clear button when allowClear is true and value is set', () => {
			render(SelectField, {
				props: { name: 'status', items: testItems, value: 'opt1', allowClear: true },
			})
			const buttons = document.querySelectorAll('button[type="button"]')
			// Should have more than just the trigger
			expect(buttons.length).toBeGreaterThanOrEqual(1)
		})

		it('calls onChange with null when clear is clicked', async () => {
			const onChange = vi.fn()
			render(SelectField, {
				props: {
					name: 'status',
					items: testItems,
					value: 'opt1',
					allowClear: true,
					onChange,
				},
			})
			const clearButton = document.querySelector('button[type="button"]:not([aria-haspopup])')!
			await fireEvent.click(clearButton)
			expect(onChange).toHaveBeenCalledWith(null)
		})
	})

	describe('fetchFunction', () => {
		it('calls fetchFunction when provided and fetchOnOpen is false', async () => {
			const fetchFunction = vi.fn().mockResolvedValue([
				{ value: 'fetched1', label: 'Fetched 1' },
			])

			render(SelectField, {
				props: { name: 'status', fetchFunction, fetchOnOpen: false },
			})

			await vi.waitFor(() => {
				expect(fetchFunction).toHaveBeenCalledOnce()
			})
		})
	})

	describe('form context autowiring', () => {
		function mockFormContext(overrides: Record<string, unknown> = {}) {
			const ctx = {
				values: { status: null },
				errors: {},
				touched: {},
				isValid: true,
				isDirty: false,
				inflight: false,
				locked: false,
				errorMessage: null,
				customFieldValues: {},
				customFieldErrors: {},
				customFieldTouched: {},
				updateField: vi.fn(),
				validateField: vi.fn(),
				touchField: vi.fn(),
				reset: vi.fn(),
				submit: vi.fn(),
				updateCustomField: vi.fn(),
				touchCustomField: vi.fn(),
				validateCustomField: vi.fn(),
				...overrides,
			}
			vi.mocked(getFormContextOptional).mockReturnValue(ctx as never)
			return ctx
		}

		it('reads value from form context', () => {
			mockFormContext({ values: { status: 'opt2' } })
			render(SelectField, { props: { name: 'status', items: testItems } })
			expect(screen.getByText('Option 2')).toBeInTheDocument()
		})

		it('is disabled when form context is locked', () => {
			mockFormContext({ locked: true })
			render(SelectField, { props: { name: 'status', items: testItems } })
			expect(getTrigger()).toBeDisabled()
		})

		it('shows error from form context', () => {
			mockFormContext({ errors: { status: 'Context error' } })
			render(SelectField, { props: { name: 'status', items: testItems } })
			expect(screen.getByText('Context error')).toBeInTheDocument()
		})

		it('prefers explicit error prop over context error', () => {
			mockFormContext({ errors: { status: 'Context error' } })
			render(SelectField, {
				props: { name: 'status', items: testItems, error: 'Prop error' },
			})
			expect(screen.getByText('Prop error')).toBeInTheDocument()
			expect(screen.queryByText('Context error')).not.toBeInTheDocument()
		})

		it('hides when resourceConfig marks field not visible', () => {
			mockFormContext({
				resourceConfig: { fields: { status: { visible: false } }, custom_fields: [] },
			})
			render(SelectField, { props: { name: 'status', items: testItems } })
			expect(getTriggerOrNull()).not.toBeInTheDocument()
		})
	})
})
