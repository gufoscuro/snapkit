<script lang="ts">
  import CodeMirrorField from '$components/core/form/CodeMirrorField.svelte'
  import type { LegalEntityConfigResponse } from '$lib/stores/tenant-config/types'
  import { json } from '@codemirror/lang-json'

  type Props = {
    /** The full legal entity config object */
    config: LegalEntityConfigResponse
    /** Called with the updated full config when the user edits the JSON */
    onchange?: (updatedConfig: LegalEntityConfigResponse) => void
    /** Label for the editor field */
    label?: string
    /** Whether the editor is readonly */
    readonly?: boolean
    /** Error message to display */
    error?: string
    /** Tailwind min-height class */
    minHeight?: string
  }

  let {
    config,
    onchange,
    label = 'Configuration',
    readonly = false,
    error: errorProp = undefined,
    minHeight = 'min-h-80 max-h-160 overflow-y-auto',
  }: Props = $props()

  let parseError = $state<string | undefined>(undefined)

  const jsonValue = $derived(JSON.stringify(config, null, 2))

  function handleChange(newValue: string) {
    try {
      const parsed: LegalEntityConfigResponse = JSON.parse(newValue)
      parseError = undefined
      onchange?.(parsed)
    } catch {
      parseError = 'Invalid JSON'
    }
  }
</script>

<CodeMirrorField
  {label}
  {readonly}
  name="legal-entity-config-editor"
  showLabel={false}
  value={jsonValue}
  lang={json()}
  error={errorProp ?? parseError}
  {minHeight}
  lineWrapping={true}
  onchange={handleChange} />
