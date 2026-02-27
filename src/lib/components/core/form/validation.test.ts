import { describe, expect, it, vi } from 'vitest'

vi.mock('$lib/paraglide/messages', () => ({
  validation_required: ({ field }: { field: string }) => `${field} is required`,
  validation_required_generic: () => 'This field is required',
  validation_min: ({ field, min }: { field: string; min: string }) =>
    `${field} must be at least ${min}`,
  validation_max: ({ field, max }: { field: string; max: string }) =>
    `${field} must be at most ${max}`,
  validation_min_length: ({ field, min }: { field: string; min: string }) =>
    `${field} must be at least ${min} characters`,
  validation_max_length: ({ field, max }: { field: string; max: string }) =>
    `${field} must be at most ${max} characters`,
  validation_email: () => 'Invalid email address',
  validation_pattern: () => 'Invalid format',
}))

// Import after mocks
const { v } = await import('./validation')

type TestForm = {
  name: string
  email: string
  age: number
  password: string
  confirmPassword: string
  tags: string[]
}

// =============================================================================
// REQUIRED VALIDATOR
// =============================================================================

describe('v.required', () => {
  const validator = v.required<TestForm>()

  it('returns error for null', () => {
    expect(validator(null as any, {} as TestForm)).toBe('This field is required')
  })

  it('returns error for undefined', () => {
    expect(validator(undefined as any, {} as TestForm)).toBe('This field is required')
  })

  it('returns error for empty string', () => {
    expect(validator('' as any, {} as TestForm)).toBe('This field is required')
  })

  it('returns error for whitespace-only string', () => {
    expect(validator('   ' as any, {} as TestForm)).toBe('This field is required')
  })

  it('returns error for empty array', () => {
    expect(validator([] as any, {} as TestForm)).toBe('This field is required')
  })

  it('returns undefined for non-empty string', () => {
    expect(validator('hello' as any, {} as TestForm)).toBeUndefined()
  })

  it('returns undefined for number zero', () => {
    expect(validator(0 as any, {} as TestForm)).toBeUndefined()
  })

  it('returns undefined for false', () => {
    expect(validator(false as any, {} as TestForm)).toBeUndefined()
  })

  it('uses custom message when provided', () => {
    const custom = v.required<TestForm>({ message: 'Please fill this in' })
    expect(custom(null as any, {} as TestForm)).toBe('Please fill this in')
  })

  it('uses field-specific message when field option provided', () => {
    const custom = v.required<TestForm>({ field: 'Name' })
    expect(custom(null as any, {} as TestForm)).toBe('Name is required')
  })
})

// =============================================================================
// MIN VALIDATOR
// =============================================================================

describe('v.min', () => {
  const validator = v.min<TestForm>(5)

  it('returns undefined for empty values (skip validation)', () => {
    expect(validator(null as any, {} as TestForm)).toBeUndefined()
    expect(validator(undefined as any, {} as TestForm)).toBeUndefined()
    expect(validator('' as any, {} as TestForm)).toBeUndefined()
  })

  it('returns error when number is below minimum', () => {
    expect(validator(3 as any, {} as TestForm)).toBeDefined()
  })

  it('returns undefined when number equals minimum', () => {
    expect(validator(5 as any, {} as TestForm)).toBeUndefined()
  })

  it('returns undefined when number exceeds minimum', () => {
    expect(validator(10 as any, {} as TestForm)).toBeUndefined()
  })

  it('handles string numbers', () => {
    expect(validator('3' as any, {} as TestForm)).toBeDefined()
    expect(validator('10' as any, {} as TestForm)).toBeUndefined()
  })

  it('returns error for non-numeric strings', () => {
    expect(validator('abc' as any, {} as TestForm)).toBeDefined()
  })

  it('uses custom message', () => {
    const custom = v.min<TestForm>(5, { message: 'Too low!' })
    expect(custom(3 as any, {} as TestForm)).toBe('Too low!')
  })
})

// =============================================================================
// MAX VALIDATOR
// =============================================================================

describe('v.max', () => {
  const validator = v.max<TestForm>(100)

  it('returns undefined for empty values', () => {
    expect(validator(null as any, {} as TestForm)).toBeUndefined()
  })

  it('returns error when number exceeds maximum', () => {
    expect(validator(150 as any, {} as TestForm)).toBeDefined()
  })

  it('returns undefined when number equals maximum', () => {
    expect(validator(100 as any, {} as TestForm)).toBeUndefined()
  })

  it('returns undefined when number is below maximum', () => {
    expect(validator(50 as any, {} as TestForm)).toBeUndefined()
  })

  it('uses custom message', () => {
    const custom = v.max<TestForm>(100, { message: 'Too high!' })
    expect(custom(150 as any, {} as TestForm)).toBe('Too high!')
  })
})

// =============================================================================
// MIN LENGTH VALIDATOR
// =============================================================================

describe('v.minLength', () => {
  const validator = v.minLength<TestForm>(3)

  it('returns undefined for empty values', () => {
    expect(validator(null as any, {} as TestForm)).toBeUndefined()
  })

  it('returns error when string is too short', () => {
    expect(validator('ab' as any, {} as TestForm)).toBeDefined()
  })

  it('returns undefined when string meets minimum length', () => {
    expect(validator('abc' as any, {} as TestForm)).toBeUndefined()
  })

  it('returns undefined when string exceeds minimum length', () => {
    expect(validator('abcdef' as any, {} as TestForm)).toBeUndefined()
  })

  it('uses custom message', () => {
    const custom = v.minLength<TestForm>(3, { message: 'Too short!' })
    expect(custom('ab' as any, {} as TestForm)).toBe('Too short!')
  })
})

// =============================================================================
// MAX LENGTH VALIDATOR
// =============================================================================

describe('v.maxLength', () => {
  const validator = v.maxLength<TestForm>(5)

  it('returns undefined for empty values', () => {
    expect(validator(null as any, {} as TestForm)).toBeUndefined()
  })

  it('returns error when string exceeds maximum length', () => {
    expect(validator('toolong' as any, {} as TestForm)).toBeDefined()
  })

  it('returns undefined when string meets maximum length', () => {
    expect(validator('hello' as any, {} as TestForm)).toBeUndefined()
  })

  it('returns undefined when string is shorter than maximum', () => {
    expect(validator('hi' as any, {} as TestForm)).toBeUndefined()
  })

  it('uses custom message', () => {
    const custom = v.maxLength<TestForm>(5, { message: 'Too long!' })
    expect(custom('toolong' as any, {} as TestForm)).toBe('Too long!')
  })
})

// =============================================================================
// EMAIL VALIDATOR
// =============================================================================

describe('v.email', () => {
  const validator = v.email<TestForm>()

  it('returns undefined for empty values', () => {
    expect(validator(null as any, {} as TestForm)).toBeUndefined()
    expect(validator('' as any, {} as TestForm)).toBeUndefined()
  })

  it('returns undefined for valid email', () => {
    expect(validator('test@example.com' as any, {} as TestForm)).toBeUndefined()
  })

  it('returns error for invalid email without @', () => {
    expect(validator('invalid' as any, {} as TestForm)).toBe('Invalid email address')
  })

  it('returns error for invalid email without domain', () => {
    expect(validator('test@' as any, {} as TestForm)).toBe('Invalid email address')
  })

  it('returns error for invalid email without TLD', () => {
    expect(validator('test@example' as any, {} as TestForm)).toBe('Invalid email address')
  })

  it('uses custom message', () => {
    const custom = v.email<TestForm>({ message: 'Bad email!' })
    expect(custom('invalid' as any, {} as TestForm)).toBe('Bad email!')
  })
})

// =============================================================================
// PATTERN VALIDATOR
// =============================================================================

describe('v.pattern', () => {
  const validator = v.pattern<TestForm>(/^[A-Z]+$/)

  it('returns undefined for empty values', () => {
    expect(validator(null as any, {} as TestForm)).toBeUndefined()
  })

  it('returns undefined when pattern matches', () => {
    expect(validator('ABC' as any, {} as TestForm)).toBeUndefined()
  })

  it('returns error when pattern does not match', () => {
    expect(validator('abc' as any, {} as TestForm)).toBe('Invalid format')
  })

  it('uses custom message', () => {
    const custom = v.pattern<TestForm>(/^[A-Z]+$/, { message: 'Uppercase only!' })
    expect(custom('abc' as any, {} as TestForm)).toBe('Uppercase only!')
  })
})

// =============================================================================
// CUSTOM VALIDATOR
// =============================================================================

describe('v.custom', () => {
  it('returns undefined when function returns true', () => {
    const validator = v.custom<TestForm>(
      (value) => (value as unknown as number) > 0,
      { message: 'Must be positive' },
    )
    expect(validator(5 as any, {} as TestForm)).toBeUndefined()
  })

  it('returns message when function returns false', () => {
    const validator = v.custom<TestForm>(
      (value) => (value as unknown as number) > 0,
      { message: 'Must be positive' },
    )
    expect(validator(-1 as any, {} as TestForm)).toBe('Must be positive')
  })

  it('receives full values object for cross-field validation', () => {
    const validator = v.custom<TestForm>(
      (_value, values) => values.password === values.confirmPassword,
      { message: 'Passwords must match' },
    )
    const values = { password: 'abc', confirmPassword: 'xyz' } as TestForm
    expect(validator(values.confirmPassword as any, values)).toBe('Passwords must match')
  })
})

// =============================================================================
// SCHEMA BUILDER
// =============================================================================

describe('v.schema', () => {
  it('builds a validate function that returns errors for invalid fields', () => {
    const validate = v
      .schema<TestForm>({
        name: [v.required()],
        email: [v.required(), v.email()],
      })
      .build()

    const errors = validate({ name: '', email: 'bad' } as TestForm)
    expect(errors.name).toBe('This field is required')
    expect(errors.email).toBe('Invalid email address')
  })

  it('returns empty object when all fields are valid', () => {
    const validate = v
      .schema<TestForm>({
        name: [v.required()],
        email: [v.required(), v.email()],
      })
      .build()

    const errors = validate({ name: 'John', email: 'john@example.com' } as TestForm)
    expect(Object.keys(errors)).toHaveLength(0)
  })

  it('stops at first error per field', () => {
    const validate = v
      .schema<TestForm>({
        email: [v.required(), v.email()],
      })
      .build()

    const errors = validate({ email: '' } as TestForm)
    // required fires first, email validator never runs
    expect(errors.email).toBe('This field is required')
  })

  it('supports refine for cross-field validation', () => {
    const validate = v
      .schema<TestForm>({
        password: [v.required()],
        confirmPassword: [v.required()],
      })
      .refine((values) => {
        if (values.password !== values.confirmPassword) {
          return { confirmPassword: 'Passwords must match' }
        }
      })
      .build()

    const errors = validate({
      password: 'abc',
      confirmPassword: 'xyz',
    } as TestForm)

    expect(errors.confirmPassword).toBe('Passwords must match')
  })

  it('refine errors merge with field errors', () => {
    const validate = v
      .schema<TestForm>({
        name: [v.required()],
      })
      .refine((values) => {
        if (values.password !== values.confirmPassword) {
          return { confirmPassword: 'Passwords must match' }
        }
      })
      .build()

    const errors = validate({
      name: '',
      password: 'abc',
      confirmPassword: 'xyz',
    } as TestForm)

    expect(errors.name).toBe('This field is required')
    expect(errors.confirmPassword).toBe('Passwords must match')
  })

  it('supports multiple chained refines', () => {
    const validate = v
      .schema<TestForm>({})
      .refine((values) => {
        if (!values.name) return { name: 'Name needed' }
      })
      .refine((values) => {
        if (!values.email) return { email: 'Email needed' }
      })
      .build()

    const errors = validate({ name: '', email: '' } as TestForm)
    expect(errors.name).toBe('Name needed')
    expect(errors.email).toBe('Email needed')
  })
})
