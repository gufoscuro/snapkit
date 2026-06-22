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
  import ActionButton from '$components/core/ActionButton.svelte'
  import RequestPlaceholder from '$components/core/common/RequestPlaceholder.svelte'
  import DownloadActionButton from '$components/core/DownloadActionButton.svelte'
  import BottomBar from '$components/core/form/BottomBar.svelte'
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
  import VatSummaryTable from '$components/core/VatSummaryTable.svelte'
  import CustomerAddressSelector from '$components/features/form/CustomerAddressSelector.svelte'
  import CustomerContactSelector from '$components/features/form/CustomerContactSelector.svelte'
  import CustomerSelector from '$components/features/form/CustomerSelector.svelte'
  import PaymentCompositionEditor from '$components/features/form/PaymentCompositionEditor.svelte'
  import QuotationItemsListEditor from '$components/features/form/QuotationItemsListEditor.svelte'
  import type { VatCodeSummary } from '$components/features/form/VatCodeSelector.svelte'
  import GroupTitle from '$components/features/globals/GroupTitle.svelte'
  import {
    createQuotationActions,
    type QuotationActionOptions,
  } from '$components/features/quotations/quotation-actions'
  import Separator from '$components/ui/separator/separator.svelte'
  import { RecordActionButton } from '$lib/components/ui/record-action-button'
  import { RecordActionMenu } from '$lib/components/ui/record-action-menu'
  import { useProvides } from '$lib/contexts/page-state'
  import { useDetailRecord } from '$lib/hooks/use-detail-record.svelte'
  import * as m from '$lib/paraglide/messages'
  import type { Currency, CustomerCommercialTerms, PaymentComposition, Quotation } from '$lib/types/api-types'
  import { useBreadcrumbTitle } from '$lib/utils/breadcrumb-title'
  import {
    currencyLabels,
    getSalesTransactionTypeItemsFor,
    incotermLabels,
    toSelectItems,
  } from '$lib/utils/enum-labels'
  import {
    compositionFromSnapshot,
    compositionRules,
    toCompositionPayload,
    type PaymentCompositionSnapshotRow,
  } from '$lib/utils/payment-composition'
  import { api, apiDownload } from '$lib/utils/request'
  import { createRoute } from '$lib/utils/route-builder'
  import { DEFAULT_CURRENCY_CODE } from '$utils/prices.js'
  import type { SnippetProps } from '$utils/runtime'
  import IconDeviceFloppy from '@tabler/icons-svelte/icons/device-floppy'
  import { goto } from '$app/navigation'
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
    create: data => api.post(`/legal-entities/${legalEntityId}/quotations`, { data: toQuotationRequest(data) }),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    update: (id, { document_number, ...data }) =>
      api.put(`/legal-entities/${legalEntityId}/quotations/${id}`, { data: toQuotationRequest(data) }),
    getDetailRoute: record => createRoute({ $id: 'quotation-details', params: { uuid: record.id } }),
    onUpdated: data => {
      quotationHandle.set(data)
      breadcrumbTitle.setLabel(pageDetails.config.$id, data.document_number || m.new_quotation())
      if (data.customer_id) {
        fetchCustomerCommercialTerms(data.customer_id)
      }
    },
    onCreateMode: () => {
      breadcrumbTitle.setLabel(pageDetails.config.$id, m.new_quotation())
    },
    cleanup: () => {
      quotationHandle.unset()
      breadcrumbTitle.clearLabel(pageDetails.config.$id)
    },
  })

  const { handleSubmit, handleSuccess, handleFailure } = detail
  const record = $derived(detail.record)
  const promise = $derived(detail.promise)
  const isReadOnly = $derived(!!record && record.state !== 'open')

  // Quotation actions (sent flag, approve, reject)
  const quotationActions = $derived(
    legalEntityId
      ? createQuotationActions({
          legalEntityId,
          onSuccess: detail.refetch,
          onArchived: () => goto(createRoute({ $id: 'quotations' })),
        })
      : [],
  )
  const actionOptions = $derived.by((): QuotationActionOptions | null => {
    if (!record) return null
    return {
      targetId: record.id,
      documentNumber: record.document_number,
      version: record.version,
      state: record.state,
      sentAt: record.sent_at || null,
      availableTransitions: record.available_transitions ?? [],
      isArchivable: (record as Quotation & { is_archivable?: boolean }).is_archivable,
    }
  })
  const approveAction = $derived(quotationActions.find(a => a.id === 'approve'))
  const rejectAction = $derived(quotationActions.find(a => a.id === 'reject'))

  // Commercial terms state (always populated when a customer is known)
  let commercialTermsVatCode = $state<VatCodeSummary | undefined>(undefined)
  // Default line-item discount from customer commercial terms (`trade_discount`)
  let commercialTermsDiscount = $state<number | undefined>(undefined)

  // Bumped to remount the composition editor when its value is set externally
  // (customer commercial-terms default), forcing a fresh hydrate.
  let compositionKey = $state(0)

  type FormFieldUpdater = (name: string, value: unknown) => void

  /** Strips the form payload down to the API request shape (clean composition). */
  function toQuotationRequest(data: object): Record<string, unknown> {
    const d = data as Record<string, unknown>
    return { ...d, composition: toCompositionPayload(d.composition as PaymentComposition[] | undefined) }
  }

  /**
   * Fetches commercial terms for a customer and populates state.
   * When updateField is provided and we're in create mode, also precompiles form fields.
   */
  async function fetchCustomerCommercialTerms(customerId: string, updateField?: FormFieldUpdater) {
    if (!customerId || !legalEntityId) {
      commercialTermsVatCode = undefined
      commercialTermsDiscount = undefined
      return
    }

    const { data } = await api.safe.get<CustomerCommercialTerms>(
      `/legal-entities/${legalEntityId}/customers/${customerId}/commercial-terms`,
    )

    if (data) {
      commercialTermsVatCode = data.vat_code as VatCodeSummary | undefined
      commercialTermsDiscount = data.trade_discount || undefined

      if (updateField && !record && data.composition?.length) {
        updateField('composition', data.composition)
        compositionKey++
      }
      if (updateField && !record && data.incoterm) {
        updateField('incoterm', data.incoterm)
      }
    } else {
      commercialTermsVatCode = undefined
      commercialTermsDiscount = undefined
    }
  }

  function handleCustomerChange(item: { value?: unknown } | undefined, updateField: FormFieldUpdater) {
    updateField('ship_to_address_id', '')
    updateField('contact_person_id', '')

    commercialTermsVatCode = undefined
    commercialTermsDiscount = undefined

    if (item?.value) {
      fetchCustomerCommercialTerms(item.value as string, updateField)
    }
  }

  const currencyItems = toSelectItems(currencyLabels)
  const incotermItems = toSelectItems(incotermLabels)
  const transactionTypeItems = $derived(getSalesTransactionTypeItemsFor('quotation', record?.sales_transaction_type))

  const defaultComposition: PaymentComposition[] = [
    { position: 1, percentage: 100, type: 'saldo', payment_term_id: '' },
  ]

  const initialValues = $derived.by(() => ({
    document_number: '',
    document_date: new Date().toISOString(),
    sales_transaction_type: undefined,
    customer_id: '',
    ship_to_address_id: '',
    contact_person_id: '',
    currency: DEFAULT_CURRENCY_CODE as Currency,
    valid_from: new Date().toISOString(),
    valid_to: '',
    incoterm: undefined,
    incoterm_location: '',
    requested_delivery_date: '',
    notes_internal: '',
    notes_external: '',
    items: [],
    composition: defaultComposition,
    ...(record
      ? {
          ...record,
          items: record.items ?? [],
          composition: compositionFromSnapshot(
            record.payment_composition_snapshot as PaymentCompositionSnapshotRow[] | undefined,
          ),
        }
      : {}),
  }))

  const validateCreate = v
    .schema<Partial<Quotation & { composition: PaymentComposition[] }>>({
      document_date: [v.required({ field: m.document_date() })],
      sales_transaction_type: [v.required({ field: m.sales_transaction_type() })],
      customer_id: [v.required({ field: m.customer() })],
      currency: [v.required({ field: m.currency_label() })],
      valid_from: [v.required({ field: m.valid_from() })],
      valid_to: [v.required({ field: m.valid_to() })],
      incoterm: [v.required({ field: m.incoterm() })],
      composition: [compositionRules()],
    })
    .build()

  const validateUpdate = v
    .schema<Partial<Quotation & { composition: PaymentComposition[] }>>({
      composition: [compositionRules()],
    })
    .build()

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
      locked={isReadOnly}
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
            {#if !!record}
              <TextField name="document_number" label={m.document_number()} class={FormFieldClass.MaxWidth} disabled />
            {/if}

            <DateField name="document_date" label={m.document_date()} class={FormFieldClass.MaxWidth} allowClear />

            <SelectField
              name="sales_transaction_type"
              label={m.sales_transaction_type()}
              items={transactionTypeItems}
              class={FormFieldClass.MaxWidth} />

            <CustomerSelector
              name="customer_id"
              attr={customerAttr
                ? {
                    id: record?.customer_id as string,
                    name: customerAttr.name as string,
                    vat_no: '',
                    categories: [],
                    default_currency: '',
                    emails: [],
                    phones: [],
                  }
                : undefined}
              onChange={item => handleCustomerChange(item, formAPI.updateField as FormFieldUpdater)}
              class={FormFieldClass.MaxWidth}
              allowNewRecord
              allowOpenRecord />

            <CustomerAddressSelector
              customerId={formAPI.values.customer_id}
              attr={shipToAddressAttr
                ? {
                    id: record?.ship_to_address_id as string,
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
              class={FormFieldClass.MaxWidth}
              allowOpenRecord />

            <CustomerContactSelector
              customerId={formAPI.values.customer_id}
              attr={contactPersonAttr
                ? {
                    id: record?.contact_person_id as string,
                    type:
                      (contactPersonAttr.type as
                        | 'primary'
                        | 'technical_support'
                        | 'administrative'
                        | 'logistics'
                        | 'quality'
                        | 'purchasing'
                        | 'sales') ?? 'primary',
                    name: (contactPersonAttr.name as string) ?? '',
                    job_title: (contactPersonAttr.job_title as string) ?? '',
                    phone: (contactPersonAttr.phone as string) ?? '',
                    mobile_phone: (contactPersonAttr.mobile_phone as string) ?? '',
                    email: (contactPersonAttr.email as string) ?? '',
                    version: (contactPersonAttr.version as number) ?? 0,
                  }
                : undefined}
              class={FormFieldClass.MaxWidth}
              allowOpenRecord />

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
            <DateField name="valid_from" label={m.valid_from()} class={FormFieldClass.MaxWidth} allowClear />

            <DateField name="valid_to" label={m.valid_to()} class={FormFieldClass.MaxWidth} allowClear />

            {#key compositionKey}
              <PaymentCompositionEditor
                name="composition"
                value={formAPI.values.composition as PaymentComposition[]}
                required />
            {/key}

            <SelectField name="incoterm" label={m.incoterm()} items={incotermItems} class={FormFieldClass.MinWidth} />

            <TextField name="incoterm_location" label={m.incoterm_location()} class={FormFieldClass.MaxWidth} />

            <DateField
              name="requested_delivery_date"
              label={m.requested_delivery_date()}
              class={FormFieldClass.MaxWidth}
              allowClear />
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
              currency={formAPI?.values?.currency ?? DEFAULT_CURRENCY_CODE}
              required={!record}
              refreshKey={record?.version}
              showDeliveryDates
              defaultVatCode={commercialTermsVatCode}
              defaultDiscountPercent={commercialTermsDiscount}
              defaultDeliveryDate={formAPI?.values?.requested_delivery_date} />
          {/snippet}
        </GroupTitle>

        <Separator />

        <!-- Totals — VAT breakdown + document totals -->
        <GroupTitle heading={m.quotation_totals_section()}>
          {#snippet description()}
            {m.quotation_totals_section_description()}
          {/snippet}

          {#snippet content()}
            {@const currencyCode = formAPI.values.currency}
            <div class="flex flex-col items-end gap-6 pr-14">
              <VatSummaryTable rows={record?.vat_summary} {currencyCode} class="w-full max-w-md" />

              <StackedAmountValues
                title={m.total()}
                rows={[
                  { label: m.net_total(), value: record?.net_value || 0, currencyCode },
                  {
                    label: m.tax_total(),
                    value: (record?.gross_value || 0) - (record?.net_value || 0),
                    currencyCode,
                  },
                  {
                    type: 'grandtotal',
                    label: m.total(),
                    value: record?.gross_value || 0,
                    currencyCode,
                  },
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
        <BottomBar>
          {#if !record}
            <BusyButton type="submit">{m.save_changes()}</BusyButton>
          {:else}
            {#if actionOptions}
              <RecordActionMenu buttonVariant="outline" actions={quotationActions} {actionOptions} />
            {/if}

            <DownloadActionButton
              onDownload={() =>
                apiDownload({
                  url: `/legal-entities/${legalEntityId}/quotations/${record.id}/pdf`,
                  filename: `${record.document_number}.pdf`,
                })} />

            {#if record.state === 'open'}
              <ActionButton type="submit" variant="outline" size="icon" busyLabel="" tooltip={m.save_changes()}>
                <IconDeviceFloppy class="size-4" />
              </ActionButton>
            {/if}

            {#if rejectAction && actionOptions}
              <RecordActionButton action={rejectAction} {actionOptions} variant="outline" />
            {/if}

            {#if approveAction && actionOptions}
              <RecordActionButton action={approveAction} {actionOptions} />
            {/if}
          {/if}
        </BottomBar>
      {/snippet}
    </FormUtil>
  {/snippet}
</RequestPlaceholder>
