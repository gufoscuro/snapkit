import { toast } from 'svelte-sonner'
import type { ToolDefinition, ToolHandler } from '@diaphora/chat'

const VARIANTS = ['info', 'success', 'warning', 'error'] as const
type Variant = (typeof VARIANTS)[number]

export const showToastTool: ToolDefinition = {
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

export const showToastHandler: ToolHandler = {
  type: 'sync',
  execute(input) {
    const message = typeof input.message === 'string' ? input.message.trim() : ''
    if (!message) return JSON.stringify({ error: 'message is required' })
    const rawVariant = typeof input.variant === 'string' ? input.variant : 'info'
    const variant: Variant = (VARIANTS as readonly string[]).includes(rawVariant)
      ? (rawVariant as Variant)
      : 'info'

    switch (variant) {
      case 'success':
        toast.success(message)
        break
      case 'warning':
        toast.warning(message)
        break
      case 'error':
        toast.error(message)
        break
      default:
        toast.info(message)
    }
    return JSON.stringify({ ok: true, variant })
  },
}
