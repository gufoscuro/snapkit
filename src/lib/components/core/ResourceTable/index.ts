// Main component
export { default as ResourceTable } from './ResourceTable.svelte'

// Types
export type * from './types'

// Renderers (for advanced usage if needed)
export { createTextRenderer } from './renderers/text-renderer'
export { createLinkRenderer } from './renderers/link-renderer'
export { createEmailRenderer } from './renderers/email-renderer'
export { createPhoneRenderer } from './renderers/phone-renderer'
export { createBadgeRenderer } from './renderers/badge-renderer'
export { createBadgesRenderer } from './renderers/badges-renderer'
export { createDateRenderer } from './renderers/date-renderer'
export { createCurrencyRenderer } from './renderers/currency-renderer'
export { createActionsRenderer } from './renderers/actions-renderer'
export { createComponentRenderer } from './renderers/component-renderer'
export { createCustomRenderer } from './renderers/custom-renderer'

// Utilities
export { resolveColumns } from './utils/column-resolver'
