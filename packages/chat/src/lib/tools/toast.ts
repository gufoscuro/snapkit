// Capability tool factory: surface a toast notification.
// The package owns the tool shape + input validation; the host injects how a
// notification is actually shown (svelte-sonner, a custom toaster, etc.).
// Deps: package types only — no host imports.

import type { ToolDefinition, ToolHandler } from '../types'

export const TOAST_VARIANTS = ['info', 'success', 'warning', 'error'] as const
export type ToastVariant = (typeof TOAST_VARIANTS)[number]

export type ToastAdapter = {
  /** Show a notification with the given message and variant. */
  notify: (message: string, variant: ToastVariant) => void
}

const showToastTool: ToolDefinition = {
  name: 'show_toast',
  description:
    'Surface a brief, non-blocking notification (toast) to the user. Use to confirm an action just completed or to flag something requiring attention. Keep the message short (max ~80 chars).',
  input_schema: {
    type: 'object',
    properties: {
      message: { type: 'string', description: 'Short user-facing notification text.' },
      variant: {
        type: 'string',
        enum: ['info', 'success', 'warning', 'error'],
        description: 'Visual style; defaults to "info" when omitted.',
      },
    },
    required: ['message'],
  },
}

export function makeToastTool(adapter: ToastAdapter): {
  tool: ToolDefinition
  handler: ToolHandler
} {
  const handler: ToolHandler = {
    type: 'sync',
    execute(input) {
      const message = typeof input.message === 'string' ? input.message.trim() : ''
      if (!message) return JSON.stringify({ error: 'message is required' })
      const raw = typeof input.variant === 'string' ? input.variant : 'info'
      const variant: ToastVariant = (TOAST_VARIANTS as readonly string[]).includes(raw)
        ? (raw as ToastVariant)
        : 'info'
      adapter.notify(message, variant)
      return JSON.stringify({ ok: true, variant })
    },
  }
  return { tool: showToastTool, handler }
}
