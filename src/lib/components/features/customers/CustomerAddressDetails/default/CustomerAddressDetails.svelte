<!--
  @component CustomerAddressDetails
  @description Fetches and displays customer address details. Handles both create and update.
  Provides customer data to page state so other snippets (e.g. CustomerSidebar) can consume it.
  @keywords customer, address, details, form, upsert
  @api GET /api/legal-entities/{legalEntity}/customers/{customer}/addresses/{address} (Moddo API)
  @api POST /api/legal-entities/{legalEntity}/customers/{customer}/addresses (Moddo API)
  @api PUT /api/legal-entities/{legalEntity}/customers/{customer}/addresses/{address} (Moddo API)
-->
<script lang="ts" module>
  // eslint-disable-next-line no-import-assign
  export { CustomerAddressDetailsContract as contract } from './CustomerAddressDetails.contract.js'
</script>

<script lang="ts">
  import RequestPlaceholder from '$components/core/common/RequestPlaceholder.svelte'
  import BottomBar from '$components/core/form/BottomBar.svelte'
  import BusyButton from '$components/core/form/BusyButton.svelte'
  import CountryField from '$components/core/form/CountryField.svelte'
  import { FormFieldClass } from '$components/core/form/form.js'
  import FormErrorMessage from '$components/core/form/FormErrorMessage.svelte'
  import FormUtil from '$components/core/form/FormUtil.svelte'
  import SelectField from '$components/core/form/SelectField.svelte'
  import SwitchField from '$components/core/form/SwitchField.svelte'
  import TextField from '$components/core/form/TextField.svelte'
  import { v } from '$components/core/form/validation'
  import { useProvides } from '$lib/contexts/page-state'
  import { useDetailRecord } from '$lib/hooks/use-detail-record.svelte'
  import * as m from '$lib/paraglide/messages'
  import type { Customer, CustomerAddress } from '$lib/types/api-types'
  import { useBreadcrumbTitle } from '$lib/utils/breadcrumb-title'
  import { addressTypeConfig } from '$lib/utils/enum-labels'
  import { api } from '$utils/request.js'
  import { createRoute } from '$lib/utils/route-builder'
  import type { SnippetProps } from '$utils/runtime'
  import { onDestroy, onMount } from 'svelte'
  import { CustomerAddressDetailsContract } from './CustomerAddressDetails.contract.js'

  let { pageDetails, legalEntity }: SnippetProps = $props()

  const uuid = $derived(pageDetails.params.aid)
  const customerId = $derived(pageDetails.params.uuid)
  const legalEntityId = $derived(legalEntity?.id)

  const customerHandle = useProvides(CustomerAddressDetailsContract, 'customer')
  const breadcrumbTitle = useBreadcrumbTitle()

  onMount(async () => {
    if (legalEntityId && customerId) {
      const customer = await api.get<Customer>(`/legal-entities/${legalEntityId}/customers/${customerId}`)
      customerHandle.set(customer)
      breadcrumbTitle.setLabel('customer-details', customer.name)
    }
  })

  onDestroy(() => {
    customerHandle.unset()
    breadcrumbTitle.clearLabel('customer-details')
  })

  const detail = useDetailRecord<CustomerAddress>({
    getUuid: () => uuid,
    fetch: id => api.safe.get<CustomerAddress>(`/legal-entities/${legalEntityId}/customers/${customerId}/addresses/${id}`),
    create: data => api.post(`/legal-entities/${legalEntityId}/customers/${customerId}/addresses`, { data }),
    update: (id, data) => api.put(`/legal-entities/${legalEntityId}/customers/${customerId}/addresses/${id}`, { data }),
    getDetailRoute: record => createRoute({ $id: 'customer-address-details', params: { uuid: record.id } }),
    onFetched: data => {
      breadcrumbTitle.setLabel(pageDetails.config.$id, data.address_line_1)
    },
    cleanup: () => {
      breadcrumbTitle.clearLabel(pageDetails.config.$id)
    },
  })

  const { handleSubmit, handleSuccess, handleFailure } = detail
  const record = $derived(detail.record)
  const promise = $derived(detail.promise)

  const initialValues = $derived.by(() => ({
    type: 'billing' as const,
    is_default: false,
    address_line_1: '',
    address_line_2: '',
    city: '',
    province: '',
    region: '',
    postal_code: '',
    country_code: '',
    receiving_hours: '',
    delivery_instructions: '',
    warehouse_assignment: '',
    ...(record ?? {}),
  }))

  const typeItems = Object.entries(addressTypeConfig).map(([value, cfg]) => ({ value, label: cfg.label() }))

  const validateCreate = v
    .schema<Partial<CustomerAddress>>({
      type: [v.required()],
      address_line_1: [v.required()],
      city: [v.required()],
      postal_code: [v.required()],
      country_code: [v.required()],
    })
    .build()

  const validateUpdate = v.schema<Partial<CustomerAddress>>({}).build()

  const validate = $derived(!record ? validateCreate : validateUpdate)
</script>

<RequestPlaceholder {promise}>
  {#snippet content()}
    <FormUtil
      {initialValues}
      {validate}
      onSubmit={handleSubmit}
      onSuccess={handleSuccess}
      onFailure={handleFailure}
      class="relative flex flex-col gap-4 pb-breadcrumbs">
      {#snippet withContext()}
        <FormErrorMessage />

        <SelectField
          name="type"
          label={m.type()}
          items={typeItems}
          class={FormFieldClass.MinWidth} />

        <SwitchField name="is_default" label={m.is_default()} />

        <TextField name="address_line_1" label={m.address_line_1()} class={FormFieldClass.MaxWidth} focus={!record} />
        <TextField name="address_line_2" label={m.address_line_2()} class={FormFieldClass.MaxWidth} />
        <TextField name="city" label={m.city()} class={FormFieldClass.MaxWidth} />
        <TextField name="province" label={m.province()} class={FormFieldClass.MaxWidth} />
        <TextField name="region" label={m.region()} class={FormFieldClass.MaxWidth} />
        <TextField name="postal_code" label={m.postal_code()} class={FormFieldClass.MaxWidth} />
        <CountryField name="country_code" label={m.country_code()} class={FormFieldClass.MinWidth} />
        <TextField name="receiving_hours" label={m.receiving_hours()} class={FormFieldClass.MaxWidth} />
        <TextField name="delivery_instructions" label={m.delivery_instructions()} class={FormFieldClass.MaxWidth} />
        <TextField name="warehouse_assignment" label={m.warehouse_assignment()} class={FormFieldClass.MaxWidth} />
      {/snippet}

      {#snippet bottom()}
        <BottomBar>
          <BusyButton type="submit">{m.save_changes()}</BusyButton>
        </BottomBar>
      {/snippet}
    </FormUtil>
  {/snippet}
</RequestPlaceholder>
