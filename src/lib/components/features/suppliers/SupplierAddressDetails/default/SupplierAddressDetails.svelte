<!--
  @component SupplierAddressDetails
  @description Fetches and displays supplier address details. Handles both create and update.
  Provides supplier data to page state so other snippets (e.g. SupplierSidebar) can consume it.
  @keywords supplier, address, details, form, upsert
  @api GET /api/legal-entities/{legalEntity}/suppliers/{supplier}/addresses/{address} (Moddo API)
  @api POST /api/legal-entities/{legalEntity}/suppliers/{supplier}/addresses (Moddo API)
  @api PUT /api/legal-entities/{legalEntity}/suppliers/{supplier}/addresses/{address} (Moddo API)
-->
<script lang="ts" module>
  // eslint-disable-next-line no-import-assign
  export { SupplierAddressDetailsContract as contract } from './SupplierAddressDetails.contract.js'
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
  import type { Supplier, SupplierAddress } from '$lib/types/api-types'
  import { useBreadcrumbTitle } from '$lib/utils/breadcrumb-title'
  import { supplierAddressTypeConfig } from '$lib/utils/enum-labels'
  import { api } from '$utils/request.js'
  import { createRoute } from '$lib/utils/route-builder'
  import type { SnippetProps } from '$utils/runtime'
  import { onDestroy, onMount } from 'svelte'
  import { SupplierAddressDetailsContract } from './SupplierAddressDetails.contract.js'

  let { pageDetails, legalEntity }: SnippetProps = $props()

  const uuid = $derived(pageDetails.params.aid)
  const supplierId = $derived(pageDetails.params.uuid)
  const legalEntityId = $derived(legalEntity?.id)

  const supplierHandle = useProvides(SupplierAddressDetailsContract, 'supplier')
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

  const detail = useDetailRecord<SupplierAddress>({
    getUuid: () => uuid,
    fetch: id => api.safe.get<SupplierAddress>(`/legal-entities/${legalEntityId}/suppliers/${supplierId}/addresses/${id}`),
    create: data => api.post(`/legal-entities/${legalEntityId}/suppliers/${supplierId}/addresses`, { data }),
    update: (id, data) => api.put(`/legal-entities/${legalEntityId}/suppliers/${supplierId}/addresses/${id}`, { data }),
    getDetailRoute: record => createRoute({ $id: 'supplier-address-details', params: { uuid: record.id } }),
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

  const typeItems = Object.entries(supplierAddressTypeConfig).map(([value, cfg]) => ({ value, label: cfg.label() }))

  const validateCreate = v
    .schema<Partial<SupplierAddress>>({
      type: [v.required()],
      address_line_1: [v.required()],
      city: [v.required()],
      postal_code: [v.required()],
      country_code: [v.required()],
    })
    .build()

  const validateUpdate = v.schema<Partial<SupplierAddress>>({}).build()

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
