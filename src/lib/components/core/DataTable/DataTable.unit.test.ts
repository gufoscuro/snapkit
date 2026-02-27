import { render, screen, fireEvent, cleanup } from '@testing-library/svelte'
import { describe, expect, it, vi, afterEach, beforeEach } from 'vitest'
import DataTable from './DataTable.svelte'
import type { ColumnDef } from '@tanstack/table-core'

vi.mock('$lib/paraglide/messages.js', () => ({
  datatable_no_data: () => 'No data available',
  datatable_load_more: () => 'Load more',
}))

type TestRow = { id: string; name: string }

const testColumns: ColumnDef<TestRow, unknown>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: 'Name' },
]

const testData: TestRow[] = [
  { id: '1', name: 'Alice' },
  { id: '2', name: 'Bob' },
  { id: '3', name: 'Charlie' },
]

describe('DataTable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => cleanup())

  describe('loading state', () => {
    it('shows skeleton when loading', () => {
      render(DataTable, {
        props: { data: [], columns: testColumns, loading: true },
      })
      // Skeleton renders a table too, but with no actual data cells containing text
      const table = screen.getByRole('table')
      expect(table).toBeInTheDocument()
      // Should not show "No data" message when loading
      expect(screen.queryByText('No data available')).not.toBeInTheDocument()
    })
  })

  describe('empty state', () => {
    it('shows empty state message when no data', () => {
      render(DataTable, {
        props: { data: [], columns: testColumns },
      })
      expect(screen.getByText('No data available')).toBeInTheDocument()
    })
  })

  describe('data rendering', () => {
    it('renders column headers', () => {
      render(DataTable, {
        props: { data: testData, columns: testColumns },
      })
      expect(screen.getByText('ID')).toBeInTheDocument()
      expect(screen.getByText('Name')).toBeInTheDocument()
    })

    it('renders data rows', () => {
      render(DataTable, {
        props: { data: testData, columns: testColumns },
      })
      expect(screen.getByText('Alice')).toBeInTheDocument()
      expect(screen.getByText('Bob')).toBeInTheDocument()
      expect(screen.getByText('Charlie')).toBeInTheDocument()
    })

    it('renders correct number of rows', () => {
      render(DataTable, {
        props: { data: testData, columns: testColumns },
      })
      // 1 header row + 3 data rows
      const rows = screen.getAllByRole('row')
      expect(rows).toHaveLength(4)
    })
  })

  describe('load more', () => {
    it('shows load more button when hasMore and onLoadMore are set', () => {
      render(DataTable, {
        props: {
          data: testData,
          columns: testColumns,
          hasMore: true,
          onLoadMore: vi.fn(),
        },
      })
      expect(screen.getByRole('button', { name: /load more/i })).toBeInTheDocument()
    })

    it('does not show load more button when hasMore is false', () => {
      render(DataTable, {
        props: {
          data: testData,
          columns: testColumns,
          hasMore: false,
          onLoadMore: vi.fn(),
        },
      })
      expect(screen.queryByRole('button', { name: /load more/i })).not.toBeInTheDocument()
    })

    it('does not show load more button when onLoadMore is not provided', () => {
      render(DataTable, {
        props: {
          data: testData,
          columns: testColumns,
          hasMore: true,
        },
      })
      expect(screen.queryByRole('button', { name: /load more/i })).not.toBeInTheDocument()
    })

    it('calls onLoadMore when button is clicked', async () => {
      const onLoadMore = vi.fn()
      render(DataTable, {
        props: {
          data: testData,
          columns: testColumns,
          hasMore: true,
          onLoadMore,
        },
      })
      await fireEvent.click(screen.getByRole('button', { name: /load more/i }))
      expect(onLoadMore).toHaveBeenCalledOnce()
    })

    it('disables button when loadingMore is true', () => {
      render(DataTable, {
        props: {
          data: testData,
          columns: testColumns,
          hasMore: true,
          onLoadMore: vi.fn(),
          loadingMore: true,
        },
      })
      expect(screen.getByRole('button', { name: /load more/i })).toBeDisabled()
    })

    it('uses custom load more label', () => {
      render(DataTable, {
        props: {
          data: testData,
          columns: testColumns,
          hasMore: true,
          onLoadMore: vi.fn(),
          loadMoreLabel: 'Carica altri',
        },
      })
      expect(screen.getByRole('button', { name: /carica altri/i })).toBeInTheDocument()
    })
  })
})
