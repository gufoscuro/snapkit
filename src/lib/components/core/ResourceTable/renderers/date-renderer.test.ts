import { describe, expect, it } from 'vitest'
import { createDateRenderer } from './date-renderer'
import type { ColumnConfig } from '../types'

type TestRow = { created_at: string }

function mockCellContext(value: unknown, row: TestRow = { created_at: '' }) {
  return {
    getValue: () => value,
    row: { original: row },
  } as any
}

describe('createDateRenderer', () => {
  it('returns "-" for null value', () => {
    const config: ColumnConfig<TestRow> = { accessorKey: 'created_at', header: 'Created', renderer: 'date' }
    const render = createDateRenderer(config)
    expect(render(mockCellContext(null))).toBe('-')
  })

  it('returns "-" for undefined value', () => {
    const config: ColumnConfig<TestRow> = { accessorKey: 'created_at', header: 'Created', renderer: 'date' }
    const render = createDateRenderer(config)
    expect(render(mockCellContext(undefined))).toBe('-')
  })

  it('returns "-" for empty string', () => {
    const config: ColumnConfig<TestRow> = { accessorKey: 'created_at', header: 'Created', renderer: 'date' }
    const render = createDateRenderer(config)
    expect(render(mockCellContext(''))).toBe('-')
  })

  it('formats ISO date string with default (short) format', () => {
    const config: ColumnConfig<TestRow> = { accessorKey: 'created_at', header: 'Created', renderer: 'date' }
    const render = createDateRenderer(config)
    const result = render(mockCellContext('2024-01-15T10:30:00Z'))
    // Short format produces locale-dependent output; just verify it's not the fallback
    expect(result).not.toBe('-')
    expect(typeof result).toBe('string')
  })

  it('returns ISO string when format is "iso"', () => {
    const config: ColumnConfig<TestRow> = {
      accessorKey: 'created_at',
      header: 'Created',
      renderer: 'date',
      rendererConfig: { format: 'iso' },
    }
    const render = createDateRenderer(config)
    const result = render(mockCellContext('2024-01-15T10:30:00Z'))
    expect(result).toBe('2024-01-15T10:30:00.000Z')
  })

  it('formats with long dateStyle', () => {
    const config: ColumnConfig<TestRow> = {
      accessorKey: 'created_at',
      header: 'Created',
      renderer: 'date',
      rendererConfig: { format: 'long', locale: 'en-US' },
    }
    const render = createDateRenderer(config)
    const result = render(mockCellContext('2024-01-15T10:30:00Z'))
    expect(result).toContain('January')
    expect(result).toContain('15')
    expect(result).toContain('2024')
  })

  it('formats with specific locale', () => {
    const config: ColumnConfig<TestRow> = {
      accessorKey: 'created_at',
      header: 'Created',
      renderer: 'date',
      rendererConfig: { format: 'long', locale: 'it-IT' },
    }
    const render = createDateRenderer(config)
    const result = render(mockCellContext('2024-01-15T10:30:00Z'))
    expect(result).toContain('gennaio')
    expect(result).toContain('2024')
  })

  it('handles Date objects', () => {
    const config: ColumnConfig<TestRow> = { accessorKey: 'created_at', header: 'Created', renderer: 'date' }
    const render = createDateRenderer(config)
    const date = new Date('2024-06-01T00:00:00Z')
    const result = render(mockCellContext(date))
    expect(result).not.toBe('-')
    expect(typeof result).toBe('string')
  })

  it('handles numeric timestamps', () => {
    const config: ColumnConfig<TestRow> = { accessorKey: 'created_at', header: 'Created', renderer: 'date' }
    const render = createDateRenderer(config)
    const timestamp = new Date('2024-06-01').getTime()
    const result = render(mockCellContext(timestamp))
    expect(result).not.toBe('-')
  })

  it('returns raw string for invalid date', () => {
    const config: ColumnConfig<TestRow> = { accessorKey: 'created_at', header: 'Created', renderer: 'date' }
    const render = createDateRenderer(config)
    expect(render(mockCellContext('not-a-date'))).toBe('not-a-date')
  })

  it('returns string representation for unparseable types', () => {
    const config: ColumnConfig<TestRow> = { accessorKey: 'created_at', header: 'Created', renderer: 'date' }
    const render = createDateRenderer(config)
    const obj = { foo: 'bar' }
    expect(render(mockCellContext(obj))).toBe(String(obj))
  })
})
