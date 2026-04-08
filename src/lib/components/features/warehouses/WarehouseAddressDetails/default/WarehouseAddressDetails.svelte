<!--
  @component WarehouseAddressDetails
  @description Form for creating or updating the single address of a warehouse.
  @keywords warehouse, address, details, form, settings
  @api GET /api/legal-entities/{legalEntity}/warehouses/{warehouse}/address (Moddo API)
  @api POST /api/legal-entities/{legalEntity}/warehouses/{warehouse}/address (Moddo API)
  @api PUT /api/legal-entities/{legalEntity}/warehouses/{warehouse}/address (Moddo API)
-->
<script lang="ts">
  import BottomBar from '$components/core/form/BottomBar.svelte'
  import BusyButton from '$components/core/form/BusyButton.svelte'
  import CountryField from '$components/core/form/CountryField.svelte'
  import { FormFieldClass } from '$components/core/form/form.js'
  import FormErrorMessage from '$components/core/form/FormErrorMessage.svelte'
  import FormUtil from '$components/core/form/FormUtil.svelte'
  import TextField from '$components/core/form/TextField.svelte'
  import { v } from '$components/core/form/validation'
  import * as m from '$lib/paraglide/messages'
  import type { LegalEntity, WarehouseAddress } from '$lib/types/api-types'
  import { api } from '$lib/utils/request'
  import { onMount } from 'svelte'

  let { legalEntity, warehouseId }: { legalEntity?: LegalEntity | null; warehouseId?: string } = $props()

  const legalEntityId = $derived(legalEntity?.id)

  let address = $state<WarehouseAddress | null>(null)
  let loading = $state(true)

  onMount(async () => {
    if (legalEntityId && warehouseId) {
      const { data } = await api.safe.get<WarehouseAddress>(
        `/legal-entities/${legalEntityId}/warehouses/${warehouseId}/address`,
      )
      address = data || null
    }
    loading = false
  })

  const initialValues = $derived.by(() => ({
    address_line_1: '',
    address_line_2: '',
    city: '',
    province: '',
    postal_code: '',
    country_code: '',
    ...(address ?? {}),
  }))

  const validateCreate = v
    .schema<Partial<WarehouseAddress>>({
      address_line_1: [v.required(), v.maxLength(255)],
      city: [v.required(), v.maxLength(255)],
      postal_code: [v.required(), v.maxLength(20)],
    })
    .build()

  const validateUpdate = v
    .schema<Partial<WarehouseAddress>>({
      address_line_1: [v.maxLength(255)],
      city: [v.maxLength(255)],
      postal_code: [v.maxLength(20)],
    })
    .build()

  const validate = $derived(!address ? validateCreate : validateUpdate)

  async function handleSubmit(values: Partial<WarehouseAddress>) {
    if (address) {
      return api.put(`/legal-entities/${legalEntityId}/warehouses/${warehouseId}/address`, {
        data: { ...values, version: address.version },
      })
    } else {
      return api.post(`/legal-entities/${legalEntityId}/warehouses/${warehouseId}/address`, { data: values })
    }
  }

  function handleSuccess({ result }: { result: unknown }) {
    address = result as WarehouseAddress
  }
</script>

{#if !loading}
  <FormUtil
    {initialValues}
    {validate}
    onSubmit={handleSubmit}
    onSuccess={handleSuccess}
    class="flex flex-col gap-4">
    {#snippet withContext()}
      <FormErrorMessage />

      <TextField name="address_line_1" label={m.address_line_1()} class={FormFieldClass.MaxWidth} focus={!address} />
      <TextField name="address_line_2" label={m.address_line_2()} class={FormFieldClass.MaxWidth} />
      <TextField name="city" label={m.city()} class={FormFieldClass.MaxWidth} />
      <TextField name="province" label={m.province()} class={FormFieldClass.MaxWidth} />
      <TextField name="postal_code" label={m.postal_code()} class={FormFieldClass.MaxWidth} />
      <CountryField name="country_code" label={m.country_code()} class={FormFieldClass.MinWidth} />

      <BottomBar>
        <BusyButton type="submit">{m.save_changes()}</BusyButton>
      </BottomBar>
    {/snippet}
  </FormUtil>
{/if}
