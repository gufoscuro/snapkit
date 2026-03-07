<!--
  @component PaymentTermsFilters
  @description A filter component that provides filter state to sibling components.
  Positioned on the right side with an "Add" button. Search is hidden for settings sections.
  Provides filter state consumable by PaymentTermsTable.
  @keywords filter, payment-terms, settings
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
  import type { SnippetProps } from '$utils/runtime'

  const props: SnippetProps = $props()
</script>

<GenericFilters {...props} hideSearch>
  <Button variant="default" href="/settings/payment-terms/upsert">
    {m.add_new_payment_term()}
  </Button>
</GenericFilters>
