import { describe, expect, it, vi } from 'vitest'

// Mock Svelte component-rendering dependencies that renderers import
vi.mock('$lib/components/ui/data-table', () => ({
  renderComponent: vi.fn((_comp: any, props: any) => ({ __component: true, props })),
  renderSnippet: vi.fn((snippet: any) => ({ __snippet: true, snippet })),
}))

vi.mock('svelte', () => ({
  createRawSnippet: vi.fn((fn: any) => fn()),
}))

// Mock Svelte component imports used by renderers
vi.mock('$lib/components/ui/badge/badge.svelte', () => ({ default: {} }))
vi.mock('../renderers/StatusBadge.svelte', () => ({ default: {} }))
vi.mock('../renderers/ActionsCell.svelte', () => ({ default: {} }))

import { resolveColumns } from './column-resolver'
import type { ActionHelpers, ColumnConfig } from '../types'

type TestRow = {
  id: string
  name: string
  email: string
  status: string
  total: number
  created_at: string
}

const mockActionHelpers: ActionHelpers<TestRow> = {
  removeRow: vi.fn(),
  updateRow: vi.fn(),
  refresh: vi.fn(),
}

describe('resolveColumns', () => {
  it('converts text column config to column def', () => {
    const columns: ColumnConfig<TestRow>[] = [
      { accessorKey: 'name', header: 'Name', renderer: 'text' },
    ]
    const result = resolveColumns(columns, mockActionHelpers)
    expect(result).toHaveLength(1)
    expect(result[0].header).toBe('Name')
    expect((result[0] as any).accessorKey).toBe('name')
    expect(typeof result[0].cell).toBe('function')
  })

  it('filters out statically hidden columns', () => {
    const columns: ColumnConfig<TestRow>[] = [
      { accessorKey: 'name', header: 'Name', renderer: 'text' },
      { accessorKey: 'email', header: 'Email', renderer: 'text', hidden: true },
      { accessorKey: 'status', header: 'Status', renderer: 'text', hidden: false },
    ]
    const result = resolveColumns(columns, mockActionHelpers)
    expect(result).toHaveLength(2)
    expect(result[0].header).toBe('Name')
    expect(result[1].header).toBe('Status')
  })

  it('keeps columns with dynamic hidden functions (not filtered at resolve time)', () => {
    const columns: ColumnConfig<TestRow>[] = [
      { accessorKey: 'name', header: 'Name', renderer: 'text', hidden: () => true },
    ]
    const result = resolveColumns(columns, mockActionHelpers)
    expect(result).toHaveLength(1)
  })

  it('passes meta property through', () => {
    const columns: ColumnConfig<TestRow>[] = [
      {
        accessorKey: 'name',
        header: 'Name',
        renderer: 'text',
        meta: { cellClassName: 'font-bold', headerClassName: 'bg-gray-100' },
      },
    ]
    const result = resolveColumns(columns, mockActionHelpers)
    expect(result[0].meta).toEqual({ cellClassName: 'font-bold', headerClassName: 'bg-gray-100' })
  })

  it('handles actions column with id "actions" and no accessorKey', () => {
    const columns: ColumnConfig<TestRow>[] = [
      {
        header: 'Actions',
        renderer: 'actions',
        rendererConfig: {
          actions: [{ onClick: vi.fn() }],
        },
      },
    ]
    const result = resolveColumns(columns, mockActionHelpers)
    expect(result).toHaveLength(1)
    expect((result[0] as any).id).toBe('actions')
    expect((result[0] as any).accessorKey).toBeUndefined()
  })

  it('resolves all renderer types without error', () => {
    const columns: ColumnConfig<TestRow>[] = [
      { accessorKey: 'name', header: 'Name', renderer: 'text' },
      {
        accessorKey: 'name',
        header: 'Link',
        renderer: 'link',
        rendererConfig: { urlBuilder: (row: TestRow) => `/items/${row.id}` },
      },
      { accessorKey: 'email', header: 'Email', renderer: 'email' },
      { accessorKey: 'name', header: 'Phone', renderer: 'phone' },
      { accessorKey: 'status', header: 'Badge', renderer: 'badge' },
      {
        accessorKey: 'status',
        header: 'Status',
        renderer: 'status',
        rendererConfig: { variantMapper: () => 'active' as const },
      },
      { accessorKey: 'created_at', header: 'Date', renderer: 'date' },
      { accessorKey: 'total', header: 'Total', renderer: 'currency' },
      {
        accessorKey: 'name',
        header: 'Badges',
        renderer: 'badges',
        rendererConfig: { component: {} },
      },
      {
        accessorKey: 'name',
        header: 'Component',
        renderer: 'component',
        rendererConfig: { component: {}, propsMapper: () => ({}) },
      },
      {
        accessorKey: 'name',
        header: 'Custom',
        renderer: 'custom',
        rendererConfig: { cellRenderer: () => 'custom' },
      },
      {
        header: 'Actions',
        renderer: 'actions',
        rendererConfig: { actions: [{ onClick: vi.fn() }] },
      },
    ]

    const result = resolveColumns(columns, mockActionHelpers)
    expect(result).toHaveLength(12)
    result.forEach((col) => {
      expect(typeof col.cell).toBe('function')
    })
  })

  it('throws error for unknown renderer type', () => {
    const columns: ColumnConfig<TestRow>[] = [
      { accessorKey: 'name', header: 'Name', renderer: 'unknown' as any },
    ]
    expect(() => resolveColumns(columns, mockActionHelpers)).toThrow('Unknown renderer type: unknown')
  })

  it('does not include accessorKey when not provided', () => {
    const columns: ColumnConfig<TestRow>[] = [
      {
        header: 'Custom',
        renderer: 'custom',
        rendererConfig: { cellRenderer: () => 'test' },
      },
    ]
    const result = resolveColumns(columns, mockActionHelpers)
    expect((result[0] as any).accessorKey).toBeUndefined()
  })

  it('returns empty array for empty input', () => {
    const result = resolveColumns([], mockActionHelpers)
    expect(result).toHaveLength(0)
  })
})
