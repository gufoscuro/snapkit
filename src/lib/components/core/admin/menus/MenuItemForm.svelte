<!--
	@component MenuItemForm
	@description Form for editing a single menu item
	@keywords admin, menu, item, form
-->
<script lang="ts">
	import type { NavItem } from '$lib/utils/customer-registry'
	import { Input } from '$lib/components/ui/input'
	import { Label } from '$lib/components/ui/label'
	import { Switch } from '$lib/components/ui/switch'
	import { Button } from '$lib/components/ui/button'
	import Trash2 from '@lucide/svelte/icons/trash-2'

	interface Props {
		item: NavItem
		onChange: (item: NavItem) => void
		onDelete: () => void
	}

	const { item, onChange, onDelete }: Props = $props()

	function handleLabelChange(e: Event) {
		onChange({ ...item, label: (e.target as HTMLInputElement).value })
	}

	function handleHrefChange(e: Event) {
		onChange({ ...item, href: (e.target as HTMLInputElement).value })
	}

	function handleVisibleChange(checked: boolean) {
		onChange({ ...item, visible: checked })
	}

	function handleDisabledChange(checked: boolean) {
		onChange({ ...item, disabled: checked })
	}
</script>

<div class="grid grid-cols-[1fr_1fr_auto_auto_auto] items-center gap-4">
	<div class="space-y-1">
		<Label class="text-xs">Label</Label>
		<Input value={item.label} oninput={handleLabelChange} placeholder="Menu Label" class="h-8" />
	</div>

	<div class="space-y-1">
		<Label class="text-xs">URL</Label>
		<Input value={item.href} oninput={handleHrefChange} placeholder="/path" class="h-8" />
	</div>

	<div class="flex items-center gap-2">
		<Switch checked={item.visible ?? true} onCheckedChange={handleVisibleChange} />
		<Label class="text-xs">Visible</Label>
	</div>

	<div class="flex items-center gap-2">
		<Switch checked={item.disabled ?? false} onCheckedChange={handleDisabledChange} />
		<Label class="text-xs">Disabled</Label>
	</div>

	<Button variant="ghost" size="sm" onclick={onDelete}>
		<Trash2 class="size-4 text-red-500" />
	</Button>
</div>
