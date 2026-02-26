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
  import CountryField from '$components/core/form/CountryField.svelte'
  import { FormFieldClass } from '$components/core/form/form.js'
  import FormUtil from '$components/core/form/FormUtil.svelte'
  import RichEditorField from '$components/core/form/RichEditorField.svelte'
  import SelectField from '$components/core/form/SelectField.svelte'
  import StatusSelector, { type StatusOption } from '$components/core/form/StatusSelector.svelte'
  import TextField from '$components/core/form/TextField.svelte'
  import { v } from '$components/core/form/validation'
  import { useProvides } from '$lib/contexts/page-state'
  import { useDetailRecord } from '$lib/hooks/use-detail-record.svelte'
  import * as m from '$lib/paraglide/messages'
  import type { Customer } from '$lib/types/api-types'
  import { useBreadcrumbTitle } from '$lib/utils/breadcrumb-title'
  import { customerStatusConfig, customerTypeConfig } from '$lib/utils/enum-labels'
  import type { SnippetProps } from '$utils/runtime'
  import { CustomerDetailsContract } from './CustomerDetails.contract.js'

  let { pageDetails, legalEntity, entityConfig }: SnippetProps = $props()

  const resourceConfig = $derived(entityConfig?.resources?.['customers'])
  const uuid = $derived(pageDetails.params.uuid)
  const legalEntityId = $derived(legalEntity?.id)

  const customerHandle = useProvides(CustomerDetailsContract, 'customer')
  const breadcrumbTitle = useBreadcrumbTitle()

  const detail = useDetailRecord<Customer>({
    getUuid: () => uuid,
    fetchUrl: id => `/legal-entities/${legalEntityId}/customers/${id}`,
    createUrl: () => `/legal-entities/${legalEntityId}/customers`,
    updateUrl: id => `/legal-entities/${legalEntityId}/customers/${id}`,
    detailPageId: 'customer-details',
    onFetched: data => {
      customerHandle.set(data)
      breadcrumbTitle.set(data.name)
    },
    cleanup: () => {
      customerHandle.unset()
      breadcrumbTitle.clear()
    },
    extraSubmitData: {
      custom_fields: [],
    },
  })

  const { handleSubmit, handleSuccess, handleFailure } = detail
  const record = $derived(detail.record)
  const promise = $derived(detail.promise)

  const initialValues = $derived.by(() => ({
    type: 'company' as const,
    status: 'active' as const,
    name: '',
    last_name: '',
    trade_name: '',
    eori_code: '',
    ateco_code: null,
    parent_id: '',
    company_size: null,
    employee_count_range: null,
    annual_revenue_range: null,
    founded_year: null,
    language_code: '',
    registration_country_code: '',
    vat_number: '',
    tax_id: '',
    sdi_code: '',
    pec: '',
    email: '',
    phone: '',
    fax: '',
    website: '',
    notes: '',
    ...(record ?? {}),
  }))

  const typeItems = Object.entries(customerTypeConfig).map(([value, cfg]) => ({ value, label: cfg.label() }))
  const customerStatuses: StatusOption[] = Object.entries(customerStatusConfig).map(([value, cfg]) => ({
    value,
    label: cfg.label(),
    variant:
      (
        { active: 'active', prospect: 'in-progress', suspended: 'paused', blocked: 'blocked' } as Record<
          string,
          StatusOption['variant']
        >
      )[value] ?? 'neutral',
  }))

  const atecoItems = [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
  ].map(code => ({ value: code, label: code }))
  const companySizeItems = [
    { value: 'micro', label: 'Micro' },
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' },
    { value: 'enterprise', label: 'Enterprise' },
  ]
  const employeeCountItems = [
    { value: '1_9', label: '1–9' },
    { value: '10_49', label: '10–49' },
    { value: '50_249', label: '50–249' },
    { value: '250_999', label: '250–999' },
    { value: '1000_plus', label: '1000+' },
  ]
  const annualRevenueItems = [
    { value: 'under_2m', label: '< 2M' },
    { value: '2m_10m', label: '2M–10M' },
    { value: '10m_50m', label: '10M–50M' },
    { value: '50m_250m', label: '50M–250M' },
    { value: 'over_250m', label: '> 250M' },
  ]

  const validateCreate = v
    .schema<Partial<Customer>>({
      type: [v.required()],
      name: [v.required()],
      status: [v.required()],
      language_code: [v.required()],
      registration_country_code: [v.required()],
      email: [v.email()],
    })
    .build()

  const validateUpdate = v
    .schema<Partial<Customer>>({
      email: [v.email()],
    })
    .build()

  const validate = $derived(!!record ? validateUpdate : validateCreate)
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
      class="flex flex-col gap-4">
      {#snippet withContext(formAPI)}
        <!-- <div class="sticky top-breadcrumbs z-10 bg-background py-3 font-semibold">Informazioni generali</div> -->
        <SelectField
          name="type"
          label={m.type()}
          items={typeItems}
          class={FormFieldClass.MinWidth}
          disabled={!!record} />

        <div class={FormFieldClass.MaxWidth}>
          <StatusSelector
            name="status"
            label={m.status()}
            statuses={customerStatuses}
            class={FormFieldClass.MinWidth}
            allowClear={false} />
        </div>

        <TextField name="name" label={m.name()} class={FormFieldClass.MaxWidth} focus={!record} />
        <TextField
          name="last_name"
          label={m.last_name()}
          class={FormFieldClass.MaxWidth}
          hidden={formAPI?.values?.type !== 'individual'} />

        <TextField name="trade_name" label={m.trade_name()} class={FormFieldClass.MaxWidth} />
        <TextField name="eori_code" label={m.eori_code()} class={FormFieldClass.MaxWidth} />
        <SelectField name="ateco_code" label={m.ateco_code()} items={atecoItems} class={FormFieldClass.MinWidth} />
        <SelectField
          name="company_size"
          label={m.company_size()}
          items={companySizeItems}
          class={FormFieldClass.MinWidth} />
        <SelectField
          name="employee_count_range"
          label={m.employee_count_range()}
          items={employeeCountItems}
          class={FormFieldClass.MinWidth} />
        <SelectField
          name="annual_revenue_range"
          label={m.annual_revenue_range()}
          items={annualRevenueItems}
          class={FormFieldClass.MinWidth} />
        <TextField name="founded_year" label={m.founded_year()} class={FormFieldClass.MaxWidth} />

        <!-- <div class="sticky top-breadcrumbs z-10 bg-background py-3 font-semibold">Informazioni fiscali</div> -->

        <TextField name="vat_number" label={m.vat()} class={FormFieldClass.MaxWidth} />
        <TextField name="tax_id" label={m.tax_id()} class={FormFieldClass.MaxWidth} />
        <TextField name="sdi_code" label={m.sdi_code()} class={FormFieldClass.MaxWidth} />
        <TextField name="pec" label={m.pec()} class={FormFieldClass.MaxWidth} />
        <TextField name="email" label={m.email()} class={FormFieldClass.MaxWidth} />
        <TextField name="phone" label={m.phone()} class={FormFieldClass.MaxWidth} />
        <TextField name="fax" label={m.fax()} class={FormFieldClass.MaxWidth} />
        <TextField name="website" label={m.website()} class={FormFieldClass.MaxWidth} />

        <CountryField
          name="registration_country_code"
          label={m.registration_country_code()}
          class={FormFieldClass.MinWidth} />
        <TextField name="language_code" label={m.language_code()} class={FormFieldClass.MaxWidth} />

        <RichEditorField name="notes" label={m.notes()} width={FormFieldClass.MaxWidth} />

        <div class="fixed right-0 bottom-0 flex h-14 w-full items-center justify-end px-4">
          <BusyButton type="submit">{m.save_changes()}</BusyButton>
        </div>
      {/snippet}
    </FormUtil>
  {/snippet}
</RequestPlaceholder>
