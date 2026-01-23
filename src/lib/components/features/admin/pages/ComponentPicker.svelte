<!--
	@component ComponentPicker
	@description Dialog to select a component from the registry
	@keywords admin, component, picker, dialog, registry
-->
<script lang="ts">
	import { getAllComponentKeys, COMPONENT_REGISTRY, type ComponentKey } from '$generated/components-registry'
	import * as Dialog from '$lib/components/ui/dialog'
	import { Input } from '$lib/components/ui/input'
	import { Button } from '$lib/components/ui/button'
	import { ScrollArea } from '$lib/components/ui/scroll-area'
	import Search from '@lucide/svelte/icons/search'

	interface Props {
		open: boolean
		title?: string
		filter?: (key: ComponentKey) => boolean
		onSelect: (key: ComponentKey) => void
		onClose: () => void
	}

	const { open, title = 'Select Component', filter, onSelect, onClose }: Props = $props()

	let searchQuery = $state('')

	const allKeys = getAllComponentKeys()

	const filteredKeys = $derived(() => {
		let keys = filter ? allKeys.filter(filter) : allKeys

		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase()
			keys = keys.filter((key) => key.toLowerCase().includes(query))
		}

		return keys
	})

	// Group keys by domain (first part of the key)
	const groupedKeys = $derived(() => {
		const groups: Record<string, ComponentKey[]> = {}

		for (const key of filteredKeys()) {
			const domain = key.split('.')[0]
			if (!groups[domain]) {
				groups[domain] = []
			}
			groups[domain].push(key)
		}

		return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
	})

	function handleSelect(key: ComponentKey) {
		onSelect(key)
		searchQuery = ''
	}

	function handleOpenChange(isOpen: boolean) {
		if (!isOpen) {
			searchQuery = ''
			onClose()
		}
	}
</script>

<Dialog.Root {open} onOpenChange={handleOpenChange}>
	<Dialog.Content class="max-w-2xl">
		<Dialog.Header>
			<Dialog.Title>{title}</Dialog.Title>
			<Dialog.Description>
				Choose a component from the registry
			</Dialog.Description>
		</Dialog.Header>

		<div class="relative">
			<Search class="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
			<Input
				bind:value={searchQuery}
				placeholder="Search components..."
				class="pl-9"
			/>
		</div>

		<ScrollArea class="h-[400px] pr-4">
			{#if groupedKeys().length === 0}
				<p class="text-muted-foreground py-8 text-center">No components found</p>
			{:else}
				<div class="space-y-4">
					{#each groupedKeys() as [domain, keys]}
						<div>
							<h4 class="mb-2 text-sm font-medium capitalize text-gray-500">{domain}</h4>
							<div class="space-y-1">
								{#each keys as key}
									<button
										type="button"
										class="hover:bg-accent w-full rounded-md px-3 py-2 text-left text-sm transition-colors"
										onclick={() => handleSelect(key)}
									>
										<div class="font-mono text-xs">{key}</div>
										<div class="text-muted-foreground text-xs">
											{COMPONENT_REGISTRY[key].description}
										</div>
									</button>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</ScrollArea>

		<Dialog.Footer>
			<Button variant="outline" onclick={onClose}>Cancel</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
