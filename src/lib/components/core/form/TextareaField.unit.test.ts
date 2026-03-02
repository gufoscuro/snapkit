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

import TextareaField from './TextareaField.svelte'
import { getFormContextOptional } from './form-context'

describe('TextareaField', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		vi.mocked(getFormContextOptional).mockReturnValue(null)
	})

	afterEach(() => cleanup())

	describe('rendering', () => {
		it('renders a textarea element', () => {
			render(TextareaField, { props: { name: 'notes' } })
			expect(screen.getByRole('textbox')).toBeInTheDocument()
		})

		it('renders with correct name', () => {
			render(TextareaField, { props: { name: 'notes' } })
			expect(screen.getByRole('textbox')).toHaveAttribute('name', 'notes')
		})

		it('renders label text', () => {
			render(TextareaField, { props: { name: 'notes', label: 'Notes' } })
			expect(screen.getByText('Notes')).toBeInTheDocument()
		})

		it('hides label visually when showLabel is false', () => {
			render(TextareaField, { props: { name: 'notes', label: 'Notes', showLabel: false } })
			const label = screen.getByText('Notes')
			expect(label.className).toContain('sr-only')
		})

		it('renders placeholder text', () => {
			render(TextareaField, { props: { name: 'notes', placeholder: 'Write notes...' } })
			expect(screen.getByPlaceholderText('Write notes...')).toBeInTheDocument()
		})
	})

	describe('disabled state', () => {
		it('is not disabled by default', () => {
			render(TextareaField, { props: { name: 'notes' } })
			expect(screen.getByRole('textbox')).not.toBeDisabled()
		})

		it('is disabled when disabled prop is true', () => {
			render(TextareaField, { props: { name: 'notes', disabled: true } })
			expect(screen.getByRole('textbox')).toBeDisabled()
		})
	})

	describe('hidden state', () => {
		it('renders by default', () => {
			render(TextareaField, { props: { name: 'notes' } })
			expect(screen.getByRole('textbox')).toBeInTheDocument()
		})

		it('does not render when hidden', () => {
			render(TextareaField, { props: { name: 'notes', hidden: true } })
			expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
		})
	})

	describe('error display', () => {
		it('shows error message', () => {
			render(TextareaField, { props: { name: 'notes', error: 'Required field' } })
			expect(screen.getByText('Required field')).toBeInTheDocument()
		})

		it('sets aria-invalid when error is present', () => {
			render(TextareaField, { props: { name: 'notes', error: 'Required' } })
			expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
		})
	})

	describe('standalone event handlers', () => {
		it('calls oninput handler', async () => {
			const oninput = vi.fn()
			render(TextareaField, { props: { name: 'notes', oninput } })
			await fireEvent.input(screen.getByRole('textbox'), { target: { value: 'text' } })
			expect(oninput).toHaveBeenCalledOnce()
		})

		it('calls onblur handler', async () => {
			const onblur = vi.fn()
			render(TextareaField, { props: { name: 'notes', onblur } })
			await fireEvent.blur(screen.getByRole('textbox'))
			expect(onblur).toHaveBeenCalledOnce()
		})
	})

	describe('form context autowiring', () => {
		function mockFormContext(overrides: Record<string, unknown> = {}) {
			const ctx = {
				values: { notes: '' },
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
			mockFormContext({ values: { notes: 'from context' } })
			render(TextareaField, { props: { name: 'notes' } })
			expect(screen.getByRole('textbox')).toHaveValue('from context')
		})

		it('calls updateField on input', async () => {
			const ctx = mockFormContext()
			render(TextareaField, { props: { name: 'notes' } })
			await fireEvent.input(screen.getByRole('textbox'), { target: { value: 'new' } })
			expect(ctx.updateField).toHaveBeenCalledWith('notes', 'new')
		})

		it('calls touchField on blur', async () => {
			const ctx = mockFormContext()
			render(TextareaField, { props: { name: 'notes' } })
			await fireEvent.blur(screen.getByRole('textbox'))
			expect(ctx.touchField).toHaveBeenCalledWith('notes')
		})

		it('re-validates on input when field has existing error', async () => {
			const ctx = mockFormContext({ errors: { notes: 'Required' } })
			render(TextareaField, { props: { name: 'notes' } })
			await fireEvent.input(screen.getByRole('textbox'), { target: { value: 'a' } })
			expect(ctx.validateField).toHaveBeenCalledWith('notes')
		})

		it('is disabled when form context is locked', () => {
			mockFormContext({ locked: true })
			render(TextareaField, { props: { name: 'notes' } })
			expect(screen.getByRole('textbox')).toBeDisabled()
		})

		it('shows error from form context', () => {
			mockFormContext({ errors: { notes: 'Context error' } })
			render(TextareaField, { props: { name: 'notes' } })
			expect(screen.getByText('Context error')).toBeInTheDocument()
		})

		it('prefers explicit error prop over context error', () => {
			mockFormContext({ errors: { notes: 'Context error' } })
			render(TextareaField, { props: { name: 'notes', error: 'Prop error' } })
			expect(screen.getByText('Prop error')).toBeInTheDocument()
			expect(screen.queryByText('Context error')).not.toBeInTheDocument()
		})

		it('hides when resourceConfig marks field not visible', () => {
			mockFormContext({
				resourceConfig: { fields: { notes: { visible: false } }, custom_fields: [] },
			})
			render(TextareaField, { props: { name: 'notes' } })
			expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
		})
	})
})
