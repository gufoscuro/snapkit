<!--
  @component CustomerAddressesFilters
  @description A filter component that provides filter state to sibling components.
  Positioned on the right side with an "Add" button that links to the address detail page.
  Provides filter state consumable by CustomerAddressesTable.
  @keywords filter, addresses, customers
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
  const customerId = $derived(props.pageDetails?.params?.uuid)
</script>

<GenericFilters {...props} hideSearch>
  <Button variant="default" href={createRoute({ $id: 'customer-address-details', params: { uuid: customerId } })}>
    {m.add_new_customer_address()}
  </Button>
</GenericFilters>
