import { describe, expect, it } from 'vitest'
import {
  FormFieldClass,
  FormLabelClass,
  EditableTableFieldClass,
  BaseFieldDefaults,
  InputFieldDefaults,
  TextareaFieldDefaults,
  SelectorFieldDefaults,
  SwitchFieldDefaults,
  EntitySelectorDefaults,
} from './form'

// =============================================================================
// FORM FIELD CLASS CONSTANTS
// =============================================================================

describe('FormFieldClass', () => {
  it('is frozen (immutable)', () => {
    expect(Object.isFrozen(FormFieldClass)).toBe(true)
  })

  it('has all expected keys', () => {
    expect(FormFieldClass).toHaveProperty('MinWidth')
    expect(FormFieldClass).toHaveProperty('MaxWidth')
    expect(FormFieldClass).toHaveProperty('TableCell')
    expect(FormFieldClass).toHaveProperty('SelectorDefaultWidth')
    expect(FormFieldClass).toHaveProperty('SelectorContentDefaultWidth')
    expect(FormFieldClass).toHaveProperty('SelectorTableCellWidth')
    expect(FormFieldClass).toHaveProperty('SelectorContentTableCellWidth')
  })

  it('contains Tailwind class strings', () => {
    expect(FormFieldClass.MinWidth).toContain('min-w-')
    expect(FormFieldClass.MaxWidth).toContain('max-w-')
    expect(FormFieldClass.TableCell).toContain('focus:border-primary')
  })
})

describe('FormLabelClass', () => {
  it('is a non-empty string', () => {
    expect(typeof FormLabelClass).toBe('string')
    expect(FormLabelClass.length).toBeGreaterThan(0)
  })
})

describe('EditableTableFieldClass', () => {
  it('is frozen (immutable)', () => {
    expect(Object.isFrozen(EditableTableFieldClass)).toBe(true)
  })

  it('has all expected keys', () => {
    expect(EditableTableFieldClass).toHaveProperty('Body')
    expect(EditableTableFieldClass).toHaveProperty('TableHeadCell')
    expect(EditableTableFieldClass).toHaveProperty('TableCell')
  })
})

// =============================================================================
// DEFAULT VALUES
// =============================================================================

describe('BaseFieldDefaults', () => {
  it('has correct default values', () => {
    expect(BaseFieldDefaults.label).toBe('')
    expect(BaseFieldDefaults.placeholder).toBeUndefined()
    expect(BaseFieldDefaults.errorPosition).toBe('bottom')
    expect(BaseFieldDefaults.warningPosition).toBe('bottom')
    expect(BaseFieldDefaults.showLabel).toBe(true)
    expect(BaseFieldDefaults.showErrorMessage).toBe(true)
    expect(BaseFieldDefaults.disabled).toBe(false)
    expect(BaseFieldDefaults.width).toBe(FormFieldClass.MinWidth)
  })
})

describe('InputFieldDefaults', () => {
  it('extends BaseFieldDefaults', () => {
    expect(InputFieldDefaults.label).toBe(BaseFieldDefaults.label)
    expect(InputFieldDefaults.disabled).toBe(BaseFieldDefaults.disabled)
  })

  it('has input-specific defaults', () => {
    expect(InputFieldDefaults.focus).toBe(false)
    expect(InputFieldDefaults.autoWidth).toBe(false)
  })
})

describe('TextareaFieldDefaults', () => {
  it('extends BaseFieldDefaults', () => {
    expect(TextareaFieldDefaults.label).toBe(BaseFieldDefaults.label)
  })

  it('has textarea-specific defaults', () => {
    expect(TextareaFieldDefaults.focus).toBe(false)
    expect(TextareaFieldDefaults.rows).toBe(3)
  })
})

describe('SelectorFieldDefaults', () => {
  it('extends BaseFieldDefaults', () => {
    expect(SelectorFieldDefaults.showLabel).toBe(BaseFieldDefaults.showLabel)
  })

  it('has selector-specific defaults', () => {
    expect(SelectorFieldDefaults.width).toBe(FormFieldClass.SelectorDefaultWidth)
    expect(SelectorFieldDefaults.contentWidth).toBe(FormFieldClass.SelectorContentDefaultWidth)
    expect(SelectorFieldDefaults.align).toBe('end')
    expect(SelectorFieldDefaults.allowClear).toBe(false)
  })
})

describe('SwitchFieldDefaults', () => {
  it('has correct defaults', () => {
    expect(SwitchFieldDefaults.label).toBe('')
    expect(SwitchFieldDefaults.disabled).toBe(false)
    expect(SwitchFieldDefaults.showLabel).toBe(true)
    expect(SwitchFieldDefaults.labelPosition).toBe('right')
    expect(SwitchFieldDefaults.labelClass).toBe('')
  })
})

describe('EntitySelectorDefaults', () => {
  it('has correct defaults', () => {
    expect(EntitySelectorDefaults.label).toBe('')
    expect(EntitySelectorDefaults.placeholder).toBe('')
    expect(EntitySelectorDefaults.readonly).toBe(false)
    expect(EntitySelectorDefaults.disabled).toBe(false)
    expect(EntitySelectorDefaults.allowNewRecord).toBe(false)
    expect(EntitySelectorDefaults.align).toBe('end')
    expect(EntitySelectorDefaults.width).toBe(FormFieldClass.SelectorDefaultWidth)
  })
})
