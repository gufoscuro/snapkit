<script lang="ts">
	import type { PageData } from './$types'
	import { page } from '$app/state'
	import { adminStore } from '$lib/admin/store.svelte'
	import { adminBlocksRoute } from '$lib/admin/routes'
	import { goto } from '$app/navigation'
	import BlockPreview from '$lib/components/core/admin/blocks/BlockPreview.svelte'
	import { Button } from '$lib/components/ui/button'
	import ArrowLeft from '@lucide/svelte/icons/arrow-left'
	import AlertCircle from '@lucide/svelte/icons/alert-circle'

	// Select block from URL param
	$effect(() => {
		const blockId = page.params.id
		if (blockId && adminStore.state.selection.id !== blockId) {
			adminStore.selectBlock(blockId)
		}
	})

	const selectedBlock = $derived(adminStore.selectedBlock)

	function goBack() {
		adminStore.clearSelection()
		goto(adminBlocksRoute())
	}
</script>

{#if !selectedBlock}
	<div class="flex flex-col items-center justify-center py-12 text-center">
		<AlertCircle class="size-12 text-muted-foreground mb-4" />
		<h3 class="text-lg font-semibold mb-2">Block not found</h3>
		<p class="text-sm text-muted-foreground mb-4">
			The block you're looking for doesn't exist or has been removed.
		</p>
		<Button onclick={goBack}>
			<ArrowLeft class="size-4 mr-2" />
			Back to blocks
		</Button>
	</div>
{:else}
	<BlockPreview block={selectedBlock} />
{/if}
