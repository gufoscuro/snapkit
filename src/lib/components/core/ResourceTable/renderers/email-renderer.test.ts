import { describe, expect, it } from 'vitest'
import { createEmailRenderer } from './email-renderer'
import type { ColumnConfig } from '../types'

type TestRow = { emails: Array<{ email: string }> }

function mockCellContext(value: unknown, row: TestRow = { emails: [] }) {
  return {
    getValue: () => value,
    row: { original: row },
  } as any
}

describe('createEmailRenderer', () => {
  it('returns first email from array of objects', () => {
    const config: ColumnConfig<TestRow> = { accessorKey: 'emails', header: 'Email', renderer: 'email' }
    const render = createEmailRenderer(config)
    const emails = [{ email: 'first@test.com' }, { email: 'second@test.com' }]
    expect(render(mockCellContext(emails, { emails }))).toBe('first@test.com')
  })

  it('returns first email from array of strings', () => {
    const config: ColumnConfig<TestRow> = { accessorKey: 'emails', header: 'Email', renderer: 'email' }
    const render = createEmailRenderer(config)
    const emails = ['first@test.com', 'second@test.com']
    expect(render(mockCellContext(emails, { emails: [] }))).toBe('first@test.com')
  })

  it('returns "-" for null value', () => {
    const config: ColumnConfig<TestRow> = { accessorKey: 'emails', header: 'Email', renderer: 'email' }
    const render = createEmailRenderer(config)
    expect(render(mockCellContext(null))).toBe('-')
  })

  it('returns "-" for empty array', () => {
    const config: ColumnConfig<TestRow> = { accessorKey: 'emails', header: 'Email', renderer: 'email' }
    const render = createEmailRenderer(config)
    expect(render(mockCellContext([]))).toBe('-')
  })

  it('returns "-" for non-array value', () => {
    const config: ColumnConfig<TestRow> = { accessorKey: 'emails', header: 'Email', renderer: 'email' }
    const render = createEmailRenderer(config)
    expect(render(mockCellContext('not-an-array'))).toBe('-')
  })

  it('returns "-" when first email object has empty email', () => {
    const config: ColumnConfig<TestRow> = { accessorKey: 'emails', header: 'Email', renderer: 'email' }
    const render = createEmailRenderer(config)
    expect(render(mockCellContext([{ email: '' }]))).toBe('-')
  })

  it('returns "-" for object without email property', () => {
    const config: ColumnConfig<TestRow> = { accessorKey: 'emails', header: 'Email', renderer: 'email' }
    const render = createEmailRenderer(config)
    expect(render(mockCellContext([{ name: 'test' }]))).toBe('-')
  })

  it('uses custom accessor when provided', () => {
    const config: ColumnConfig<TestRow> = {
      accessorKey: 'emails',
      header: 'Email',
      renderer: 'email',
      rendererConfig: {
        accessor: (row: TestRow) => row.emails,
      },
    }
    const render = createEmailRenderer(config)
    const row: TestRow = { emails: [{ email: 'custom@test.com' }] }
    expect(render(mockCellContext(null, row))).toBe('custom@test.com')
  })
})
