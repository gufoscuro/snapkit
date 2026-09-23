import { describe, expect, it } from 'vitest'
import {
  fieldBoxSizingClasses,
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

// =============================================================================
// FIELD BOX SIZING CLASSES
// =============================================================================

describe('fieldBoxSizingClasses', () => {
  it('keeps width tokens, including responsive variants', () => {
    expect(fieldBoxSizingClasses(FormFieldClass.MaxWidth)).toBe('max-w-full md:max-w-md')
    expect(fieldBoxSizingClasses(FormFieldClass.MinWidth)).toBe('min-w-64 md:min-w-md')
    expect(fieldBoxSizingClasses('w-full min-w-0')).toBe('w-full min-w-0')
    expect(fieldBoxSizingClasses('lg:w-[500px]')).toBe('lg:w-[500px]')
    expect(fieldBoxSizingClasses('flex-1 basis-40')).toBe('flex-1 basis-40')
  })

  it('drops input styling, so a mixed class keeps its look on the input', () => {
    // TableCell mixes sizing with borders/height: only `w-full` belongs to the box.
    expect(fieldBoxSizingClasses(FormFieldClass.TableCell)).toBe('w-full')
    expect(fieldBoxSizingClasses('h-10 rounded-none border-transparent')).toBe('')
  })

  it('is not fooled by variants or by tokens that merely start with the letters', () => {
    expect(fieldBoxSizingClasses('focus-visible:ring-0 focus:border-primary')).toBe('')
    expect(fieldBoxSizingClasses('whitespace-nowrap wrap-anywhere')).toBe('')
  })

  it('merges several sources and tolerates undefined / empty input', () => {
    expect(fieldBoxSizingClasses('min-w-64', undefined, FormFieldClass.TableCell)).toBe('min-w-64 w-full')
    expect(fieldBoxSizingClasses(undefined, '')).toBe('')
    expect(fieldBoxSizingClasses()).toBe('')
  })
})
