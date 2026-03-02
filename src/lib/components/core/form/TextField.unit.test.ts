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

import TextField from './TextField.svelte'
import { getFormContextOptional } from './form-context'

describe('TextField', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		vi.mocked(getFormContextOptional).mockReturnValue(null)
	})

	afterEach(() => cleanup())

	describe('rendering', () => {
		it('renders an input element', () => {
			render(TextField, { props: { name: 'username' } })
			expect(screen.getByRole('textbox')).toBeInTheDocument()
		})

		it('renders with the correct name attribute', () => {
			render(TextField, { props: { name: 'email' } })
			expect(screen.getByRole('textbox')).toHaveAttribute('name', 'email')
		})

		it('renders label text', () => {
			render(TextField, { props: { name: 'username', label: 'Username' } })
			expect(screen.getByText('Username')).toBeInTheDocument()
		})

		it('hides label visually when showLabel is false', () => {
			render(TextField, { props: { name: 'username', label: 'Username', showLabel: false } })
			const label = screen.getByText('Username')
			expect(label.className).toContain('sr-only')
		})

		it('renders placeholder text', () => {
			render(TextField, { props: { name: 'email', placeholder: 'Enter email' } })
			expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument()
		})
	})

	describe('input types', () => {
		it('defaults to text type', () => {
			render(TextField, { props: { name: 'test' } })
			expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text')
		})

		it('renders as email type', () => {
			render(TextField, { props: { name: 'email', type: 'email' } })
			const input = document.querySelector('input[type="email"]')
			expect(input).toBeInTheDocument()
		})

		it('renders as number type', () => {
			render(TextField, { props: { name: 'qty', type: 'number' } })
			const input = document.querySelector('input[type="number"]')
			expect(input).toBeInTheDocument()
		})

		it('renders as password type', () => {
			render(TextField, { props: { name: 'pass', type: 'password' } })
			const input = document.querySelector('input[type="password"]')
			expect(input).toBeInTheDocument()
		})
	})

	describe('disabled state', () => {
		it('is not disabled by default', () => {
			render(TextField, { props: { name: 'test' } })
			expect(screen.getByRole('textbox')).not.toBeDisabled()
		})

		it('is disabled when disabled prop is true', () => {
			render(TextField, { props: { name: 'test', disabled: true } })
			expect(screen.getByRole('textbox')).toBeDisabled()
		})
	})

	describe('hidden state', () => {
		it('renders by default', () => {
			render(TextField, { props: { name: 'test' } })
			expect(screen.getByRole('textbox')).toBeInTheDocument()
		})

		it('does not render input when hidden is true', () => {
			render(TextField, { props: { name: 'test', hidden: true } })
			expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
		})
	})

	describe('error display', () => {
		it('shows error message', () => {
			render(TextField, { props: { name: 'test', error: 'This field is required' } })
			expect(screen.getByText('This field is required')).toBeInTheDocument()
		})

		it('sets aria-invalid when error is present', () => {
			render(TextField, { props: { name: 'test', error: 'Required' } })
			expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
		})

		it('does not show error when showErrorMessage is false', () => {
			render(TextField, {
				props: { name: 'test', error: 'Required', showErrorMessage: false },
			})
			expect(screen.queryByText('Required')).not.toBeInTheDocument()
		})
	})

	describe('standalone event handlers', () => {
		it('calls oninput handler', async () => {
			const oninput = vi.fn()
			render(TextField, { props: { name: 'test', oninput } })
			const input = screen.getByRole('textbox')

			await fireEvent.input(input, { target: { value: 'hello' } })
			expect(oninput).toHaveBeenCalledOnce()
		})

		it('calls onblur handler', async () => {
			const onblur = vi.fn()
			render(TextField, { props: { name: 'test', onblur } })
			const input = screen.getByRole('textbox')

			await fireEvent.blur(input)
			expect(onblur).toHaveBeenCalledOnce()
		})
	})

	describe('form context autowiring', () => {
		it('reads value from form context when available', () => {
			vi.mocked(getFormContextOptional).mockReturnValue({
				values: { test: 'from-context' },
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
			})

			render(TextField, { props: { name: 'test' } })
			expect(screen.getByRole('textbox')).toHaveValue('from-context')
		})

		it('calls updateField on input when form context is present', async () => {
			const updateField = vi.fn()
			vi.mocked(getFormContextOptional).mockReturnValue({
				values: { test: '' },
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
				updateField,
				validateField: vi.fn(),
				touchField: vi.fn(),
				reset: vi.fn(),
				submit: vi.fn(),
				updateCustomField: vi.fn(),
				touchCustomField: vi.fn(),
				validateCustomField: vi.fn(),
			})

			render(TextField, { props: { name: 'test' } })
			const input = screen.getByRole('textbox')
			await fireEvent.input(input, { target: { value: 'new' } })

			expect(updateField).toHaveBeenCalledWith('test', 'new')
		})

		it('calls touchField on blur when form context is present', async () => {
			const touchField = vi.fn()
			vi.mocked(getFormContextOptional).mockReturnValue({
				values: { test: '' },
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
				touchField,
				reset: vi.fn(),
				submit: vi.fn(),
				updateCustomField: vi.fn(),
				touchCustomField: vi.fn(),
				validateCustomField: vi.fn(),
			})

			render(TextField, { props: { name: 'test' } })
			await fireEvent.blur(screen.getByRole('textbox'))

			expect(touchField).toHaveBeenCalledWith('test')
		})

		it('is disabled when form context is locked', () => {
			vi.mocked(getFormContextOptional).mockReturnValue({
				values: { test: '' },
				errors: {},
				touched: {},
				isValid: true,
				isDirty: false,
				inflight: false,
				locked: true,
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
			})

			render(TextField, { props: { name: 'test' } })
			expect(screen.getByRole('textbox')).toBeDisabled()
		})

		it('shows error from form context', () => {
			vi.mocked(getFormContextOptional).mockReturnValue({
				values: { test: '' },
				errors: { test: 'Context error' },
				touched: {},
				isValid: false,
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
			})

			render(TextField, { props: { name: 'test' } })
			expect(screen.getByText('Context error')).toBeInTheDocument()
		})

		it('prefers explicit error prop over form context error', () => {
			vi.mocked(getFormContextOptional).mockReturnValue({
				values: { test: '' },
				errors: { test: 'Context error' },
				touched: {},
				isValid: false,
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
			})

			render(TextField, { props: { name: 'test', error: 'Prop error' } })
			expect(screen.getByText('Prop error')).toBeInTheDocument()
			expect(screen.queryByText('Context error')).not.toBeInTheDocument()
		})

		it('re-validates on input when field has existing error', async () => {
			const validateField = vi.fn()
			vi.mocked(getFormContextOptional).mockReturnValue({
				values: { test: '' },
				errors: { test: 'Required' },
				touched: {},
				isValid: false,
				isDirty: false,
				inflight: false,
				locked: false,
				errorMessage: null,
				customFieldValues: {},
				customFieldErrors: {},
				customFieldTouched: {},
				updateField: vi.fn(),
				validateField,
				touchField: vi.fn(),
				reset: vi.fn(),
				submit: vi.fn(),
				updateCustomField: vi.fn(),
				touchCustomField: vi.fn(),
				validateCustomField: vi.fn(),
			})

			render(TextField, { props: { name: 'test' } })
			await fireEvent.input(screen.getByRole('textbox'), { target: { value: 'a' } })

			expect(validateField).toHaveBeenCalledWith('test')
		})

		it('hides field when resourceConfig marks it not visible', () => {
			vi.mocked(getFormContextOptional).mockReturnValue({
				values: { test: '' },
				errors: {},
				touched: {},
				isValid: true,
				isDirty: false,
				inflight: false,
				locked: false,
				errorMessage: null,
				resourceConfig: { fields: { test: { visible: false } }, custom_fields: [] },
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
			})

			render(TextField, { props: { name: 'test' } })
			expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
		})
	})
})
