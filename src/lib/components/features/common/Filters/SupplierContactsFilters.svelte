<!--
  @component SupplierContactsFilters
  @description A filter component that provides filter state to sibling components.
  Positioned on the right side with an "Add" button that links to the contact detail page.
  Provides filter state consumable by SupplierContactsTable.
  @keywords filter, contacts, suppliers
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
  const supplierId = $derived(props.pageDetails?.params?.uuid)
</script>

<GenericFilters {...props} hideSearch>
  <Button variant="default" href={createRoute({ $id: 'supplier-contact-details', params: { uuid: supplierId } })}>
    {m.add_new_supplier_contact()}
  </Button>
</GenericFilters>
