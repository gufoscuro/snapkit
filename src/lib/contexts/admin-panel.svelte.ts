/**
 * Global flag to track if we're in the admin panel.
 * This is simpler than Svelte context and works everywhere,
 * including non-component code like route-builder.ts
 */
let isInAdminPanelFlag = false

export function setAdminPanelContext(value: boolean): void {
	isInAdminPanelFlag = value
}

export function isInAdminPanel(): boolean {
	return isInAdminPanelFlag
}
