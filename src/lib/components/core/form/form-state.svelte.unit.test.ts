import { describe, expect, it, vi } from 'vitest'
import { flushSync } from 'svelte'

vi.mock('$utils/json', () => ({
  stringifyJSON: (v: unknown) => JSON.stringify(v),
}))

import { createFormState } from './form-state.svelte'

type TestForm = {
  name: string
  email: string
  age: number
}

function makeConfig(
  initial: TestForm,
  validate?: (values: TestForm) => Partial<Record<keyof TestForm, string>>,
) {
  return {
    getInitialValues: () => initial,
    getValidate: validate ? () => validate : undefined,
  }
}

describe('createFormState', () => {
  describe('initial state', () => {
    it('has initial values', () => {
      const state = createFormState(makeConfig({ name: 'John', email: 'john@test.com', age: 30 }))
      expect(state.values).toEqual({ name: 'John', email: 'john@test.com', age: 30 })
    })

    it('starts with no errors', () => {
      const state = createFormState(makeConfig({ name: '', email: '', age: 0 }))
      expect(state.errors).toEqual({})
    })

    it('starts with no touched fields', () => {
      const state = createFormState(makeConfig({ name: '', email: '', age: 0 }))
      expect(state.touched).toEqual({})
    })

    it('is valid initially (no validation run)', () => {
      const state = createFormState(makeConfig({ name: '', email: '', age: 0 }))
      expect(state.isValid).toBe(true)
    })

    it('is not dirty initially', () => {
      const state = createFormState(makeConfig({ name: 'John', email: '', age: 0 }))
      expect(state.isDirty).toBe(false)
    })
  })

  describe('updateField', () => {
    it('updates a field value', () => {
      const state = createFormState(makeConfig({ name: '', email: '', age: 0 }))
      flushSync(() => {
        state.updateField('name', 'Alice')
      })
      expect(state.values.name).toBe('Alice')
    })

    it('makes form dirty after update', () => {
      const state = createFormState(makeConfig({ name: '', email: '', age: 0 }))
      flushSync(() => {
        state.updateField('name', 'Alice')
      })
      expect(state.isDirty).toBe(true)
    })

    it('returns to not dirty when value is reset to initial', () => {
      const state = createFormState(makeConfig({ name: 'John', email: '', age: 0 }))
      flushSync(() => {
        state.updateField('name', 'Alice')
      })
      expect(state.isDirty).toBe(true)
      flushSync(() => {
        state.updateField('name', 'John')
      })
      expect(state.isDirty).toBe(false)
    })
  })

  describe('touchField', () => {
    it('marks a field as touched', () => {
      const state = createFormState(makeConfig({ name: '', email: '', age: 0 }))
      flushSync(() => {
        state.touchField('name')
      })
      expect(state.touched.name).toBe(true)
    })

    it('does not affect other fields', () => {
      const state = createFormState(makeConfig({ name: '', email: '', age: 0 }))
      flushSync(() => {
        state.touchField('name')
      })
      expect(state.touched.email).toBeUndefined()
    })
  })

  describe('validate', () => {
    it('returns true when no validate function is provided', () => {
      const state = createFormState(makeConfig({ name: '', email: '', age: 0 }))
      expect(state.validate()).toBe(true)
    })

    it('returns true when all fields are valid', () => {
      const validate = (values: TestForm) => {
        const errors: Partial<Record<keyof TestForm, string>> = {}
        if (!values.name) errors.name = 'Required'
        return errors
      }
      const state = createFormState(makeConfig({ name: 'John', email: '', age: 0 }, validate))
      expect(state.validate()).toBe(true)
    })

    it('returns false and sets errors when validation fails', () => {
      const validate = (values: TestForm) => {
        const errors: Partial<Record<keyof TestForm, string>> = {}
        if (!values.name) errors.name = 'Required'
        return errors
      }
      const state = createFormState(makeConfig({ name: '', email: '', age: 0 }, validate))

      let result: boolean
      flushSync(() => {
        result = state.validate()
      })

      expect(result!).toBe(false)
      expect(state.errors.name).toBe('Required')
      expect(state.isValid).toBe(false)
    })
  })

  describe('validateField', () => {
    it('validates a single field', () => {
      const validate = (values: TestForm) => {
        const errors: Partial<Record<keyof TestForm, string>> = {}
        if (!values.name) errors.name = 'Required'
        if (!values.email) errors.email = 'Required'
        return errors
      }
      const state = createFormState(makeConfig({ name: '', email: '', age: 0 }, validate))

      flushSync(() => {
        state.validateField('name')
      })

      expect(state.errors.name).toBe('Required')
      // email was not validated individually
      expect(state.errors.email).toBeUndefined()
    })

    it('clears error when field becomes valid', () => {
      const validate = (values: TestForm) => {
        const errors: Partial<Record<keyof TestForm, string>> = {}
        if (!values.name) errors.name = 'Required'
        return errors
      }
      const state = createFormState(makeConfig({ name: '', email: '', age: 0 }, validate))

      flushSync(() => {
        state.validateField('name')
      })
      expect(state.errors.name).toBe('Required')

      flushSync(() => {
        state.updateField('name', 'John')
        state.validateField('name')
      })
      expect(state.errors.name).toBeUndefined()
    })

    it('does nothing without a validate function', () => {
      const state = createFormState(makeConfig({ name: '', email: '', age: 0 }))
      flushSync(() => {
        state.validateField('name')
      })
      expect(state.errors).toEqual({})
    })
  })

  describe('reset', () => {
    it('resets values to initial', () => {
      const state = createFormState(makeConfig({ name: 'John', email: 'j@t.com', age: 0 }))
      flushSync(() => {
        state.updateField('name', 'Alice')
        state.updateField('email', 'alice@test.com')
      })

      flushSync(() => {
        state.reset()
      })

      expect(state.values.name).toBe('John')
      expect(state.values.email).toBe('j@t.com')
    })

    it('clears errors', () => {
      const validate = (values: TestForm) => {
        const errors: Partial<Record<keyof TestForm, string>> = {}
        if (!values.name) errors.name = 'Required'
        return errors
      }
      const state = createFormState(makeConfig({ name: '', email: '', age: 0 }, validate))

      flushSync(() => {
        state.validate()
      })
      expect(state.errors.name).toBe('Required')

      flushSync(() => {
        state.reset()
      })
      expect(state.errors).toEqual({})
    })

    it('clears touched state', () => {
      const state = createFormState(makeConfig({ name: '', email: '', age: 0 }))
      flushSync(() => {
        state.touchField('name')
        state.touchField('email')
      })

      flushSync(() => {
        state.reset()
      })
      expect(state.touched).toEqual({})
    })

    it('makes form not dirty', () => {
      const state = createFormState(makeConfig({ name: 'John', email: '', age: 0 }))
      flushSync(() => {
        state.updateField('name', 'Alice')
      })
      expect(state.isDirty).toBe(true)

      flushSync(() => {
        state.reset()
      })
      expect(state.isDirty).toBe(false)
    })
  })

  describe('setValues', () => {
    it('replaces all values', () => {
      const state = createFormState(makeConfig({ name: 'John', email: '', age: 0 }))

      flushSync(() => {
        state.setValues({ name: 'Alice', email: 'alice@test.com', age: 25 })
      })

      expect(state.values.name).toBe('Alice')
      expect(state.values.email).toBe('alice@test.com')
      expect(state.values.age).toBe(25)
    })

    it('resets dirty state (new values become the baseline)', () => {
      const state = createFormState(makeConfig({ name: 'John', email: '', age: 0 }))

      flushSync(() => {
        state.setValues({ name: 'Alice', email: 'a@t.com', age: 25 })
      })

      expect(state.isDirty).toBe(false)
    })

    it('clears errors and touched', () => {
      const validate = (values: TestForm) => {
        const errors: Partial<Record<keyof TestForm, string>> = {}
        if (!values.name) errors.name = 'Required'
        return errors
      }
      const state = createFormState(makeConfig({ name: '', email: '', age: 0 }, validate))

      flushSync(() => {
        state.validate()
        state.touchField('name')
      })

      flushSync(() => {
        state.setValues({ name: 'New', email: 'new@t.com', age: 30 })
      })

      expect(state.errors).toEqual({})
      expect(state.touched).toEqual({})
    })
  })
})
