<script lang="ts">
  import DashboardEditor from '$components/features/settings/DashboardEditor/DashboardEditor.svelte'
  import * as m from '$lib/paraglide/messages'
  import type { LegalEntityConfigResponse } from '$lib/stores/tenant-config/types'
  import { updateLegalEntityConfig } from '$lib/utils/admin-config'
  import { toast } from 'svelte-sonner'
  import type { PageProps } from './$types'

  const props: PageProps = $props()

  async function onConfigChange(updated: LegalEntityConfigResponse) {
    const legalEntityId = props.data.legalEntity?.id
    if (!legalEntityId) {
      toast.error(m.admin_legal_entity_unavailable())
      return
    }

    try {
      await updateLegalEntityConfig(legalEntityId, updated)
      toast.success(m.configuration_updated())
    } catch (error) {
      console.error('Failed to update legal entity config', error)
      toast.error(m.admin_config_save_error())
    }
  }
</script>

<div class="flex min-h-0 flex-1">
  <DashboardEditor
    config={props.data.legalEntityConfig}
    legalEntity={props.data.legalEntity}
    onchange={onConfigChange} />
</div>
