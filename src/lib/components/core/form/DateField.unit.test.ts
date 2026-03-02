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
vi.mock('$lib/paraglide/messages', () => ({
	date_label: () => 'Date',
	select_date_placeholder: () => 'Select date',
	clear_date: () => 'Clear',
}))

import DateField from './DateField.svelte'
import { getFormContextOptional } from './form-context'

describe('DateField', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		vi.mocked(getFormContextOptional).mockReturnValue(null)
	})

	afterEach(() => cleanup())

	describe('rendering', () => {
		it('renders a trigger button', () => {
			render(DateField, { props: { name: 'due_date' } })
			expect(screen.getByRole('button')).toBeInTheDocument()
		})

		it('renders label text', () => {
			render(DateField, { props: { name: 'due_date', label: 'Due Date' } })
			expect(screen.getByText('Due Date')).toBeInTheDocument()
		})

		it('renders default label from i18n', () => {
			render(DateField, { props: { name: 'due_date' } })
			expect(screen.getByText('Date')).toBeInTheDocument()
		})

		it('hides label visually when showLabel is false', () => {
			render(DateField, { props: { name: 'due_date', label: 'Date', showLabel: false } })
			const label = screen.getByText('Date')
			expect(label.className).toContain('sr-only')
		})

		it('shows placeholder when no date is selected', () => {
			render(DateField, { props: { name: 'due_date' } })
			expect(screen.getByText('Select date')).toBeInTheDocument()
		})

		it('shows custom placeholder', () => {
			render(DateField, { props: { name: 'due_date', placeholder: 'Pick a date...' } })
			expect(screen.getByText('Pick a date...')).toBeInTheDocument()
		})
	})

	describe('with Date value', () => {
		it('displays formatted date when value is a Date', () => {
			const date = new Date(2025, 0, 15) // January 15, 2025
			render(DateField, { props: { name: 'due_date', value: date } })
			// Should not show the placeholder anymore
			expect(screen.queryByText('Select date')).not.toBeInTheDocument()
		})

		it('displays formatted date when value is an ISO string', () => {
			render(DateField, { props: { name: 'due_date', value: '2025-01-15T00:00:00.000Z' } })
			expect(screen.queryByText('Select date')).not.toBeInTheDocument()
		})

		it('shows placeholder for invalid date string', () => {
			render(DateField, { props: { name: 'due_date', value: 'not-a-date' } })
			expect(screen.getByText('Select date')).toBeInTheDocument()
		})
	})

	describe('disabled state', () => {
		it('is not disabled by default', () => {
			render(DateField, { props: { name: 'due_date' } })
			expect(screen.getByRole('button')).not.toBeDisabled()
		})

		it('is disabled when disabled prop is true', () => {
			render(DateField, { props: { name: 'due_date', disabled: true } })
			expect(screen.getByRole('button')).toBeDisabled()
		})
	})

	describe('hidden state', () => {
		it('renders by default', () => {
			render(DateField, { props: { name: 'due_date' } })
			expect(screen.getByRole('button')).toBeInTheDocument()
		})

		it('does not render when hidden', () => {
			render(DateField, { props: { name: 'due_date', hidden: true } })
			expect(screen.queryByRole('button')).not.toBeInTheDocument()
		})
	})

	describe('error display', () => {
		it('shows error message', () => {
			render(DateField, { props: { name: 'due_date', error: 'Date required' } })
			expect(screen.getByText('Date required')).toBeInTheDocument()
		})

		it('sets aria-invalid when error is present', () => {
			render(DateField, { props: { name: 'due_date', error: 'Required' } })
			expect(screen.getByRole('button')).toHaveAttribute('aria-invalid', 'true')
		})
	})

	describe('popover interaction', () => {
		it('opens calendar popover on click', async () => {
			render(DateField, { props: { name: 'due_date' } })
			await fireEvent.click(screen.getByRole('button'))

			// Calendar grid should appear
			await vi.waitFor(() => {
				expect(screen.getByRole('grid')).toBeInTheDocument()
			})
		})
	})

	describe('form context autowiring', () => {
		function mockFormContext(overrides: Record<string, unknown> = {}) {
			const ctx = {
				values: { due_date: undefined },
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

		it('reads date from form context', () => {
			mockFormContext({ values: { due_date: new Date(2025, 5, 15) } })
			render(DateField, { props: { name: 'due_date' } })
			// Should not show placeholder if a date is present
			expect(screen.queryByText('Select date')).not.toBeInTheDocument()
		})

		it('calls touchField on blur', async () => {
			const ctx = mockFormContext()
			render(DateField, { props: { name: 'due_date' } })
			await fireEvent.blur(screen.getByRole('button'))
			expect(ctx.touchField).toHaveBeenCalledWith('due_date')
		})

		it('is disabled when form context is locked', () => {
			mockFormContext({ locked: true })
			render(DateField, { props: { name: 'due_date' } })
			expect(screen.getByRole('button')).toBeDisabled()
		})

		it('shows error from form context', () => {
			mockFormContext({ errors: { due_date: 'Context error' } })
			render(DateField, { props: { name: 'due_date' } })
			expect(screen.getByText('Context error')).toBeInTheDocument()
		})

		it('prefers explicit error prop over context error', () => {
			mockFormContext({ errors: { due_date: 'Context error' } })
			render(DateField, { props: { name: 'due_date', error: 'Prop error' } })
			expect(screen.getByText('Prop error')).toBeInTheDocument()
			expect(screen.queryByText('Context error')).not.toBeInTheDocument()
		})

		it('hides when resourceConfig marks field not visible', () => {
			mockFormContext({
				resourceConfig: { fields: { due_date: { visible: false } }, custom_fields: [] },
			})
			render(DateField, { props: { name: 'due_date' } })
			expect(screen.queryByRole('button')).not.toBeInTheDocument()
		})
	})
})
