<!--
  @component ArchiveButton
  @description A ghost icon button with a trash icon for archive/delete actions.
  @keywords archive, delete, trash, button, icon
  @uses Button, Trash (lucide-svelte)
-->
<script lang="ts">
  import { Button } from '$lib/components/ui/button'
  import { Trash } from 'lucide-svelte'

  interface Props {
    onclick: () => void
    class?: string
  }

  let { onclick, class: className }: Props = $props()
</script>

<Button variant="ghost" size="icon" class={className} {onclick}>
  <Trash size={16} />
</Button>
