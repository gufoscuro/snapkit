<!--
  @component SupplierCommercialTerms
  @description Fetches and displays supplier commercial terms (1:1 resource).
  Handles both create and update. Provides supplier data to page state
  so SupplierSidebar can consume it.
  @keywords supplier, commercial-terms, form, billing, incoterm, payment
  @api GET /api/legal-entities/{legalEntity}/suppliers/{supplier}/commercial-terms (Moddo API)
  @api POST /api/legal-entities/{legalEntity}/suppliers/{supplier}/commercial-terms (Moddo API)
  @api PUT /api/legal-entities/{legalEntity}/suppliers/{supplier}/commercial-terms (Moddo API)
-->
<script lang="ts" module>
  // eslint-disable-next-line no-import-assign
  export { SupplierCommercialTermsContract as contract } from './SupplierCommercialTerms.contract.js'
</script>

<script lang="ts">
  import RequestPlaceholder from '$components/core/common/RequestPlaceholder.svelte'
  import BottomBar from '$components/core/form/BottomBar.svelte'
  import BusyButton from '$components/core/form/BusyButton.svelte'
  import { FormFieldClass } from '$components/core/form/form.js'
  import FormErrorMessage from '$components/core/form/FormErrorMessage.svelte'
  import FormUtil from '$components/core/form/FormUtil.svelte'
  import NumberField from '$components/core/form/NumberField.svelte'
  import SelectField from '$components/core/form/SelectField.svelte'
  import TextField from '$components/core/form/TextField.svelte'
  import { v } from '$components/core/form/validation'
  import PaymentTermSelector from '$components/features/form/PaymentTermSelector.svelte'
  import VatCodeSelector from '$components/features/form/VatCodeSelector.svelte'
  import GroupTitle from '$components/features/globals/GroupTitle.svelte'
  import Separator from '$components/ui/separator/separator.svelte'
  import { useProvides } from '$lib/contexts/page-state'
  import { useDetailRecord } from '$lib/hooks/use-detail-record.svelte'
  import * as m from '$lib/paraglide/messages'
  import type { Supplier, SupplierCommercialTerms } from '$lib/types/api-types'
  import { useBreadcrumbTitle } from '$lib/utils/breadcrumb-title'
  import { billingFrequencyLabels, billingTypeLabels, incotermLabels, toSelectItems } from '$lib/utils/enum-labels'
  import { api } from '$lib/utils/request'
  import { createRoute } from '$lib/utils/route-builder'
  import type { SnippetProps } from '$utils/runtime'
  import { onDestroy, onMount } from 'svelte'
  import { toast } from 'svelte-sonner'
  import { SupplierCommercialTermsContract } from './SupplierCommercialTerms.contract.js'

  let { pageDetails, legalEntity, entityConfig }: SnippetProps = $props()

  const resourceConfig = $derived(entityConfig?.resources?.['supplier-commercial-terms'])
  const supplierId = $derived(pageDetails.params.uuid)
  const legalEntityId = $derived(legalEntity?.id)

  const supplierHandle = useProvides(SupplierCommercialTermsContract, 'supplier')
  const breadcrumbTitle = useBreadcrumbTitle()

  onMount(async () => {
    if (legalEntityId && supplierId) {
      const supplier = await api.get<Supplier>(`/legal-entities/${legalEntityId}/suppliers/${supplierId}`)
      supplierHandle.set(supplier)
      breadcrumbTitle.setLabel('supplier-details', supplier.name)
    }
  })

  onDestroy(() => {
    supplierHandle.unset()
    breadcrumbTitle.clearLabel('supplier-details')
  })

  const basePath = $derived(`/legal-entities/${legalEntityId}/suppliers/${supplierId}/commercial-terms`)

  /**
   * Wraps the fetch to treat 404 as "not yet created" (returns null data, no error).
   * This prevents RequestPlaceholder from showing an error screen when the
   * 1:1 commercial terms resource doesn't exist yet.
   */
  async function fetchCommercialTerms() {
    const res = await api.safe.get<SupplierCommercialTerms>(basePath)
    if (res.error && res.error.status === 404) {
      return { data: null, error: null }
    }
    return res
  }

  const detail = useDetailRecord<SupplierCommercialTerms>({
    getUuid: () => supplierId,
    fetch: () => fetchCommercialTerms(),
    create: data => api.post(basePath, { data }),
    update: (_id, data) => api.put(basePath, { data }),
    getDetailRoute: () => createRoute({ $id: 'supplier-commercial-terms', params: { uuid: supplierId } }),
    onFetched: () => {
      breadcrumbTitle.setLabel(pageDetails.config.$id, m.commercial_terms())
    },
    cleanup: () => {
      breadcrumbTitle.clearLabel(pageDetails.config.$id)
    },
  })

  const { handleSubmit, handleFailure } = detail
  const record = $derived(detail.record)
  const promise = $derived(detail.promise)

  /**
   * Custom success handler for 1:1 resource.
   * After create, refetch instead of navigating (we're already on the right page).
   */
  function handleSuccess({ result }: { result: unknown }) {
    toast.success(m.changes_saved())
    if (!record) {
      detail.refetch()
    } else if (result) {
      detail.refetch()
    }
  }

  const initialValues = $derived.by(() => ({
    payment_term_id: '',
    vat_code_id: '',
    iban: '',
    bic_swift: '',
    support_bank: '',
    trade_discount: undefined,
    incoterm: '' as const,
    incoterm_place: '',
    free_shipping_threshold: undefined,
    minimum_order_value: undefined,
    billing_type: '' as const,
    billing_frequency: null as string | null,
    ...(record ?? {}),
  }))

  const incotermItems = toSelectItems(incotermLabels)
  const billingTypeItems = toSelectItems(billingTypeLabels)
  const billingFrequencyItems = toSelectItems(billingFrequencyLabels)

  const validateCreate = v
    .schema<Partial<SupplierCommercialTerms>>({
      payment_term_id: [v.required()],
      vat_code_id: [v.required()],
      incoterm: [v.required()],
      billing_type: [v.required()],
    })
    .build()

  const validateUpdate = v.schema<Partial<SupplierCommercialTerms>>({}).build()

  const validate = $derived(!record ? validateCreate : validateUpdate)
</script>

<RequestPlaceholder {promise}>
  {#snippet content()}
    <FormUtil
      {initialValues}
      {validate}
      {resourceConfig}
      onSubmit={handleSubmit}
      onSuccess={handleSuccess}
      onFailure={handleFailure}
      class="relative flex flex-col gap-6 pb-breadcrumbs">
      {#snippet withContext()}
        <FormErrorMessage columnsLayout />

        <GroupTitle heading={m.payment_information()}>
          {#snippet description()}
            {m.payment_information_description()}
          {/snippet}

          {#snippet content()}
            <PaymentTermSelector name="payment_term_id" attr={record?.payment_term} />
            <VatCodeSelector name="vat_code_id" direction="acquisto" attr={record?.vat_code} />
            <TextField name="iban" label={m.bank_iban()} class={FormFieldClass.MaxWidth} />
            <TextField name="bic_swift" label={m.bic_swift()} class={FormFieldClass.MaxWidth} />
            <TextField name="support_bank" label={m.support_bank()} class={FormFieldClass.MaxWidth} />
            <NumberField name="trade_discount" label={m.trade_discount()} class={FormFieldClass.MinWidth} />
          {/snippet}
        </GroupTitle>

        <Separator />

        <GroupTitle heading={m.billing_information()}>
          {#snippet description()}
            {m.billing_information_description()}
          {/snippet}

          {#snippet content()}
            <SelectField
              name="billing_type"
              label={m.billing_type()}
              items={billingTypeItems}
              class={FormFieldClass.MinWidth} />
            <SelectField
              name="billing_frequency"
              label={m.billing_frequency()}
              items={billingFrequencyItems}
              class={FormFieldClass.MinWidth} />
          {/snippet}
        </GroupTitle>

        <Separator />

        <GroupTitle heading={m.delivery_conditions()}>
          {#snippet description()}
            {m.delivery_conditions_description()}
          {/snippet}

          {#snippet content()}
            <SelectField
              name="incoterm"
              label={m.incoterm()}
              items={incotermItems}
              class={FormFieldClass.MinWidth} />
            <TextField name="incoterm_place" label={m.incoterm_location()} class={FormFieldClass.MaxWidth} />
            <NumberField
              name="free_shipping_threshold"
              label={m.free_shipping_threshold()}
              class={FormFieldClass.MinWidth} />
            <NumberField
              name="minimum_order_value"
              label={m.minimum_order_value()}
              class={FormFieldClass.MinWidth} />
          {/snippet}
        </GroupTitle>
      {/snippet}

      {#snippet bottom()}
        <BottomBar>
          <BusyButton type="submit">{m.save_changes()}</BusyButton>
        </BottomBar>
      {/snippet}
    </FormUtil>
  {/snippet}
</RequestPlaceholder>
