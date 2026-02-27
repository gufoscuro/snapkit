import { describe, expect, it } from 'vitest'
import { createPhoneRenderer } from './phone-renderer'
import type { ColumnConfig } from '../types'

type TestRow = { phones: Array<{ phone: string }> }

function mockCellContext(value: unknown, row: TestRow = { phones: [] }) {
  return {
    getValue: () => value,
    row: { original: row },
  } as any
}

describe('createPhoneRenderer', () => {
  it('returns first phone from array of objects', () => {
    const config: ColumnConfig<TestRow> = { accessorKey: 'phones', header: 'Phone', renderer: 'phone' }
    const render = createPhoneRenderer(config)
    const phones = [{ phone: '+39 123456789' }, { phone: '+39 987654321' }]
    expect(render(mockCellContext(phones, { phones }))).toBe('+39 123456789')
  })

  it('returns first phone from array of strings', () => {
    const config: ColumnConfig<TestRow> = { accessorKey: 'phones', header: 'Phone', renderer: 'phone' }
    const render = createPhoneRenderer(config)
    expect(render(mockCellContext(['+1234567890']))).toBe('+1234567890')
  })

  it('returns "-" for null value', () => {
    const config: ColumnConfig<TestRow> = { accessorKey: 'phones', header: 'Phone', renderer: 'phone' }
    const render = createPhoneRenderer(config)
    expect(render(mockCellContext(null))).toBe('-')
  })

  it('returns "-" for empty array', () => {
    const config: ColumnConfig<TestRow> = { accessorKey: 'phones', header: 'Phone', renderer: 'phone' }
    const render = createPhoneRenderer(config)
    expect(render(mockCellContext([]))).toBe('-')
  })

  it('returns "-" for non-array value', () => {
    const config: ColumnConfig<TestRow> = { accessorKey: 'phones', header: 'Phone', renderer: 'phone' }
    const render = createPhoneRenderer(config)
    expect(render(mockCellContext('not-an-array'))).toBe('-')
  })

  it('returns "-" when first phone object has empty phone', () => {
    const config: ColumnConfig<TestRow> = { accessorKey: 'phones', header: 'Phone', renderer: 'phone' }
    const render = createPhoneRenderer(config)
    expect(render(mockCellContext([{ phone: '' }]))).toBe('-')
  })

  it('returns "-" for object without phone property', () => {
    const config: ColumnConfig<TestRow> = { accessorKey: 'phones', header: 'Phone', renderer: 'phone' }
    const render = createPhoneRenderer(config)
    expect(render(mockCellContext([{ name: 'test' }]))).toBe('-')
  })

  it('uses custom accessor when provided', () => {
    const config: ColumnConfig<TestRow> = {
      accessorKey: 'phones',
      header: 'Phone',
      renderer: 'phone',
      rendererConfig: {
        accessor: (row: TestRow) => row.phones,
      },
    }
    const render = createPhoneRenderer(config)
    const row: TestRow = { phones: [{ phone: '+39 000000' }] }
    expect(render(mockCellContext(null, row))).toBe('+39 000000')
  })
})
