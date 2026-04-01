<!--
  @component QuotationDetails
  @description Fetches and displays quotation details for create/edit.
  Provides quotation data to page state so other snippets on the same page
  (e.g. sidebar) can consume it without a second request.
  @keywords quotation, details, form, sales
  @api GET /api/legal-entities/{legalEntity}/quotations/{quotation}
  @api POST /api/legal-entities/{legalEntity}/quotations
  @api PUT /api/legal-entities/{legalEntity}/quotations/{quotation}
-->
<script lang="ts" module>
  // eslint-disable-next-line no-import-assign
  export { QuotationDetailsContract as contract } from './QuotationDetails.contract.js'
</script>

<script lang="ts">
  import RequestPlaceholder from '$components/core/common/RequestPlaceholder.svelte'
  import DownloadActionButton from '$components/core/DownloadActionButton.svelte'
  import BusyButton from '$components/core/form/BusyButton.svelte'
  import DateField from '$components/core/form/DateField.svelte'
  import { FormFieldClass } from '$components/core/form/form.js'
  import FormErrorMessage from '$components/core/form/FormErrorMessage.svelte'
  import FormUtil from '$components/core/form/FormUtil.svelte'
  import RichEditorField from '$components/core/form/RichEditorField.svelte'
  import SelectField from '$components/core/form/SelectField.svelte'
  import TextField from '$components/core/form/TextField.svelte'
  import { v } from '$components/core/form/validation'
  import StackedAmountValues from '$components/core/StackedAmountValues.svelte'
  import CustomerAddressSelector from '$components/features/form/CustomerAddressSelector.svelte'
  import CustomerContactSelector from '$components/features/form/CustomerContactSelector.svelte'
  import CustomerSelector from '$components/features/form/CustomerSelector.svelte'
  import PaymentTermSelector from '$components/features/form/PaymentTermSelector.svelte'
  import QuotationItemsListEditor from '$components/features/form/QuotationItemsListEditor.svelte'
  import GroupTitle from '$components/features/globals/GroupTitle.svelte'
  import Separator from '$components/ui/separator/separator.svelte'
  import { useProvides } from '$lib/contexts/page-state'
  import { useDetailRecord } from '$lib/hooks/use-detail-record.svelte'
  import * as m from '$lib/paraglide/messages'
  import type { Quotation } from '$lib/types/api-types'
  import { useBreadcrumbTitle } from '$lib/utils/breadcrumb-title'
  import { currencyLabels, incotermLabels, salesTransactionTypeLabels, toSelectItems } from '$lib/utils/enum-labels'
  import { api, apiDownload } from '$lib/utils/request'
  import { createRoute } from '$lib/utils/route-builder'
  import { getCurrencySymbol } from '$utils/prices.js'
  import type { SnippetProps } from '$utils/runtime'
  import { QuotationDetailsContract } from './QuotationDetails.contract.js'

  let { pageDetails, legalEntity, entityConfig }: SnippetProps = $props()

  const resourceConfig = $derived(entityConfig?.resources?.['quotations'])
  const uuid = $derived(pageDetails.params.uuid)
  const legalEntityId = $derived(legalEntity?.id)

  const quotationHandle = useProvides(QuotationDetailsContract, 'quotation')
  const breadcrumbTitle = useBreadcrumbTitle()

  const detail = useDetailRecord<Quotation>({
    getUuid: () => uuid,
    fetch: id => api.safe.get<Quotation>(`/legal-entities/${legalEntityId}/quotations/${id}`),
    create: data => api.post(`/legal-entities/${legalEntityId}/quotations`, { data }),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    update: (id, { document_number, ...data }) =>
      api.put(`/legal-entities/${legalEntityId}/quotations/${id}`, { data }),
    getDetailRoute: record => createRoute({ $id: 'quotation-details', params: { uuid: record.id } }),
    onUpdated: data => {
      quotationHandle.set(data)
      breadcrumbTitle.setLabel(pageDetails.config.$id, data.document_number || m.new_quotation())
    },
    cleanup: () => {
      quotationHandle.unset()
      breadcrumbTitle.clearLabel(pageDetails.config.$id)
    },
  })

  const { handleSubmit, handleSuccess, handleFailure } = detail
  const record = $derived(detail.record)
  const promise = $derived(detail.promise)

  const currencyItems = toSelectItems(currencyLabels)
  const incotermItems = toSelectItems(incotermLabels)
  const transactionTypeItems = toSelectItems(salesTransactionTypeLabels)

  const initialValues = $derived.by(() => ({
    document_number: '',
    document_date: '',
    sales_transaction_type: 'VEN' as const,
    customer_id: '',
    ship_to_address_id: '',
    contact_person_id: '',
    currency: 'EUR' as const,
    valid_from: '',
    valid_to: '',
    payment_term_id: '',
    incoterm: 'EXW' as const,
    incoterm_location: '',
    notes_internal: '',
    notes_external: '',
    items: [],
    ...(record
      ? {
          ...record,
          items: record.items ?? [],
        }
      : {}),
  }))

  const validateCreate = v
    .schema<Partial<Quotation>>({
      document_date: [v.required({ field: m.document_date() })],
      sales_transaction_type: [v.required({ field: m.sales_transaction_type() })],
      customer_id: [v.required({ field: m.customer() })],
      currency: [v.required({ field: m.currency_label() })],
      valid_from: [v.required({ field: m.valid_from() })],
      valid_to: [v.required({ field: m.valid_to() })],
      payment_term_id: [v.required({ field: m.payment_term() })],
      incoterm: [v.required({ field: m.incoterm() })],
    })
    .build()

  const validateUpdate = v.schema<Partial<Quotation>>({}).build()

  const validate = $derived(!record ? validateCreate : validateUpdate)

  // Resolve customer snapshot for pre-populating selector in edit mode
  const customerAttr = $derived.by(() => {
    if (!record) return undefined
    const snapshot = record.customer_snapshot
    if (Array.isArray(snapshot) && snapshot.length > 0) {
      return snapshot[0] as Record<string, unknown>
    }
    if (snapshot && !Array.isArray(snapshot)) {
      return snapshot as unknown as Record<string, unknown>
    }
    return undefined
  })

  // Resolve payment term snapshot for pre-populating selector in edit mode
  const paymentTermAttr = $derived.by(() => {
    if (!record) return undefined
    const snapshot = record.payment_term_snapshot
    if (Array.isArray(snapshot) && snapshot.length > 0) {
      return snapshot[0] as Record<string, unknown>
    }
    if (snapshot && !Array.isArray(snapshot)) {
      return snapshot as unknown as Record<string, unknown>
    }
    return undefined
  })

  // Resolve ship-to address snapshot for pre-populating selector in edit mode
  const shipToAddressAttr = $derived.by(() => {
    if (!record) return undefined
    const snapshot = record.ship_to_snapshot
    if (Array.isArray(snapshot) && snapshot.length > 0) {
      return snapshot[0] as Record<string, unknown>
    }
    if (snapshot && !Array.isArray(snapshot)) {
      return snapshot as unknown as Record<string, unknown>
    }
    return undefined
  })

  // Resolve contact person snapshot for pre-populating selector in edit mode
  const contactPersonAttr = $derived.by(() => {
    if (!record) return undefined
    const snapshot = record.contact_person_snapshot
    if (Array.isArray(snapshot) && snapshot.length > 0) {
      return snapshot[0] as Record<string, unknown>
    }
    if (snapshot && !Array.isArray(snapshot)) {
      return snapshot as unknown as Record<string, unknown>
    }
    return undefined
  })
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

        <!-- General Information -->
        <GroupTitle heading={m.quotation_general_information()}>
          {#snippet description()}
            {m.quotation_general_information_description()}
          {/snippet}

          {#snippet content()}
            <TextField
              name="document_number"
              label={m.document_number()}
              class={FormFieldClass.MaxWidth}
              disabled={!!record} />

            <DateField name="document_date" label={m.document_date()} class={FormFieldClass.MinWidth} allowClear />

            <SelectField
              name="sales_transaction_type"
              label={m.sales_transaction_type()}
              items={transactionTypeItems}
              class={FormFieldClass.MaxWidth} />

            <CustomerSelector
              name="customer_id"
              attr={customerAttr
                ? {
                    id: customerAttr.id as string,
                    name: customerAttr.name as string,
                    vat_no: '',
                    categories: [],
                    default_currency: '',
                    emails: [],
                    phones: [],
                  }
                : undefined}
              onChange={() => {
                formAPI.updateField('ship_to_address_id', '' as never)
                formAPI.updateField('contact_person_id', '' as never)
              }}
              class={FormFieldClass.MaxWidth} />

            <CustomerAddressSelector
              customerId={formAPI.values.customer_id}
              attr={shipToAddressAttr
                ? {
                    id: shipToAddressAttr.id as string,
                    type: (shipToAddressAttr.type as 'billing' | 'shipping' | 'legal') ?? 'shipping',
                    is_default: (shipToAddressAttr.is_default as boolean) ?? false,
                    address_line_1: (shipToAddressAttr.address_line_1 as string) ?? '',
                    address_line_2: (shipToAddressAttr.address_line_2 as string) ?? '',
                    city: (shipToAddressAttr.city as string) ?? '',
                    province: (shipToAddressAttr.province as string) ?? '',
                    region: (shipToAddressAttr.region as string) ?? '',
                    postal_code: (shipToAddressAttr.postal_code as string) ?? '',
                    country_code: (shipToAddressAttr.country_code as string) ?? '',
                    receiving_hours: (shipToAddressAttr.receiving_hours as string) ?? '',
                    delivery_instructions: (shipToAddressAttr.delivery_instructions as string) ?? '',
                    warehouse_assignment: (shipToAddressAttr.warehouse_assignment as string) ?? '',
                    version: (shipToAddressAttr.version as number) ?? 0,
                  }
                : undefined}
              class={FormFieldClass.MaxWidth} />

            <CustomerContactSelector
              customerId={formAPI.values.customer_id}
              attr={contactPersonAttr
                ? {
                    id: contactPersonAttr.id as string,
                    type: (contactPersonAttr.type as 'primary' | 'technical_support' | 'administrative' | 'logistics' | 'quality' | 'purchasing' | 'sales') ?? 'primary',
                    name: (contactPersonAttr.name as string) ?? '',
                    job_title: (contactPersonAttr.job_title as string) ?? '',
                    phone: (contactPersonAttr.phone as string) ?? '',
                    mobile_phone: (contactPersonAttr.mobile_phone as string) ?? '',
                    email: (contactPersonAttr.email as string) ?? '',
                    version: (contactPersonAttr.version as number) ?? 0,
                  }
                : undefined}
              class={FormFieldClass.MaxWidth} />

            <SelectField
              name="currency"
              label={m.currency_label()}
              items={currencyItems}
              class={FormFieldClass.MinWidth} />
          {/snippet}
        </GroupTitle>

        <Separator />

        <!-- Commercial Terms -->
        <GroupTitle heading={m.quotation_commercial_terms()}>
          {#snippet description()}
            {m.quotation_commercial_terms_description()}
          {/snippet}

          {#snippet content()}
            <DateField name="valid_from" label={m.valid_from()} class={FormFieldClass.MinWidth} allowClear />

            <DateField name="valid_to" label={m.valid_to()} class={FormFieldClass.MinWidth} allowClear />

            <PaymentTermSelector
              name="payment_term_id"
              attr={paymentTermAttr
                ? {
                    id: paymentTermAttr.id as string,
                    name: paymentTermAttr.name as string,
                    code: paymentTermAttr.code as string,
                    description: '',
                    terms: { reference_date: 'invoice_date', due_dates: [] },
                    is_active: true,
                  }
                : undefined}
              class={FormFieldClass.MaxWidth} />

            <SelectField name="incoterm" label={m.incoterm()} items={incotermItems} class={FormFieldClass.MinWidth} />

            <TextField name="incoterm_location" label={m.incoterm_location()} class={FormFieldClass.MaxWidth} />
          {/snippet}
        </GroupTitle>

        <Separator />

        <!-- Line Items -->
        <GroupTitle heading={m.quotation_line_items()} class="max-[11rem]:flex-col">
          {#snippet description()}
            {m.quotation_line_items_description()}
          {/snippet}

          {#snippet content()}
            <QuotationItemsListEditor
              name="items"
              showLabel={false}
              currency={formAPI?.values?.currency ?? 'EUR'}
              required={!record}
              refreshKey={record?.version}
              showDeliveryDates />

            {@const currencySymbol = getCurrencySymbol(formAPI.values.currency)}
            <div class="pr-14">
              <StackedAmountValues
                title={m.total()}
                rows={[
                  { label: m.net_total(), value: record?.net_value || 0, currencySymbol },
                  { label: m.gross_total(), value: record?.gross_value || 0, currencySymbol },
                ]} />
            </div>
          {/snippet}
        </GroupTitle>

        <Separator />

        <!-- Notes -->
        <GroupTitle heading={m.quotation_notes_section()}>
          {#snippet description()}
            {m.quotation_notes_section_description()}
          {/snippet}

          {#snippet content()}
            <RichEditorField
              name="notes_internal"
              label={m.notes_internal()}
              width="{FormFieldClass.MaxWidth} {FormFieldClass.MinWidth}" />

            <RichEditorField name="notes_external" label={m.notes_external()} width={FormFieldClass.MaxWidth} />
          {/snippet}
        </GroupTitle>
      {/snippet}

      {#snippet bottom()}
        <div class="fixed right-0 bottom-0 flex h-14 w-full items-center justify-end gap-2 px-4">
          {#if record}
            <DownloadActionButton
              onDownload={() =>
                apiDownload({
                  url: `/legal-entities/${legalEntityId}/quotations/${record.id}/pdf`,
                  filename: `${record.document_number}.pdf`,
                })} />
          {/if}
          <BusyButton type="submit">{m.save_changes()}</BusyButton>
        </div>
      {/snippet}
    </FormUtil>
  {/snippet}
</RequestPlaceholder>
