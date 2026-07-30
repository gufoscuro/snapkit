import { describe, expect, it } from 'vitest'
import type { ColumnConfig } from '../types'
import { applyPreferences, mergePreferences, type ColumnPreference } from './column-preferences'

type TestRow = { id: string; code: string; name: string; notes: string }

const columns: ColumnConfig<TestRow>[] = [
  { accessorKey: 'code', header: 'Code', renderer: 'text' },
  { accessorKey: 'name', header: 'Name', renderer: 'text' },
  { accessorKey: 'notes', header: 'Notes', renderer: 'long-text', defaultVisible: false },
  { header: '', renderer: 'actions' },
]

const headersOf = (cols: ColumnConfig<TestRow>[]) => cols.map(c => c.header)

describe('applyPreferences', () => {
  it('omits opt-in columns when no preferences are saved', () => {
    expect(headersOf(applyPreferences(columns, null))).toEqual(['Code', 'Name', ''])
  })

  it('keeps fixed columns when no preferences are saved', () => {
    const plain: ColumnConfig<TestRow>[] = [columns[0], columns[3]]
    expect(headersOf(applyPreferences(plain, null))).toEqual(['Code', ''])
  })

  it('keeps opt-in columns hidden when saved preferences predate them', () => {
    const saved: ColumnPreference[] = [
      { id: 'code', visible: true },
      { id: 'name', visible: true },
    ]
    expect(headersOf(applyPreferences(columns, saved))).toEqual(['Code', 'Name', ''])
  })

  it('shows an opt-in column once the user enables it', () => {
    const saved: ColumnPreference[] = [
      { id: 'code', visible: true },
      { id: 'notes', visible: true },
      { id: 'name', visible: true },
    ]
    expect(headersOf(applyPreferences(columns, saved))).toEqual(['Code', 'Notes', 'Name', ''])
  })
})

describe('mergePreferences', () => {
  it('lists opt-in columns toggled off by default', () => {
    expect(mergePreferences(columns, null)).toEqual([
      { id: 'code', visible: true, header: 'Code' },
      { id: 'name', visible: true, header: 'Name' },
      { id: 'notes', visible: false, header: 'Notes' },
    ])
  })

  it('appends opt-in columns toggled off to existing saved preferences', () => {
    const saved: ColumnPreference[] = [
      { id: 'name', visible: true },
      { id: 'code', visible: false },
    ]
    expect(mergePreferences(columns, saved)).toEqual([
      { id: 'name', visible: true, header: 'Name' },
      { id: 'code', visible: false, header: 'Code' },
      { id: 'notes', visible: false, header: 'Notes' },
    ])
  })

  it('respects a saved visible state for an opt-in column', () => {
    const saved: ColumnPreference[] = [
      { id: 'code', visible: true },
      { id: 'notes', visible: true },
      { id: 'name', visible: true },
    ]
    expect(mergePreferences(columns, saved).map(p => [p.id, p.visible])).toEqual([
      ['code', true],
      ['notes', true],
      ['name', true],
    ])
  })
})
