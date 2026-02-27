import { render, screen, cleanup } from '@testing-library/svelte'
import { describe, expect, it, afterEach } from 'vitest'
import DataTableSkeleton from './DataTableSkeleton.svelte'

describe('DataTableSkeleton', () => {
  afterEach(() => cleanup())

  it('renders a table element', () => {
    render(DataTableSkeleton, { props: { columns: 3 } })
    expect(screen.getByRole('table')).toBeInTheDocument()
  })

  it('renders header cells matching column count', () => {
    render(DataTableSkeleton, { props: { columns: 4 } })
    const headerCells = screen.getAllByRole('columnheader')
    expect(headerCells).toHaveLength(4)
  })

  it('renders default 5 body rows', () => {
    render(DataTableSkeleton, { props: { columns: 2 } })
    // +1 for header row
    const allRows = screen.getAllByRole('row')
    expect(allRows).toHaveLength(6) // 1 header + 5 body
  })

  it('renders custom number of rows', () => {
    render(DataTableSkeleton, { props: { columns: 2, rows: 3 } })
    const allRows = screen.getAllByRole('row')
    expect(allRows).toHaveLength(4) // 1 header + 3 body
  })

  it('renders correct number of cells per body row', () => {
    render(DataTableSkeleton, { props: { columns: 3, rows: 2 } })
    const cells = screen.getAllByRole('cell')
    expect(cells).toHaveLength(6) // 3 columns × 2 rows
  })
})
