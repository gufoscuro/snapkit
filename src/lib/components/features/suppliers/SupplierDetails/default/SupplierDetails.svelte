<!--
  @component SupplierDetails
  @description Fetches and displays supplier details. Provides supplier data to page state
  so other snippets on the same page (e.g. SupplierSidebar) can consume it without a second request.
  @keywords supplier, details, form
  @api GET /api/legal-entities/{legalEntity}/suppliers/{supplier} (Moddo API)
-->
<script lang="ts" module>
  // eslint-disable-next-line no-import-assign
  export { SupplierDetailsContract as contract } from './SupplierDetails.contract.js'
</script>

<script lang="ts">
  import RequestPlaceholder from '$components/core/common/RequestPlaceholder.svelte'
  import BusyButton from '$components/core/form/BusyButton.svelte'
  import CountryField from '$components/core/form/CountryField.svelte'
  import { FormFieldClass } from '$components/core/form/form.js'
  import FormErrorMessage from '$components/core/form/FormErrorMessage.svelte'
  import FormUtil from '$components/core/form/FormUtil.svelte'
  import RichEditorField from '$components/core/form/RichEditorField.svelte'
  import SelectField from '$components/core/form/SelectField.svelte'
  import StatusSelector, { type StatusOption } from '$components/core/form/StatusSelector.svelte'
  import TextField from '$components/core/form/TextField.svelte'
  import { v } from '$components/core/form/validation'
  import GroupTitle from '$components/features/globals/GroupTitle.svelte'
  import Separator from '$components/ui/separator/separator.svelte'
  import { useProvides } from '$lib/contexts/page-state'
  import { useDetailRecord } from '$lib/hooks/use-detail-record.svelte'
  import * as m from '$lib/paraglide/messages'
  import type { Supplier } from '$lib/types/api-types'
  import { useBreadcrumbTitle } from '$lib/utils/breadcrumb-title'
  import {
    atecoCodeLabels,
    companySizeLabels,
    currencyLabels,
    employeeCountRangeLabels,
    supplierStatusConfig,
    supplierTypeConfig,
    toSelectItems,
  } from '$lib/utils/enum-labels'
  import { api } from '$lib/utils/request'
  import { createRoute } from '$lib/utils/route-builder'
  import type { SnippetProps } from '$utils/runtime'
  import { SupplierDetailsContract } from './SupplierDetails.contract.js'

  let { pageDetails, legalEntity, entityConfig }: SnippetProps = $props()

  const resourceConfig = $derived(entityConfig?.resources?.['suppliers'])
  const uuid = $derived(pageDetails.params.uuid)
  const legalEntityId = $derived(legalEntity?.id)

  const supplierHandle = useProvides(SupplierDetailsContract, 'supplier')
  const breadcrumbTitle = useBreadcrumbTitle()

  const detail = useDetailRecord<Supplier>({
    getUuid: () => uuid,
    fetch: id => api.safe.get<Supplier>(`/legal-entities/${legalEntityId}/suppliers/${id}`),
    create: data => api.post(`/legal-entities/${legalEntityId}/suppliers`, { data }),
    update: (id, data) => api.put(`/legal-entities/${legalEntityId}/suppliers/${id}`, { data }),
    getDetailRoute: record => createRoute({ $id: 'supplier-details', params: { uuid: record.id } }),
    onFetched: data => {
      supplierHandle.set(data)
      breadcrumbTitle.set(data.name)
    },
    cleanup: () => {
      supplierHandle.unset()
      breadcrumbTitle.clear()
    },
  })

  const { handleSubmit, handleSuccess, handleFailure } = detail
  const record = $derived(detail.record)
  const promise = $derived(detail.promise)

  const initialValues = $derived.by(() => ({
    type: 'courier' as const,
    status: 'prospect' as const,
    name: '',
    trade_name: '',
    ateco_code: null,
    parent_id: '',
    company_size: null,
    employee_count_range: null,
    language_code: '',
    registration_country_code: '',
    default_currency: 'EUR' as const,
    vat_number: '',
    tax_id: '',
    pec: '',
    email: '',
    phone: '',
    fax: '',
    website: '',
    notes: '',
    ...(record ?? {}),
  }))

  const typeItems = Object.entries(supplierTypeConfig).map(([value, cfg]) => ({ value, label: cfg.label() }))
  const statusVariants: Record<string, StatusOption['variant']> = {
    active: 'active',
    prospect: 'in-progress',
    suspended: 'paused',
    ceased: 'neutral',
  }

  const allSupplierStatuses: StatusOption[] = Object.entries(supplierStatusConfig).map(([value, cfg]) => ({
    value,
    label: cfg.label(),
    variant: statusVariants[value] ?? 'neutral',
  }))

  // On create, 'active' is not allowed by the API
  const supplierStatuses = $derived(
    record ? allSupplierStatuses : allSupplierStatuses.filter(s => s.value !== 'active'),
  )

  const atecoItems = toSelectItems(atecoCodeLabels)
  const companySizeItems = toSelectItems(companySizeLabels)
  const employeeCountItems = toSelectItems(employeeCountRangeLabels)
  const currencyItems = toSelectItems(currencyLabels)

  const validateCreate = v
    .schema<Partial<Supplier>>({
      type: [v.required()],
      name: [v.required()],
      status: [v.required()],
      language_code: [v.required()],
      registration_country_code: [v.required()],
      default_currency: [v.required()],
      email: [v.email()],
    })
    .build()

  const validateUpdate = v
    .schema<Partial<Supplier>>({
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
      {#snippet withContext()}
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

            <div class={FormFieldClass.MaxWidth}>
              <StatusSelector
                name="status"
                label={m.status()}
                statuses={supplierStatuses}
                class={FormFieldClass.MinWidth}
                allowClear={false} />
            </div>

            <TextField name="name" label={m.name()} class={FormFieldClass.MaxWidth} focus={!record} />
            <TextField name="trade_name" label={m.trade_name()} class={FormFieldClass.MaxWidth} />
          {/snippet}
        </GroupTitle>

        <Separator />

        <GroupTitle heading={m.company_information()}>
          {#snippet description()}
            {m.company_information_description()}
          {/snippet}

          {#snippet content()}
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
            <TextField name="language_code" label={m.language_code()} class={FormFieldClass.MaxWidth} />
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
        <div class="fixed right-0 bottom-0 flex h-14 w-full items-center justify-end px-4">
          <BusyButton type="submit">{m.save_changes()}</BusyButton>
        </div>
      {/snippet}
    </FormUtil>
  {/snippet}
</RequestPlaceholder>
