<script lang="ts">
  import { invalidate, invalidateAll } from '$app/navigation'
  import AdminChat from '$components/core/admin/AdminChat.svelte'
  import { m } from '$lib/paraglide/messages'
  import { invalidateGlobalsCache } from '$lib/stores/globals-cache'
  import { toast } from 'svelte-sonner'
  import type { PageProps } from './$types'

  const props: PageProps = $props()

  async function onAgentMessage(message: string) {
    invalidateGlobalsCache()
    await invalidate('admin:index')
    await invalidateAll()

    toast.success(m.configuration_updated())
  }
</script>

<div class="flex min-h-0 flex-1">
  <div class="relative flex flex-1 flex-col">
    <pre class="flex-1 overflow-auto p-4 text-xs text-muted-foreground">{JSON.stringify(
        props.data.legalEntityConfig?.resources,
        null,
        2,
      )}</pre>

    <div class="h-breadcrumbs w-full shrink-0 border-t bg-background"></div>
  </div>

  <div class="flex w-1/3 shrink-0 overflow-hidden border-l">
    <AdminChat {onAgentMessage} />
  </div>
</div>
