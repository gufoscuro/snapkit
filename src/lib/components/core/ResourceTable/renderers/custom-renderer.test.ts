import { describe, expect, it } from 'vitest'
import { createCustomRenderer } from './custom-renderer'
import type { ColumnConfig } from '../types'

type TestRow = { risk_score: number }

function mockCellContext(row: TestRow) {
  return {
    getValue: () => row.risk_score,
    row: { original: row },
  } as any
}

describe('createCustomRenderer', () => {
  it('calls cellRenderer with the row data', () => {
    const config: ColumnConfig<TestRow> = {
      accessorKey: 'risk_score',
      header: 'Risk',
      renderer: 'custom',
      rendererConfig: {
        cellRenderer: (row: TestRow) => `${row.risk_score}%`,
      },
    }
    const render = createCustomRenderer(config)
    expect(render(mockCellContext({ risk_score: 85 }))).toBe('85%')
  })

  it('supports returning any value from cellRenderer', () => {
    const config: ColumnConfig<TestRow> = {
      accessorKey: 'risk_score',
      header: 'Risk',
      renderer: 'custom',
      rendererConfig: {
        cellRenderer: (row: TestRow) => ({ score: row.risk_score, high: row.risk_score > 80 }),
      },
    }
    const render = createCustomRenderer(config)
    const result = render(mockCellContext({ risk_score: 90 }))
    expect(result).toEqual({ score: 90, high: true })
  })

  it('throws if no cellRenderer is provided', () => {
    const config: ColumnConfig<TestRow> = {
      accessorKey: 'risk_score',
      header: 'Risk',
      renderer: 'custom',
      rendererConfig: {} as any,
    }
    const render = createCustomRenderer(config)
    expect(() => render(mockCellContext({ risk_score: 50 }))).toThrow(
      'custom renderer requires a cellRenderer function',
    )
  })

  it('throws if rendererConfig is undefined', () => {
    const config: ColumnConfig<TestRow> = {
      accessorKey: 'risk_score',
      header: 'Risk',
      renderer: 'custom',
    }
    const render = createCustomRenderer(config)
    expect(() => render(mockCellContext({ risk_score: 50 }))).toThrow(
      'custom renderer requires a cellRenderer function',
    )
  })
})
