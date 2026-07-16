import { onMount } from 'svelte'
import { chatStore } from '$lib/chat/store'
import type { PageContextRegistration } from '@diaphora/chat'

/**
 * Register a page-scoped contribution to the chat context (tools, handlers,
 * and an ambient state snapshot). Automatically unregisters on unmount.
 *
 * @example
 * usePageChat({
 *   id: 'invoice-edit',
 *   tools: [approveInvoiceTool],
 *   toolHandlers: { approve_invoice: approveInvoiceHandler },
 *   state: () => `Editing invoice ${invoice.number} (status: ${invoice.status})`,
 * })
 */
export function usePageChat(registration: PageContextRegistration) {
  onMount(() => {
    chatStore.pushPageContext(registration)
    return () => chatStore.clearPageContext(registration.id)
  })
}
