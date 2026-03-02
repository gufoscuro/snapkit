import { render, screen, fireEvent, cleanup } from '@testing-library/svelte'
import { describe, expect, it, vi, afterEach, beforeEach } from 'vitest'

vi.mock('./form-context', () => ({
	getFormContextOptional: vi.fn(() => null),
}))
vi.mock('$lib/paraglide/messages', () => ({
	active: () => 'Active',
}))

import SwitchField from './SwitchField.svelte'
import { getFormContextOptional } from './form-context'

describe('SwitchField', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		vi.mocked(getFormContextOptional).mockReturnValue(null)
	})

	afterEach(() => cleanup())

	describe('rendering', () => {
		it('renders a switch element', () => {
			render(SwitchField, { props: {} })
			expect(screen.getByRole('switch')).toBeInTheDocument()
		})

		it('renders default label from i18n', () => {
			render(SwitchField, { props: {} })
			expect(screen.getByText('Active')).toBeInTheDocument()
		})

		it('renders custom label', () => {
			render(SwitchField, { props: { label: 'Enable feature' } })
			expect(screen.getByText('Enable feature')).toBeInTheDocument()
		})

		it('hides label visually when showLabel is false', () => {
			render(SwitchField, { props: { label: 'Hidden', showLabel: false } })
			const label = screen.getByText('Hidden')
			expect(label.className).toContain('sr-only')
		})
	})

	describe('checked state', () => {
		it('is unchecked by default', () => {
			render(SwitchField, { props: {} })
			expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false')
		})

		it('is checked when checked prop is true', () => {
			render(SwitchField, { props: { checked: true } })
			expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true')
		})
	})

	describe('disabled state', () => {
		it('is not disabled by default', () => {
			render(SwitchField, { props: {} })
			expect(screen.getByRole('switch')).not.toBeDisabled()
		})

		it('is disabled when disabled prop is true', () => {
			render(SwitchField, { props: { disabled: true } })
			expect(screen.getByRole('switch')).toBeDisabled()
		})
	})

	describe('hidden state', () => {
		it('renders by default', () => {
			render(SwitchField, { props: {} })
			expect(screen.getByRole('switch')).toBeInTheDocument()
		})

		it('does not render when hidden is true', () => {
			render(SwitchField, { props: { hidden: true } })
			expect(screen.queryByRole('switch')).not.toBeInTheDocument()
		})
	})

	describe('standalone onChange', () => {
		it('calls onChange callback when toggled', async () => {
			const onChange = vi.fn()
			render(SwitchField, { props: { onChange } })
			await fireEvent.click(screen.getByRole('switch'))
			expect(onChange).toHaveBeenCalledWith(true)
		})
	})

	describe('form context autowiring', () => {
		function mockFormContext(overrides: Record<string, unknown> = {}) {
			const ctx = {
				values: { active: false },
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

		it('reads checked from form context', () => {
			mockFormContext({ values: { active: true } })
			render(SwitchField, { props: {} })
			expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true')
		})

		it('calls updateField when toggled with form context', async () => {
			const ctx = mockFormContext({ values: { active: false } })
			render(SwitchField, { props: {} })
			await fireEvent.click(screen.getByRole('switch'))
			expect(ctx.updateField).toHaveBeenCalledWith('active', true)
		})

		it('is disabled when form context is locked', () => {
			mockFormContext({ locked: true })
			render(SwitchField, { props: {} })
			expect(screen.getByRole('switch')).toBeDisabled()
		})

		it('hides when resourceConfig marks field not visible', () => {
			mockFormContext({
				resourceConfig: { fields: { active: { visible: false } }, custom_fields: [] },
			})
			render(SwitchField, { props: {} })
			expect(screen.queryByRole('switch')).not.toBeInTheDocument()
		})
	})
})
