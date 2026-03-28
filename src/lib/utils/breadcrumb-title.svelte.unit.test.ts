import { describe, it, expect, beforeEach } from 'vitest'
import { flushSync } from 'svelte'
import { setBreadcrumbLabel, clearBreadcrumbLabel, getBreadcrumbLabels, BREADCRUMB_LABELS_KEY } from './breadcrumb-title'

// Minimal PageState implementation using Svelte 5 $state for reactivity
function createTestPageState() {
  let state = $state<Record<string, unknown>>({})

  return {
    get<T>(key: string): T | undefined {
      return state[key] as T | undefined
    },
    set<T>(key: string, value: T): void {
      state[key] = value
    },
    update<T>(key: string, fn: (current: T | undefined) => T): void {
      state[key] = fn(state[key] as T | undefined)
    },
  }
}

type TestPageState = ReturnType<typeof createTestPageState>

describe('breadcrumb labels', () => {
  let pageState: TestPageState

  beforeEach(() => {
    pageState = createTestPageState()
  })

  describe('setBreadcrumbLabel', () => {
    it('sets a label for a page id', () => {
      setBreadcrumbLabel(pageState, 'supplier-details', 'Express Logistics S.r.l.')
      flushSync()

      const labels = getBreadcrumbLabels(pageState)
      expect(labels['supplier-details']).toBe('Express Logistics S.r.l.')
    })

    it('sets multiple labels for different page ids', () => {
      setBreadcrumbLabel(pageState, 'supplier-details', 'Express Logistics S.r.l.')
      setBreadcrumbLabel(pageState, 'supplier-address-details', 'Via Roma 1')
      flushSync()

      const labels = getBreadcrumbLabels(pageState)
      expect(labels['supplier-details']).toBe('Express Logistics S.r.l.')
      expect(labels['supplier-address-details']).toBe('Via Roma 1')
    })

    it('overwrites an existing label for the same page id', () => {
      setBreadcrumbLabel(pageState, 'supplier-details', 'Old Name')
      setBreadcrumbLabel(pageState, 'supplier-details', 'New Name')
      flushSync()

      const labels = getBreadcrumbLabels(pageState)
      expect(labels['supplier-details']).toBe('New Name')
    })
  })

  describe('clearBreadcrumbLabel', () => {
    it('removes a label for a page id', () => {
      setBreadcrumbLabel(pageState, 'supplier-details', 'Express Logistics S.r.l.')
      clearBreadcrumbLabel(pageState, 'supplier-details')
      flushSync()

      const labels = getBreadcrumbLabels(pageState)
      expect(labels['supplier-details']).toBeUndefined()
    })

    it('does not affect other labels when clearing one', () => {
      setBreadcrumbLabel(pageState, 'supplier-details', 'Express Logistics S.r.l.')
      setBreadcrumbLabel(pageState, 'supplier-address-details', 'Via Roma 1')
      clearBreadcrumbLabel(pageState, 'supplier-details')
      flushSync()

      const labels = getBreadcrumbLabels(pageState)
      expect(labels['supplier-details']).toBeUndefined()
      expect(labels['supplier-address-details']).toBe('Via Roma 1')
    })

    it('is safe to call on a non-existent label', () => {
      clearBreadcrumbLabel(pageState, 'non-existent')
      flushSync()

      const labels = getBreadcrumbLabels(pageState)
      expect(labels).toEqual({})
    })

    it('is safe to call when no labels have been set', () => {
      clearBreadcrumbLabel(pageState, 'supplier-details')
      flushSync()

      const labels = getBreadcrumbLabels(pageState)
      expect(labels).toEqual({})
    })
  })

  describe('getBreadcrumbLabels', () => {
    it('returns empty object when no labels are set', () => {
      expect(getBreadcrumbLabels(pageState)).toEqual({})
    })

    it('returns all set labels', () => {
      setBreadcrumbLabel(pageState, 'a', 'Label A')
      setBreadcrumbLabel(pageState, 'b', 'Label B')
      setBreadcrumbLabel(pageState, 'c', 'Label C')
      flushSync()

      expect(getBreadcrumbLabels(pageState)).toEqual({
        a: 'Label A',
        b: 'Label B',
        c: 'Label C',
      })
    })
  })

  describe('BREADCRUMB_LABELS_KEY', () => {
    it('stores labels under the correct key in page state', () => {
      setBreadcrumbLabel(pageState, 'test-page', 'Test Label')
      flushSync()

      const raw = pageState.get<Record<string, string>>(BREADCRUMB_LABELS_KEY)
      expect(raw).toEqual({ 'test-page': 'Test Label' })
    })
  })
})
