import { describe, expect, it } from 'vitest'
import { createCurrencyRenderer } from './currency-renderer'
import type { ColumnConfig } from '../types'

type TestRow = { total: number; default_currency?: string }

function mockCellContext(value: unknown, row: TestRow = { total: 0 }) {
  return {
    getValue: () => value,
    row: { original: row },
  } as any
}

describe('createCurrencyRenderer', () => {
  it('returns "-" for null value', () => {
    const config: ColumnConfig<TestRow> = { accessorKey: 'total', header: 'Total', renderer: 'currency' }
    const render = createCurrencyRenderer(config)
    expect(render(mockCellContext(null))).toBe('-')
  })

  it('returns "-" for undefined value', () => {
    const config: ColumnConfig<TestRow> = { accessorKey: 'total', header: 'Total', renderer: 'currency' }
    const render = createCurrencyRenderer(config)
    expect(render(mockCellContext(undefined))).toBe('-')
  })

  it('returns "-" for empty string', () => {
    const config: ColumnConfig<TestRow> = { accessorKey: 'total', header: 'Total', renderer: 'currency' }
    const render = createCurrencyRenderer(config)
    expect(render(mockCellContext(''))).toBe('-')
  })

  it('formats number with default EUR currency', () => {
    const config: ColumnConfig<TestRow> = { accessorKey: 'total', header: 'Total', renderer: 'currency' }
    const render = createCurrencyRenderer(config)
    const result = render(mockCellContext(1234.56))
    // EUR: comma decimal, period thousands, symbol after
    expect(result).toBe('1.234,56 €')
  })

  it('formats with custom currency from accessor', () => {
    const config: ColumnConfig<TestRow> = {
      accessorKey: 'total',
      header: 'Total',
      renderer: 'currency',
      rendererConfig: {
        currencyAccessor: (row: TestRow) => row.default_currency || 'USD',
      },
    }
    const render = createCurrencyRenderer(config)
    const row: TestRow = { total: 100, default_currency: 'USD' }
    const result = render(mockCellContext(100, row))
    // USD: period decimal, comma thousands, symbol before
    expect(result).toBe('$ 100.00')
  })

  it('handles string numeric values', () => {
    const config: ColumnConfig<TestRow> = { accessorKey: 'total', header: 'Total', renderer: 'currency' }
    const render = createCurrencyRenderer(config)
    const result = render(mockCellContext('99.99'))
    expect(result).toBe('99,99 €')
  })

  it('returns raw string for non-numeric values', () => {
    const config: ColumnConfig<TestRow> = { accessorKey: 'total', header: 'Total', renderer: 'currency' }
    const render = createCurrencyRenderer(config)
    expect(render(mockCellContext('abc'))).toBe('abc')
  })

  it('formats zero correctly', () => {
    const config: ColumnConfig<TestRow> = { accessorKey: 'total', header: 'Total', renderer: 'currency' }
    const render = createCurrencyRenderer(config)
    const result = render(mockCellContext(0))
    expect(result).toBe('0,00 €')
  })

  it('formats negative numbers', () => {
    const config: ColumnConfig<TestRow> = {
      accessorKey: 'total',
      header: 'Total',
      renderer: 'currency',
      rendererConfig: {
        currencyAccessor: (row: TestRow) => 'USD',
      },
    }
    const render = createCurrencyRenderer(config)
    const result = render(mockCellContext(-50.25))
    expect(result).toBe('$ -50.25')
  })
})
