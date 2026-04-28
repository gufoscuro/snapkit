<!--
  @component TransportDocumentsFilters
  @description A search filter component that provides filter state to sibling components.
  Positioned on the right side with a search input field.
  Provides filter state consumable by TransportDocumentsTable.
  @keywords filter, search, transport-documents, ddt, common
  @uses GenericFilters
  @provides filters
-->

<script lang="ts" module>
  export { GenericFiltersContract as contract } from '../GenericFilters/default/GenericFilters.contract.js'
</script>

<script lang="ts">
  import GenericFilters from '$components/features/common/GenericFilters/default/GenericFilters.svelte'
  import Button from '$components/ui/button/button.svelte'
  import * as m from '$lib/paraglide/messages'
  import { createRoute } from '$utils/route-builder.js'
  import type { SnippetProps } from '$utils/runtime'

  const props: SnippetProps = $props()
</script>

<GenericFilters {...props}>
  <Button variant="default" href={createRoute({ $id: 'transport-document-details' })}>
    {m.add_new_transport_document()}
  </Button>
</GenericFilters>
