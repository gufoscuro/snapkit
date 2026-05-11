<!--
  @component ConfirmArchiveDialog
  @description Reusable archive confirmation dialog with toast notifications.
  Manages dialog state, API call, success/error toasts, and data array updates.
  Supports an optional `prefetch` hook to gate the archive (e.g. via `is_archivable`):
  when prefetch resolves with `{ blocked: true }`, the dialog switches to a
  "blocked" mode that only offers a close button.
  @keywords archive, dialog, confirmation, toast, utility
  @uses AlertDialog, toast (svelte-sonner)
-->
<script lang="ts" module>
  import { toast } from 'svelte-sonner'
  import * as m from '$lib/paraglide/messages.js'

  type DialogMode = 'loading' | 'confirm' | 'blocked'

  class ConfirmArchiveDialogState<T> {
    open = $state(false)
    options = $state<ConfirmArchiveOptions<T> | null>(null)
    loading = $state(false)
    mode = $state<DialogMode>('confirm')
    blockedTitle = $state<string | null>(null)
    blockedDescription = $state<string | null>(null)
    // Monotonic id used to detect when a new confirmation supersedes an
    // in-flight prefetch. Reference identity can't be used because $state
    // wraps assigned objects in a Proxy.
    private generation = 0

    constructor() {
      this.confirm = this.confirm.bind(this)
      this.cancel = this.cancel.bind(this)
    }

    async newConfirmation(options: ConfirmArchiveOptions<T>) {
      this.reset()
      this.options = options
      const generation = ++this.generation

      if (options.prefetch) {
        this.mode = 'loading'
        this.open = true
        try {
          const result = await options.prefetch()
          if (this.generation !== generation) return

          if (result.blocked) {
            this.blockedTitle = result.blockedTitle ?? options.blockedTitle ?? null
            this.blockedDescription = result.blockedDescription ?? options.blockedDescription ?? null
            this.mode = 'blocked'
          } else {
            this.mode = 'confirm'
          }
        } catch (err) {
          if (this.generation !== generation) return
          console.error('Archive prefetch failed:', err)
          if (options.errorMessage) {
            toast.error(options.errorMessage)
          }
          options.onError?.(err)
          this.reset()
        }
      } else {
        this.mode = 'confirm'
        this.open = true
      }
    }

    reset() {
      this.open = false
      this.options = null
      this.loading = false
      this.mode = 'confirm'
      this.blockedTitle = null
      this.blockedDescription = null
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

  export type ConfirmArchivePrefetchResult = {
    blocked: boolean
    blockedTitle?: string
    blockedDescription?: string
  }

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
    /** Text shown on the confirm button while loading (defaults to "Archiving...") */
    loadingText?: string
    /**
     * Optional async hook executed before showing the confirmation.
     * The dialog opens immediately in a loading state. If the hook resolves with
     * `{ blocked: true }`, the dialog switches to a "blocked" mode and only
     * offers a close button — `onArchive` is never called.
     */
    prefetch?: () => Promise<ConfirmArchivePrefetchResult>
    /** Default title for the blocked mode (overridden by prefetch result) */
    blockedTitle?: string
    /** Default description for the blocked mode (overridden by prefetch result) */
    blockedDescription?: string
  }

  /**
   * Show archive confirmation dialog.
   * @example
   * ```ts
   * confirmArchive({
   *   title: m.confirm_action(),
   *   description: m.archive_supplier_confirmation({ name: supplier.name }),
   *   prefetch: async () => {
   *     const r = await apiRequest<{ is_archivable?: boolean }>({ url: `supply/supplier/${supplier.id}` })
   *     return { blocked: r.is_archivable === false }
   *   },
   *   blockedTitle: m.cannot_archive_title(),
   *   blockedDescription: m.cannot_archive_description(),
   *   onArchive: async () => {
   *     await apiRequest({ url: `supply/supplier/${supplier.id}`, method: 'DELETE' })
   *   },
   * })
   * ```
   */
  export function confirmArchive<T = unknown>(options: ConfirmArchiveOptions<T>) {
    void dialogState.newConfirmation(options)
  }
</script>

<script lang="ts">
  import * as AlertDialog from '$lib/components/ui/alert-dialog'
  import Loader2 from '@lucide/svelte/icons/loader-2'
</script>

<AlertDialog.Root bind:open={dialogState.open}>
  <AlertDialog.Content>
    {#if dialogState.mode === 'loading'}
      <AlertDialog.Header>
        <AlertDialog.Title>
          {dialogState.options?.title}
        </AlertDialog.Title>
        <AlertDialog.Description class="flex items-center gap-2">
          <Loader2 class="size-4 animate-spin" />
          {m.common_loading()}
        </AlertDialog.Description>
      </AlertDialog.Header>
    {:else if dialogState.mode === 'blocked'}
      <AlertDialog.Header>
        <AlertDialog.Title>
          {dialogState.blockedTitle ?? m.cannot_archive_title()}
        </AlertDialog.Title>
        <AlertDialog.Description>
          {dialogState.blockedDescription ?? m.cannot_archive_description()}
        </AlertDialog.Description>
      </AlertDialog.Header>
      <AlertDialog.Footer>
        <AlertDialog.Cancel onclick={dialogState.cancel}>
          {m.common_close()}
        </AlertDialog.Cancel>
      </AlertDialog.Footer>
    {:else}
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
        <AlertDialog.Action disabled={dialogState.loading} onclick={dialogState.confirm}>
          {dialogState.loading
            ? (dialogState.options?.loadingText ?? 'Archiving...')
            : (dialogState.options?.confirmText ?? 'Archive')}
        </AlertDialog.Action>
      </AlertDialog.Footer>
    {/if}
  </AlertDialog.Content>
</AlertDialog.Root>
