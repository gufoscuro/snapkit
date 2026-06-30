import { toast } from 'svelte-sonner'
import * as m from '$lib/paraglide/messages.js'
import { extractApiErrorMessage } from '$lib/utils/request'

/**
 * Error toasts on record actions stay longer than the sonner default (~4s) because
 * they often carry an actionable server message (e.g. a FatturaPA validation reason)
 * the user needs time to read. They remain dismissible via the close button rather
 * than fully persistent, since these failures are typically recoverable.
 */
export const ACTION_ERROR_TOAST_DURATION = 10000

/**
 * Shows an error toast for a failed record action.
 *
 * The action-specific `staticMessage` (when provided) is the headline; the localized
 * detail extracted from the server error is rendered as the description line. When
 * only one of the two is available it becomes the headline; when neither is, a
 * generic message is shown.
 *
 * @param staticMessage - The action's own error label (e.g. `m.flag_action_error()`)
 * @param err - The thrown error (ideally an `ApiError`)
 */
export function showActionErrorToast(staticMessage: string | undefined, err: unknown): void {
  const detail = extractApiErrorMessage(err)
  const title = staticMessage ?? detail ?? m.common_error()
  // Only show the server detail as a separate line when it isn't already the headline.
  const description = title !== detail ? detail : undefined

  toast.error(title, {
    description,
    duration: ACTION_ERROR_TOAST_DURATION,
    closeButton: true,
  })
}
