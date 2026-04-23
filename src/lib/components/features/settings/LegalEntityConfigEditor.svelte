<script lang="ts">
  import CodeMirrorField from '$components/core/form/CodeMirrorField.svelte'
  import DashboardEditor from '$components/features/settings/DashboardEditor/DashboardEditor.svelte'
  import * as Tabs from '$components/ui/tabs'
  import type { LegalEntityConfigResponse } from '$lib/stores/tenant-config/types'
  import { json } from '@codemirror/lang-json'

  type Props = {
    /** The full legal entity config object */
    config: LegalEntityConfigResponse
    /** Called with the updated full config when the user edits */
    onchange?: (updatedConfig: LegalEntityConfigResponse) => void
    /** Label for the raw JSON editor field */
    label?: string
    /** Error message to display */
    error?: string
    /** Tailwind min-height class for the raw JSON editor */
    minHeight?: string
  }

  let {
    config,
    onchange,
    label = 'Configuration',
    error: errorProp = undefined,
    minHeight = 'min-h-80 max-h-160 overflow-y-auto',
  }: Props = $props()

  let liveConfig = $state<LegalEntityConfigResponse>(config)
  let lastExternalJson = $state(JSON.stringify(config))

  $effect(() => {
    const currentJson = JSON.stringify(config)
    if (currentJson !== lastExternalJson) {
      lastExternalJson = currentJson
      liveConfig = config
    }
  })

  const jsonValue = $derived(JSON.stringify(liveConfig, null, 2))

  function handleEditorChange(updated: LegalEntityConfigResponse) {
    liveConfig = updated
    lastExternalJson = JSON.stringify(updated)
    onchange?.(updated)
  }
</script>

<Tabs.Root value="editor" class="flex h-full min-h-0 flex-col gap-2">
  <Tabs.List class="self-start">
    <Tabs.Trigger value="editor">Editor</Tabs.Trigger>
    <Tabs.Trigger value="raw">Raw JSON</Tabs.Trigger>
  </Tabs.List>

  <Tabs.Content value="editor" class="min-h-0 flex-1">
    <DashboardEditor config={liveConfig} onchange={handleEditorChange} />
  </Tabs.Content>

  <Tabs.Content value="raw">
    <CodeMirrorField
      {label}
      readonly
      name="legal-entity-config-editor"
      showLabel={false}
      value={jsonValue}
      lang={json()}
      error={errorProp}
      {minHeight}
      lineWrapping={true} />
  </Tabs.Content>
</Tabs.Root>
