import { describe, expect, it } from 'vitest'
import { createTextRenderer } from './text-renderer'
import type { ColumnConfig } from '../types'

type TestRow = { name: string; supplier_attr?: { name: string } }

function mockCellContext(value: unknown, row: TestRow) {
  return {
    getValue: () => value,
    row: { original: row },
  } as any
}

describe('createTextRenderer', () => {
  it('returns cell value as string', () => {
    const config: ColumnConfig<TestRow> = { accessorKey: 'name', header: 'Name', renderer: 'text' }
    const render = createTextRenderer(config)
    expect(render(mockCellContext('Acme Corp', { name: 'Acme Corp' }))).toBe('Acme Corp')
  })

  it('returns "-" for null value', () => {
    const config: ColumnConfig<TestRow> = { accessorKey: 'name', header: 'Name', renderer: 'text' }
    const render = createTextRenderer(config)
    expect(render(mockCellContext(null, { name: '' }))).toBe('-')
  })

  it('returns "-" for undefined value', () => {
    const config: ColumnConfig<TestRow> = { accessorKey: 'name', header: 'Name', renderer: 'text' }
    const render = createTextRenderer(config)
    expect(render(mockCellContext(undefined, { name: '' }))).toBe('-')
  })

  it('returns "-" for empty string', () => {
    const config: ColumnConfig<TestRow> = { accessorKey: 'name', header: 'Name', renderer: 'text' }
    const render = createTextRenderer(config)
    expect(render(mockCellContext('', { name: '' }))).toBe('-')
  })

  it('converts numbers to string', () => {
    const config: ColumnConfig<TestRow> = { accessorKey: 'name', header: 'Count', renderer: 'text' }
    const render = createTextRenderer(config)
    expect(render(mockCellContext(42, { name: '' }))).toBe('42')
  })

  it('uses valueAccessor when provided', () => {
    const config: ColumnConfig<TestRow> = {
      accessorKey: 'supplier_attr',
      header: 'Supplier',
      renderer: 'text',
      rendererConfig: {
        valueAccessor: (row: TestRow) => row.supplier_attr?.name,
      },
    }
    const render = createTextRenderer(config)
    const row: TestRow = { name: 'Test', supplier_attr: { name: 'Supplier A' } }
    expect(render(mockCellContext(row.supplier_attr, row))).toBe('Supplier A')
  })

  it('returns "-" when valueAccessor returns undefined', () => {
    const config: ColumnConfig<TestRow> = {
      accessorKey: 'supplier_attr',
      header: 'Supplier',
      renderer: 'text',
      rendererConfig: {
        valueAccessor: (row: TestRow) => row.supplier_attr?.name,
      },
    }
    const render = createTextRenderer(config)
    const row: TestRow = { name: 'Test' }
    expect(render(mockCellContext(undefined, row))).toBe('-')
  })
})
