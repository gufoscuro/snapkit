import { describe, expect, it, vi } from 'vitest'

const { mockRenderComponent } = vi.hoisted(() => ({
  mockRenderComponent: vi.fn((_comp: any, props: any) => ({ __component: true, props })),
}))

vi.mock('$lib/components/ui/data-table', () => ({
  renderComponent: mockRenderComponent,
}))

vi.mock('./StatusBadge.svelte', () => ({ default: 'StatusBadge' }))

import { createStatusRenderer } from './status-renderer'
import type { ColumnConfig } from '../types'

type TestRow = { status: string }

function mockCellContext(value: unknown) {
  return {
    getValue: () => value,
    row: { original: { status: '' } },
  } as any
}

describe('createStatusRenderer', () => {
  it('returns "-" for null value', () => {
    const config: ColumnConfig<TestRow> = {
      accessorKey: 'status',
      header: 'Status',
      renderer: 'status',
      rendererConfig: { variantMapper: () => 'active' as const },
    }
    const render = createStatusRenderer(config)
    expect(render(mockCellContext(null))).toBe('-')
  })

  it('returns "-" for undefined value', () => {
    const config: ColumnConfig<TestRow> = {
      accessorKey: 'status',
      header: 'Status',
      renderer: 'status',
      rendererConfig: { variantMapper: () => 'active' as const },
    }
    const render = createStatusRenderer(config)
    expect(render(mockCellContext(undefined))).toBe('-')
  })

  it('returns "-" for empty string', () => {
    const config: ColumnConfig<TestRow> = {
      accessorKey: 'status',
      header: 'Status',
      renderer: 'status',
      rendererConfig: { variantMapper: () => 'active' as const },
    }
    const render = createStatusRenderer(config)
    expect(render(mockCellContext(''))).toBe('-')
  })

  it('returns string value when no variantMapper', () => {
    const config: ColumnConfig<TestRow> = {
      accessorKey: 'status',
      header: 'Status',
      renderer: 'status',
    }
    const render = createStatusRenderer(config)
    expect(render(mockCellContext('active'))).toBe('active')
  })

  it('renders StatusBadge with mapped variant', () => {
    const config: ColumnConfig<TestRow> = {
      accessorKey: 'status',
      header: 'Status',
      renderer: 'status',
      rendererConfig: {
        variantMapper: (value: any) => {
          if (value === 'active') return 'active' as const
          return 'neutral' as const
        },
      },
    }
    const render = createStatusRenderer(config)
    render(mockCellContext('active'))

    expect(mockRenderComponent).toHaveBeenCalledWith('StatusBadge', {
      variant: 'active',
      label: 'active',
    })
  })

  it('uses labelMapper when provided', () => {
    const config: ColumnConfig<TestRow> = {
      accessorKey: 'status',
      header: 'Status',
      renderer: 'status',
      rendererConfig: {
        variantMapper: () => 'in-progress' as const,
        labelMapper: (value: any) => value.toUpperCase(),
      },
    }
    const render = createStatusRenderer(config)
    render(mockCellContext('pending'))

    expect(mockRenderComponent).toHaveBeenCalledWith('StatusBadge', {
      variant: 'in-progress',
      label: 'PENDING',
    })
  })

  it('maps different values to different variants', () => {
    const config: ColumnConfig<TestRow> = {
      accessorKey: 'status',
      header: 'Status',
      renderer: 'status',
      rendererConfig: {
        variantMapper: (value: any) => {
          const map: Record<string, any> = {
            active: 'active',
            paused: 'paused',
            blocked: 'blocked',
          }
          return map[value] || 'neutral'
        },
      },
    }
    const render = createStatusRenderer(config)

    render(mockCellContext('blocked'))
    expect(mockRenderComponent).toHaveBeenCalledWith('StatusBadge', {
      variant: 'blocked',
      label: 'blocked',
    })
  })
})
