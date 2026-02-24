<!--
  @component CustomerDetails
  @description Fetches and displays customer details. Provides customer data to page state
  so other snippets on the same page (e.g. CustomerSidebar) can consume it without a second request.
  @keywords customer, details, form
  @api GET /api/legal-entities/{legalEntity}/customers/{customer} (Moddo API)
-->
<script lang="ts" module>
  export { CustomerDetailsContract as contract } from './CustomerDetails.contract.js'
</script>

<script lang="ts">
  import RequestPlaceholder from '$components/core/common/RequestPlaceholder.svelte'
  import BusyButton from '$components/core/form/BusyButton.svelte'
  import FieldVisibility from '$components/core/form/FieldVisibility.svelte'
  import { FormFieldClass } from '$components/core/form/form.js'
  import FormUtil, { type FailurePayload, type SuccessPayload } from '$components/core/form/FormUtil.svelte'
  import SelectField from '$components/core/form/SelectField.svelte'
  import TextField from '$components/core/form/TextField.svelte'
  import { v } from '$components/core/form/validation'
  import { useProvides } from '$lib/contexts/page-state'
  import * as m from '$lib/paraglide/messages'
  import type { Customer } from '$lib/types/api-types'
  import { useBreadcrumbTitle } from '$lib/utils/breadcrumb-title'
  import { customerStatusConfig, customerTypeConfig } from '$lib/utils/enum-labels'
  import { apiRequest, safeApiRequest, type SafeApiResponse } from '$lib/utils/request'
  import type { SnippetProps } from '$utils/runtime'
  import { onMount } from 'svelte'
  import { toast } from 'svelte-sonner'
  import { CustomerDetailsContract } from './CustomerDetails.contract.js'

  let snippetProps: SnippetProps = $props()
  let { pageDetails, legalEntity } = $derived(snippetProps)
  let customer = $state<Customer | null>(null)
  let promise = $state<Promise<SafeApiResponse<Customer>> | null>(null)
  let initialValues: Partial<Customer> = $derived.by(() => ({
    type: 'company',
    status: 'active',
    name: '',
    last_name: '',
    trade_name: '',
    vat_number: '',
    tax_id: '',
    email: '',
    phone: '',
    pec: '',
    language_code: '',
    registration_country_code: '',
    ...(customer ? customer : {}),
  }))

  const customerHandle = useProvides(CustomerDetailsContract, 'customer')
  const breadcrumbTitle = useBreadcrumbTitle()
  const uuid = $derived(pageDetails.params.uuid)
  const legalEntityId = $derived(legalEntity?.id)

  const typeItems = Object.entries(customerTypeConfig).map(([value, cfg]) => ({ value, label: cfg.label() }))
  const statusItems = Object.entries(customerStatusConfig).map(([value, cfg]) => ({ value, label: cfg.label() }))

  const validate = v
    .schema<Partial<Customer>>({
      name: [v.required()],
      email: [v.required(), v.email()],
      vat_number: [v.required()],
    })
    .build()

  async function fetchCustomer() {
    if (!legalEntityId || !uuid) return

    promise = safeApiRequest<Customer>({
      url: `/legal-entities/${legalEntityId}/customers/${uuid}`,
      method: 'GET',
    })
    const { data } = await promise

    customer = data
    if (data) {
      customerHandle.set(data)
      breadcrumbTitle.set(data.name)
    }
  }

  async function handleSubmit(values: Partial<Customer>): Promise<void> {
    console.log('Form submitted with values:', values)

    return apiRequest({
      method: 'PUT',
      url: `/legal-entities/${legalEntityId}/customers/${uuid}`,
      data: {
        ...values,
        custom_fields: {},
      },
    })
  }

  function handleSuccess({ result }: SuccessPayload<Partial<Customer>>) {
    if (result) customer = result as Customer

    toast.success(m.changes_saved())
    console.log('Success callback:', result)
  }

  function handleFailure(payload: FailurePayload) {
    toast.error(m.common_error())
    console.error('Failure callback:', payload)
  }

  onMount(() => {
    fetchCustomer()

    return () => {
      customerHandle.unset()
      breadcrumbTitle.clear()
    }
  })
</script>

<RequestPlaceholder {promise}>
  {#snippet content()}
    <FormUtil
      {initialValues}
      {validate}
      onSubmit={handleSubmit}
      onSuccess={handleSuccess}
      onFailure={handleFailure}
      class="flex flex-col gap-4">
      <SelectField name="status" label={m.status()} items={statusItems} class={FormFieldClass.MinWidth} />
      <SelectField name="type" label={m.type()} items={typeItems} class={FormFieldClass.MinWidth} />

      <TextField name="name" label={m.name()} class={FormFieldClass.MaxWidth} focus={!customer} />

      <FieldVisibility name="last_name" {...snippetProps}>
        <TextField name="last_name" label={m.last_name()} class={FormFieldClass.MaxWidth} />
      </FieldVisibility>

      <TextField name="trade_name" label={m.trade_name()} class={FormFieldClass.MaxWidth} />
      <TextField name="vat_number" label={m.vat()} class={FormFieldClass.MaxWidth} />
      <TextField name="tax_id" label={m.tax_id()} class={FormFieldClass.MaxWidth} />
      <TextField name="email" label={m.email()} class={FormFieldClass.MaxWidth} />
      <TextField name="phone" label={m.phone()} class={FormFieldClass.MaxWidth} />

      <div class="fixed right-0 bottom-0 flex h-14 w-full items-center justify-end px-4">
        <BusyButton type="submit">{m.save_changes()}</BusyButton>
      </div>
    </FormUtil>
  {/snippet}
</RequestPlaceholder>
