<script lang="ts">
  import FormGenericMultiSelector from '$lib/components/core/form/FormGenericMultiSelector.svelte'
  import * as m from '$lib/paraglide/messages.js'
  import type { DocumentTag } from '$lib/types/api-types'
  import { apiRequest } from '$lib/utils/request'

  type Props = {
    legalEntityId: string
    name?: string
    value?: string[]
    onChange?: (slugs: string[]) => void
    showLabel?: boolean
  }

  let { legalEntityId, name = 'tags', value = [], onChange, showLabel = true }: Props = $props()

  async function fetchTags() {
    const response = await apiRequest<{ data: DocumentTag[] }>({
      url: `/legal-entities/${legalEntityId}/document-tags`,
    })
    return response.data ?? (response as unknown as DocumentTag[])
  }
</script>

<FormGenericMultiSelector
  {name}
  label={m.document_tags()}
  placeholder={m.select_tags()}
  {value}
  {showLabel}
  fetchFunction={fetchTags}
  optionMappingFunction={tag => ({ label: tag.name, value: tag.slug, attr: tag })}
  onChange={items => onChange?.(items.map(i => i.label))}
  allowCreate />
