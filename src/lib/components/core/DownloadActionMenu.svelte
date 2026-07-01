<!--
  @component DownloadActionMenu
  @description Groups multiple download actions behind a single download button
  with a dropdown menu. Owns the busy/spinner state and the error toast, so each
  item only supplies an async `onDownload` callback. Prefer this over rendering
  several DownloadActionButton when the same record can be exported in more than
  one format (XML, PDF, …).
  @keywords download, dropdown, menu, actions, busy, export, pdf, xml
  @uses ActionButton, DropdownMenu
-->
<script lang="ts" module>
  import type { Component } from 'svelte'

  export type DownloadMenuItem = {
    /** Unique item identifier (e.g. 'xml', 'pdf') */
    id: string
    /** Display label — use m.xxx() from paraglide */
    label: string
    /** Optional lucide icon component rendered before the label */
    icon?: Component<Record<string, any>>
    /** Conditionally disable this item */
    disabled?: boolean
    /** Async callback that performs the download */
    onDownload: () => Promise<void>
  }
</script>

<script lang="ts">
  import ActionButton from '$components/core/ActionButton.svelte'
  import { type ButtonVariant } from '$lib/components/ui/button'
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
  import { Spinner } from '$lib/components/ui/spinner'
  import * as m from '$lib/paraglide/messages.js'
  import DownloadIcon from '@lucide/svelte/icons/download'
  import { toast } from 'svelte-sonner'

  type Props = {
    /** Download actions listed in the dropdown */
    items: DownloadMenuItem[]
    /** Trigger button tooltip */
    tooltip?: string
    /** Optional dropdown header label. When omitted, no header is rendered. */
    label?: string
    /** Dropdown content alignment */
    align?: 'start' | 'end'
    /** Trigger button size */
    size?: 'sm' | 'default' | 'lg' | 'icon'
    /** Trigger button variant */
    variant?: ButtonVariant
    /** Additional CSS class for the trigger button */
    class?: string
  }

  let {
    items,
    tooltip = m.download_document(),
    label,
    align = 'end',
    size = 'icon',
    variant = 'outline',
    class: className,
  }: Props = $props()

  let busy = $state(false)

  async function handleDownload(item: DownloadMenuItem) {
    if (busy) return
    busy = true
    try {
      await item.onDownload()
    } catch {
      toast.error(m.download_error())
    } finally {
      busy = false
    }
  }
</script>

{#if items.length > 0}
  <DropdownMenu.Root>
    <DropdownMenu.Trigger>
      {#snippet child({ props })}
        <ActionButton {variant} {tooltip} {size} disabled={busy} class={className} {...props}>
          {#if busy}
            <Spinner class="h-4 w-4" />
          {:else}
            <DownloadIcon class="h-4 w-4" />
          {/if}
          <span class="sr-only">{tooltip}</span>
        </ActionButton>
      {/snippet}
    </DropdownMenu.Trigger>
    <DropdownMenu.Content class="min-w-44" {align}>
      {#if label}
        <DropdownMenu.Label>{label}</DropdownMenu.Label>
        <DropdownMenu.Separator />
      {/if}
      {#each items as item (item.id)}
        <DropdownMenu.Item disabled={item.disabled ?? false} onclick={() => handleDownload(item)}>
          {#if item.icon}
            {@const Icon = item.icon}
            <Icon class="mr-2 h-4 w-4" />
          {/if}
          {item.label}
        </DropdownMenu.Item>
      {/each}
    </DropdownMenu.Content>
  </DropdownMenu.Root>
{/if}
