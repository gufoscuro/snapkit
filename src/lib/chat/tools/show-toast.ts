import { makeToastTool } from '@diaphora/chat'
import { toast } from 'svelte-sonner'

// Host wiring for the package's show_toast capability: map the variant to the
// matching svelte-sonner method.
export const { tool: showToastTool, handler: showToastHandler } = makeToastTool({
  notify: (message, variant) => toast[variant](message),
})
