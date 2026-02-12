<!--
  @component ConfirmArchiveDialog
  @description Reusable archive confirmation dialog with toast notifications.
  Manages dialog state, API call, success/error toasts, and data array updates.
  @keywords archive, dialog, confirmation, toast, utility
  @uses AlertDialog, toast (svelte-sonner)
-->
<script lang="ts" module>
  import { toast } from 'svelte-sonner'

  class ConfirmArchiveDialogState<T> {
    open = $state(false)
    options = $state<ConfirmArchiveOptions<T> | null>(null)
    loading = $state(false)

    constructor() {
      this.confirm = this.confirm.bind(this)
      this.cancel = this.cancel.bind(this)
    }

    newConfirmation(options: ConfirmArchiveOptions<T>) {
      this.reset()
      this.options = options
      this.open = true
    }

    reset() {
      this.open = false
      this.options = null
      this.loading = false
    }

    async confirm() {
      if (!this.options) return

      this.loading = true
      try {
        await this.options.onArchive()
        this.open = false

        // Show success toast
        if (this.options.successMessage) {
          toast.success(this.options.successMessage)
        }

        // Call onSuccess callback if provided
        this.options.onSuccess?.()
      } catch (err) {
        console.error('Archive failed:', err)

        // Show error toast
        if (this.options.errorMessage) {
          toast.error(this.options.errorMessage)
        }

        // Call onError callback if provided
        this.options.onError?.(err)
      } finally {
        this.loading = false
      }
    }

    cancel() {
      this.options?.onCancel?.()
      this.open = false
    }
  }

  const dialogState = new ConfirmArchiveDialogState()

  export type ConfirmArchiveOptions<T = unknown> = {
    /** Dialog title */
    title: string
    /** Dialog description/confirmation message */
    description: string
    /** Confirm button text (defaults to "Archive") */
    confirmText?: string
    /** Cancel button text (defaults to "Cancel") */
    cancelText?: string
    /** Async function that performs the archive operation */
    onArchive: () => Promise<void>
    /** Success message to show in toast */
    successMessage?: string
    /** Error message to show in toast */
    errorMessage?: string
    /** Callback after successful archive */
    onSuccess?: () => void
    /** Callback on error */
    onError?: (err: unknown) => void
    /** Callback on cancel */
    onCancel?: () => void
  }

  /**
   * Show archive confirmation dialog
   * @param options - Configuration options for the archive dialog
   * @example
   * ```ts
   * confirmArchive({
   *   title: m.confirm_action(),
   *   description: m.archive_supplier_confirmation({ name: supplier.name }),
   *   confirmText: m.common_archive(),
   *   cancelText: m.common_cancel(),
   *   onArchive: async () => {
   *     await apiRequest({ url: `supply/supplier/${supplier.id}`, method: 'DELETE' })
   *   },
   *   successMessage: m.supplier_archived_success({ name: supplier.name }),
   *   errorMessage: m.supplier_archive_error(),
   *   onSuccess: () => {
   *     data = data.filter(s => s.id !== supplier.id)
   *   }
   * })
   * ```
   */
  export function confirmArchive<T = unknown>(options: ConfirmArchiveOptions<T>) {
    dialogState.newConfirmation(options)
  }
</script>

<script lang="ts">
  import * as AlertDialog from '$lib/components/ui/alert-dialog'
</script>

<AlertDialog.Root bind:open={dialogState.open}>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>
        {dialogState.options?.title}
      </AlertDialog.Title>
      <AlertDialog.Description>
        {dialogState.options?.description}
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel disabled={dialogState.loading} onclick={dialogState.cancel}>
        {dialogState.options?.cancelText ?? 'Cancel'}
      </AlertDialog.Cancel>
      <AlertDialog.Action
        disabled={dialogState.loading}
        onclick={dialogState.confirm}
      >
        {dialogState.loading ? 'Archiving...' : (dialogState.options?.confirmText ?? 'Archive')}
      </AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
