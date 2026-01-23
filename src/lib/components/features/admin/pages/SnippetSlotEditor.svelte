<!--
	@component SnippetSlotEditor
	@description Editor for a single snippet slot with component selection and props editing
	@keywords admin, snippet, slot, editor
-->
<script lang="ts">
	import type { ExtendedSnippetDefinition } from '$lib/admin/types'
	import type { ComponentKey } from '$generated/components-registry'
	import { adminStore } from '$lib/admin/store.svelte'
	import { Button } from '$lib/components/ui/button'
	import { Switch } from '$lib/components/ui/switch'
	import { Label } from '$lib/components/ui/label'
	import * as Collapsible from '$lib/components/ui/collapsible'
	import { confirmDelete } from '$lib/components/ui/confirm-delete-dialog/confirm-delete-dialog.svelte'
	import ComponentPicker from './ComponentPicker.svelte'
	import JsonEditor from '../shared/JsonEditor.svelte'
	import Settings from '@lucide/svelte/icons/settings'
	import Trash2 from '@lucide/svelte/icons/trash-2'
	import ChevronDown from '@lucide/svelte/icons/chevron-down'
	import { toast } from 'svelte-sonner'

	interface Props {
		pageId: string
		slotName: string
		snippet: ExtendedSnippetDefinition
	}

	const { pageId, slotName, snippet }: Props = $props()

	let showComponentPicker = $state(false)
	let showPropsEditor = $state(false)

	function handleToggleEnabled() {
		adminStore.updateSnippet(pageId, slotName, { enabled: !snippet.enabled })
	}

	function handleComponentSelect(componentKey: ComponentKey) {
		adminStore.updateSnippet(pageId, slotName, { componentKey })
		showComponentPicker = false
	}

	function handlePropsChange(props: Record<string, unknown>) {
		adminStore.updateSnippet(pageId, slotName, { props })
	}

	function handleDelete() {
		confirmDelete({
			title: 'Delete Snippet',
			description: `Are you sure you want to delete the snippet for slot "${slotName}"? This action cannot be undone.`,
			confirm: {
				text: 'Delete Snippet'
			},
			onConfirm: async () => {
				adminStore.deleteSnippet(pageId, slotName)
				toast.success(`Snippet "${slotName}" deleted successfully`)
			}
		})
	}
</script>

<div class="rounded-lg border bg-white p-4">
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-4">
			<div class="flex items-center gap-2">
				<Switch checked={snippet.enabled} onCheckedChange={handleToggleEnabled} />
				<Label class="font-medium">{slotName}</Label>
			</div>
			<code class="bg-muted rounded px-2 py-1 text-xs">{snippet.componentKey}</code>
		</div>

		<div class="flex items-center gap-2">
			<Button variant="ghost" size="sm" onclick={() => (showComponentPicker = true)}>
				<Settings class="mr-2 size-4" />
				Change
			</Button>
			<Button variant="ghost" size="sm" onclick={handleDelete}>
				<Trash2 class="size-4 text-red-500" />
			</Button>
		</div>
	</div>

	<Collapsible.Root bind:open={showPropsEditor} class="mt-4">
		<Collapsible.Trigger asChild>
			<Button variant="ghost" size="sm" class="w-full justify-between">
				<span>Props Configuration</span>
				<ChevronDown class="size-4 transition-transform {showPropsEditor ? 'rotate-180' : ''}" />
			</Button>
		</Collapsible.Trigger>
		<Collapsible.Content class="mt-2">
			<JsonEditor
				value={snippet.props ?? {}}
				onChange={handlePropsChange}
				placeholder="Component props (JSON)"
			/>
		</Collapsible.Content>
	</Collapsible.Root>
</div>

<ComponentPicker
	open={showComponentPicker}
	title="Select Component for {slotName}"
	onSelect={handleComponentSelect}
	onClose={() => (showComponentPicker = false)}
/>
