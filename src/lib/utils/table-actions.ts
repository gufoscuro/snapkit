import type { Action } from '$lib/components/core/ResourceTable/types'
import { confirmArchive } from '$lib/components/ui/confirm-archive-dialog'
import * as m from '$lib/paraglide/messages.js'
import Archive from '@lucide/svelte/icons/archive'
import { apiRequest } from './request'

/**
 * Configuration for creating an archive action
 */
export type ArchiveActionConfig<T> = {
  /**
   * Function to build API URL for archiving (DELETE request)
   */
  apiUrl: (row: T) => string

  /**
   * Function to build the URL used to GET the single record before archiving,
   * to read its `is_archivable` flag. Defaults to `apiUrl(row)`.
   */
  fetchUrl?: (row: T) => string

  /**
   * Confirmation dialog message
   */
  confirmMessage: (row: T) => string

  /**
   * Success toast message
   */
  successMessage: (row: T) => string

  /**
   * Error toast message (optional)
   */
  errorMessage?: string

  /**
   * Additional callback after successful archive (optional)
   */
  onSuccess?: (row: T) => void
}

/**
 * Creates a standardized archive action for ResourceTable
 *
 * Provides:
 * - Archive icon (lucide-svelte)
 * - Confirmation dialog
 * - API DELETE request
 * - Success/error toasts
 * - Optimistic row removal
 *
 * @param config - Archive action configuration
 * @returns Action object compatible with ResourceTable actions renderer
 *
 * @example
 * {
 *   renderer: 'actions',
 *   rendererConfig: {
 *     actions: [
 *       createArchiveAction({
 *         apiUrl: (supplier) => `supply/supplier/${supplier.id}`,
 *         confirmMessage: (supplier) => `Archive ${supplier.name}?`,
 *         successMessage: (supplier) => `${supplier.name} archived!`
 *       })
 *     ]
 *   }
 * }
 */
export function createArchiveAction<T extends Record<string, any> & { id?: string }>(
  config: ArchiveActionConfig<T>,
): Action<T> {
  return {
    icon: Archive,
    variant: 'ghost',
    label: m.common_archive(),
    onClick: async (row, helpers) => {
      // Verify row has an id
      if (!row.id) {
        console.error('Cannot archive row without id:', row)
        return
      }

      await confirmArchive({
        title: m.confirm_action(),
        description: config.confirmMessage(row),
        confirmText: m.common_archive(),
        cancelText: m.common_cancel(),
        prefetch: async () => {
          const url = (config.fetchUrl ?? config.apiUrl)(row)
          const record = await apiRequest<{ is_archivable?: boolean }>({ url })
          return { blocked: record.is_archivable === false }
        },
        blockedTitle: m.cannot_archive_title(),
        blockedDescription: m.cannot_archive_description(),
        onArchive: async () => {
          await apiRequest({
            url: config.apiUrl(row),
            method: 'DELETE',
          })
        },
        successMessage: config.successMessage(row),
        errorMessage: config.errorMessage,
        onSuccess: () => {
          // Optimistically remove row from table
          helpers.removeRow(row.id!)

          // Call additional callback if provided
          config.onSuccess?.(row)
        },
      })
    },
  }
}
