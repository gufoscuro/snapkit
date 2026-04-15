<!--
  @component CustomerDetails
  @description Fetches and displays customer details. Provides customer data to page state
  so other snippets on the same page (e.g. CustomerSidebar) can consume it without a second request.
  @keywords customer, details, form
  @api GET /api/legal-entities/{legalEntity}/customers/{customer} (Moddo API)
-->
<script lang="ts" module>
  // eslint-disable-next-line no-import-assign
  export { CustomerDetailsContract as contract } from './CustomerDetails.contract.js'
</script>

<script lang="ts">
  import RequestPlaceholder from '$components/core/common/RequestPlaceholder.svelte'
  import BottomBar from '$components/core/form/BottomBar.svelte'
  import BusyButton from '$components/core/form/BusyButton.svelte'
  import CountryField from '$components/core/form/CountryField.svelte'
  import { FormFieldClass } from '$components/core/form/form.js'
  import FormErrorMessage from '$components/core/form/FormErrorMessage.svelte'
  import FormUtil from '$components/core/form/FormUtil.svelte'
  import LanguageCodeField from '$components/core/form/LanguageCodeField.svelte'
  import RichEditorField from '$components/core/form/RichEditorField.svelte'
  import SelectField from '$components/core/form/SelectField.svelte'
  import TextField from '$components/core/form/TextField.svelte'
  import { v } from '$components/core/form/validation'
  import { createCustomerFlagActions, type CustomerFlagOptions } from '$components/features/customers/customer-actions'
  import GroupTitle from '$components/features/globals/GroupTitle.svelte'
  import Separator from '$components/ui/separator/separator.svelte'
  import { RecordActionMenu } from '$lib/components/ui/record-action-menu'
  import { useProvides } from '$lib/contexts/page-state'
  import { useDetailRecord } from '$lib/hooks/use-detail-record.svelte'
  import * as m from '$lib/paraglide/messages'
  import type { Customer } from '$lib/types/api-types'
  import { useBreadcrumbTitle } from '$lib/utils/breadcrumb-title'
  import {
    annualRevenueRangeLabels,
    atecoCodeLabels,
    companySizeLabels,
    currencyLabels,
    customerTypeConfig,
    employeeCountRangeLabels,
    toSelectItems,
  } from '$lib/utils/enum-labels'
  import { api } from '$lib/utils/request'
  import { createRoute } from '$lib/utils/route-builder'
  import { DEFAULT_CURRENCY_CODE } from '$utils/prices.js'
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
    fetch: id => api.safe.get<Customer>(`/legal-entities/${legalEntityId}/customers/${id}`),
    create: data => api.post(`/legal-entities/${legalEntityId}/customers`, { data }),
    update: (id, data) => api.put(`/legal-entities/${legalEntityId}/customers/${id}`, { data }),
    getDetailRoute: record => createRoute({ $id: 'customer-details', params: { uuid: record.id } }),
    onFetched: data => {
      customerHandle.set(data)
      breadcrumbTitle.setLabel(pageDetails.config.$id, data.name)
    },
    cleanup: () => {
      customerHandle.unset()
      breadcrumbTitle.clearLabel(pageDetails.config.$id)
    },
  })

  const { handleSubmit, handleSuccess, handleFailure } = detail
  const record = $derived(detail.record)
  const promise = $derived(detail.promise)

  const flagActions = $derived(
    legalEntityId ? createCustomerFlagActions({ legalEntityId, onSuccess: detail.refetch }) : [],
  )
  const actionOptions = $derived.by((): CustomerFlagOptions | null => {
    if (!record) return null
    return {
      targetId: record.id,
      name: record.name,
      version: record.version,
      suspendedAt: record.suspended_at || null,
      ceasedAt: record.ceased_at || null,
    }
  })

  const initialValues = $derived.by(() => ({
    type: 'company' as const,
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
    default_currency: DEFAULT_CURRENCY_CODE,
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

  const atecoItems = toSelectItems(atecoCodeLabels)
  const companySizeItems = toSelectItems(companySizeLabels)
  const employeeCountItems = toSelectItems(employeeCountRangeLabels)
  const annualRevenueItems = toSelectItems(annualRevenueRangeLabels)
  const currencyItems = toSelectItems(currencyLabels)

  const validateCreate = v
    .schema<Partial<Customer>>({
      type: [v.required()],
      name: [v.required()],
      language_code: [v.required()],
      registration_country_code: [v.required()],
      default_currency: [v.required()],
      email: [v.email()],
    })
    .build()

  const validateUpdate = v
    .schema<Partial<Customer>>({
      email: [v.email()],
    })
    .build()

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
      {#snippet withContext(formAPI)}
        <FormErrorMessage columnsLayout />

        <GroupTitle heading={m.general_information()}>
          {#snippet description()}
            {m.general_information_description()}
          {/snippet}

          {#snippet content()}
            <SelectField
              name="type"
              label={m.type()}
              items={typeItems}
              class={FormFieldClass.MinWidth}
              disabled={!!record} />

            <TextField name="name" label={m.name()} class={FormFieldClass.MaxWidth} focus={!record} />
            <TextField
              name="last_name"
              label={m.last_name()}
              class={FormFieldClass.MaxWidth}
              hidden={formAPI?.values?.type !== 'individual'} />
            <TextField name="trade_name" label={m.trade_name()} class={FormFieldClass.MaxWidth} />
          {/snippet}
        </GroupTitle>

        <Separator />

        <GroupTitle heading={m.company_information()}>
          {#snippet description()}
            {m.company_information_description()}
          {/snippet}

          {#snippet content()}
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
          {/snippet}
        </GroupTitle>

        <Separator />

        <GroupTitle heading={m.fiscal_information()}>
          {#snippet description()}
            {m.fiscal_information_description()}
          {/snippet}

          {#snippet content()}
            <TextField name="vat_number" label={m.vat()} class={FormFieldClass.MaxWidth} />
            <TextField name="tax_id" label={m.tax_id()} class={FormFieldClass.MaxWidth} />
            <TextField name="sdi_code" label={m.sdi_code()} class={FormFieldClass.MaxWidth} />
            <TextField name="pec" label={m.pec()} class={FormFieldClass.MaxWidth} />
          {/snippet}
        </GroupTitle>

        <Separator />

        <GroupTitle heading={m.contact_information()}>
          {#snippet description()}
            {m.contact_information_description()}
          {/snippet}

          {#snippet content()}
            <TextField name="email" label={m.email()} class={FormFieldClass.MaxWidth} />
            <TextField name="phone" label={m.phone()} class={FormFieldClass.MaxWidth} />
            <TextField name="fax" label={m.fax()} class={FormFieldClass.MaxWidth} />
            <TextField name="website" label={m.website()} class={FormFieldClass.MaxWidth} />
          {/snippet}
        </GroupTitle>

        <Separator />

        <GroupTitle heading={m.localization_information()}>
          {#snippet description()}
            {m.localization_information_description()}
          {/snippet}

          {#snippet content()}
            <CountryField
              name="registration_country_code"
              label={m.registration_country_code()}
              class={FormFieldClass.MinWidth} />
            <SelectField
              name="default_currency"
              label={m.default_currency()}
              items={currencyItems}
              class={FormFieldClass.MinWidth} />
            <LanguageCodeField name="language_code" label={m.language_code()} class={FormFieldClass.MinWidth} />
          {/snippet}
        </GroupTitle>

        <Separator />

        <GroupTitle heading={m.notes()}>
          {#snippet description()}
            {m.notes_section_description()}
          {/snippet}

          {#snippet content()}
            <RichEditorField name="notes" label={m.notes()} width={FormFieldClass.MinWidth} />
          {/snippet}
        </GroupTitle>
      {/snippet}

      {#snippet bottom()}
        <BottomBar>
          {#if actionOptions}
            <RecordActionMenu buttonVariant="outline" actions={flagActions} {actionOptions} />
          {/if}

          <BusyButton type="submit">{m.save_changes()}</BusyButton>
        </BottomBar>
      {/snippet}
    </FormUtil>
  {/snippet}
</RequestPlaceholder>
