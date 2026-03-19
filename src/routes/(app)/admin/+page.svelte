<script lang="ts">
  import AdminChat from '$components/core/admin/AdminChat.svelte'
  import LegalEntityConfigEditor from '$components/features/settings/LegalEntityConfigEditor.svelte'
  import * as m from '$lib/paraglide/messages'
  import { refreshAdminConfig } from '$lib/utils/admin-config'
  import { toast } from 'svelte-sonner'
  import type { PageProps } from './$types'

  const props: PageProps = $props()

  async function onAgentMessage(message: string) {
    await refreshAdminConfig()
    toast.success(m.configuration_updated())
  }
</script>

<div class="flex min-h-0 flex-1">
  <div class="relative flex flex-1 flex-col">
    <div class="flex-1 overflow-auto">
      <LegalEntityConfigEditor minHeight="" config={props.data.legalEntityConfig} />
    </div>

    <div class="h-breadcrumbs w-full shrink-0 border-t bg-background"></div>
  </div>

  <div class="flex w-1/3 shrink-0 overflow-hidden border-l">
    <AdminChat {onAgentMessage} />
  </div>
</div>
