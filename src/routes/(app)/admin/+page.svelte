<script lang="ts">
  import { invalidateAll } from '$app/navigation'
  import AdminChat from '$components/core/admin/AdminChat.svelte'
  import { onMount } from 'svelte'
  import type { PageProps } from '../$types'

  const props: PageProps = $props()

  async function onAgentMessage(message: string) {
    // For demonstration purposes, we're just logging the agent message.
    // In a real application, you might want to display this message in the UI or perform other actions.
    console.log('Agent message:', message)
    await invalidateAll()
  }

  onMount(async () => {
    // Simulate receiving an agent message after 5 seconds
    setTimeout(() => {
      onAgentMessage('This is a message from the agent.')
    }, 5000)
  })
</script>

<div class="flex min-h-0 flex-1">
  <div class="relative flex flex-1 flex-col">
    <pre class="flex-1 overflow-auto p-4 text-xs text-muted-foreground">{JSON.stringify(
        props.data.entityConfig?.resources,
        null,
        2,
      )}</pre>

    <div class="h-breadcrumbs w-full shrink-0 border-t bg-background"></div>
  </div>

  <div class="flex w-1/3 shrink-0 overflow-hidden border-l">
    <AdminChat {onAgentMessage} />
  </div>
</div>
