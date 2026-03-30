<!--
  @component ConfirmActionDialog
  @description Generic reusable action confirmation dialog with toast notifications.
  Manages dialog state, async operation, success/error toasts, and callbacks.
  @keywords action, dialog, confirmation, toast, utility
  @uses AlertDialog, toast (svelte-sonner)
-->
<script lang="ts" module>
  import { toast } from 'svelte-sonner'
  import type { ButtonVariant } from '$lib/components/ui/button'

  class ConfirmActionDialogState {
    open = $state(false)
    options = $state<ConfirmActionOptions | null>(null)
    loading = $state(false)

    constructor() {
      this.confirm = this.confirm.bind(this)
      this.cancel = this.cancel.bind(this)
    }

    newConfirmation(options: ConfirmActionOptions) {
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
        await this.options.onConfirm()
        this.open = false

        if (this.options.successMessage) {
          toast.success(this.options.successMessage)
        }

        this.options.onSuccess?.()
      } catch (err) {
        console.error('Action failed:', err)

        if (this.options.errorMessage) {
          toast.error(this.options.errorMessage)
        }

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

  const dialogState = new ConfirmActionDialogState()

  export type ConfirmActionOptions = {
    /** Dialog title */
    title: string
    /** Dialog description/confirmation message */
    description: string
    /** Confirm button text */
    confirmText?: string
    /** Cancel button text */
    cancelText?: string
    /** Async function that performs the action */
    onConfirm: () => Promise<void>
    /** Success message to show in toast */
    successMessage?: string
    /** Error message to show in toast */
    errorMessage?: string
    /** Callback after successful action */
    onSuccess?: () => void
    /** Callback on error */
    onError?: (err: unknown) => void
    /** Callback on cancel */
    onCancel?: () => void
    /** Text shown on the confirm button while loading */
    loadingText?: string
    /** Variant for the confirm button */
    variant?: ButtonVariant
  }

  /**
   * Show action confirmation dialog
   */
  export function confirmAction(options: ConfirmActionOptions) {
    dialogState.newConfirmation(options)
  }
</script>

<script lang="ts">
  import * as AlertDialog from '$lib/components/ui/alert-dialog'
  import * as m from '$lib/paraglide/messages.js'
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
        {dialogState.options?.cancelText ?? m.common_cancel()}
      </AlertDialog.Cancel>
      <AlertDialog.Action
        disabled={dialogState.loading}
        variant={dialogState.options?.variant ?? 'default'}
        onclick={dialogState.confirm}
      >
        {dialogState.loading
          ? (dialogState.options?.loadingText ?? m.common_confirming())
          : (dialogState.options?.confirmText ?? m.common_confirm())}
      </AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
