<!--
  @component TransportDocumentDetails
  @description Fetches and displays transport document (DDT) details for create/edit.
  Provides DDT data to page state so other snippets on the same page (e.g. sidebar)
  can consume it without a second request.
  @keywords transport-document, ddt, details, form, shipping
  @api GET /api/legal-entities/{legalEntity}/transport-documents/{transportDocument}
  @api POST /api/legal-entities/{legalEntity}/transport-documents
  @api PUT /api/legal-entities/{legalEntity}/transport-documents/{transportDocument}
-->
<script lang="ts" module>
  // eslint-disable-next-line no-import-assign
  export { TransportDocumentDetailsContract as contract } from './TransportDocumentDetails.contract.js'
</script>

<script lang="ts">
  import { goto } from '$app/navigation'
  import ActionButton from '$components/core/ActionButton.svelte'
  import RequestPlaceholder from '$components/core/common/RequestPlaceholder.svelte'
  import DownloadActionButton from '$components/core/DownloadActionButton.svelte'
  import StackedAmountValues from '$components/core/StackedAmountValues.svelte'
  import BottomBar from '$components/core/form/BottomBar.svelte'
  import BusyButton from '$components/core/form/BusyButton.svelte'
  import DateField from '$components/core/form/DateField.svelte'
  import { FormFieldClass } from '$components/core/form/form.js'
  import FormErrorMessage from '$components/core/form/FormErrorMessage.svelte'
  import FormUtil from '$components/core/form/FormUtil.svelte'
  import NumberField from '$components/core/form/NumberField.svelte'
  import RichEditorField from '$components/core/form/RichEditorField.svelte'
  import SelectField from '$components/core/form/SelectField.svelte'
  import TextField from '$components/core/form/TextField.svelte'
  import { v } from '$components/core/form/validation'
  import CarrierSelector, { type CarrierSummary } from '$components/features/form/CarrierSelector.svelte'
  import CustomerAddressSelector from '$components/features/form/CustomerAddressSelector.svelte'
  import CustomerSelector from '$components/features/form/CustomerSelector.svelte'
  import TransportDocumentItemsListEditor from '$components/features/form/TransportDocumentItemsListEditor.svelte'
  import type { VatCodeSummary } from '$components/features/form/VatCodeSelector.svelte'
  import WarehouseSelector, { type WarehouseSummary } from '$components/features/form/WarehouseSelector.svelte'
  import GroupTitle from '$components/features/globals/GroupTitle.svelte'
  import {
    createTransportDocumentActions,
    type TransportDocumentActionOptions,
  } from '$components/features/transport-documents/transport-document-actions'
  import Separator from '$components/ui/separator/separator.svelte'
  import { RecordActionButton } from '$lib/components/ui/record-action-button'
  import { RecordActionMenu } from '$lib/components/ui/record-action-menu'
  import { useProvides } from '$lib/contexts/page-state'
  import { useDetailRecord } from '$lib/hooks/use-detail-record.svelte'
  import * as m from '$lib/paraglide/messages'
  import type { CustomerCommercialTerms, TransportDocument } from '$lib/types/api-types'
  import { useBreadcrumbTitle } from '$lib/utils/breadcrumb-title'
  import {
    incotermLabels,
    salesTransactionTypeLabels,
    toSelectItems,
    transportMethodLabels,
  } from '$lib/utils/enum-labels'
  import { api, apiDownload } from '$lib/utils/request'
  import { createRoute } from '$lib/utils/route-builder'
  import { DEFAULT_CURRENCY_CODE } from '$utils/prices.js'
  import type { SnippetProps } from '$utils/runtime'
  import IconDeviceFloppy from '@tabler/icons-svelte/icons/device-floppy'
  import { TransportDocumentDetailsContract } from './TransportDocumentDetails.contract.js'

  let { pageDetails, legalEntity, entityConfig }: SnippetProps = $props()

  const resourceConfig = $derived(entityConfig?.resources?.['transport-documents'])
  const uuid = $derived(pageDetails.params.uuid)
  const legalEntityId = $derived(legalEntity?.id)

  const transportDocumentHandle = useProvides(TransportDocumentDetailsContract, 'transportDocument')
  const breadcrumbTitle = useBreadcrumbTitle()

  const detail = useDetailRecord<TransportDocument>({
    getUuid: () => uuid,
    fetch: id => api.safe.get<TransportDocument>(`/legal-entities/${legalEntityId}/transport-documents/${id}`),
    create: data => api.post(`/legal-entities/${legalEntityId}/transport-documents`, { data }),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    update: (id, { document_number, ...data }) =>
      api.put(`/legal-entities/${legalEntityId}/transport-documents/${id}`, { data }),
    getDetailRoute: record => createRoute({ $id: 'transport-document-details', params: { uuid: record.id } }),
    onUpdated: data => {
      transportDocumentHandle.set(data)
      breadcrumbTitle.setLabel(pageDetails.config.$id, data.document_number || m.new_transport_document())
      if (data.customer_id) {
        fetchCustomerCommercialTerms(data.customer_id)
      }
    },
    onCreateMode: () => {
      breadcrumbTitle.setLabel(pageDetails.config.$id, m.new_transport_document())
    },
    cleanup: () => {
      transportDocumentHandle.unset()
      breadcrumbTitle.clearLabel(pageDetails.config.$id)
    },
  })

  const { handleSubmit, handleSuccess, handleFailure } = detail
  const record = $derived(detail.record)
  const promise = $derived(detail.promise)
  const isReadOnly = $derived(!!record && record.state !== 'open')

  const transportDocumentActions = $derived(
    legalEntityId
      ? createTransportDocumentActions({
          legalEntityId,
          onSuccess: detail.refetch,
          // eslint-disable-next-line svelte/no-navigation-without-resolve
          onArchived: () => goto(createRoute({ $id: 'transport-documents' })),
        })
      : [],
  )
  const actionOptions = $derived.by((): TransportDocumentActionOptions | null => {
    if (!record) return null
    return {
      targetId: record.id,
      documentNumber: record.document_number,
      version: record.version,
      state: record.state,
      availableTransitions: record.available_transitions ?? [],
      isArchivable: record.is_archivable,
    }
  })
  const carryAction = $derived(transportDocumentActions.find(a => a.id === 'carry'))

  // Default VAT code resolved from customer commercial terms (used by item editor)
  let commercialTermsVatCode = $state<VatCodeSummary | undefined>(undefined)

  type FormFieldUpdater = (name: string, value: unknown) => void

  async function fetchCustomerCommercialTerms(customerId: string) {
    if (!customerId || !legalEntityId) {
      commercialTermsVatCode = undefined
      return
    }
    const { data } = await api.safe.get<CustomerCommercialTerms>(
      `/legal-entities/${legalEntityId}/customers/${customerId}/commercial-terms`,
    )
    commercialTermsVatCode = data ? (data.vat_code as VatCodeSummary | undefined) : undefined
  }

  function handleCustomerChange(item: { value?: unknown } | undefined, updateField: FormFieldUpdater) {
    updateField('ship_to_address_id', '')
    commercialTermsVatCode = undefined
    if (item?.value) {
      fetchCustomerCommercialTerms(item.value as string)
    }
  }

  const incotermItems = toSelectItems(incotermLabels)
  const transactionTypeItems = toSelectItems(salesTransactionTypeLabels)
  const transportMethodItems = toSelectItems(transportMethodLabels)

  const initialValues = $derived.by(() => ({
    document_number: '',
    document_date: new Date().toISOString(),
    sales_transaction_type: undefined,
    customer_id: '',
    ship_to_address_id: '',
    warehouse_id: '',
    carrier_id: '',
    transport_reason: '',
    transport_method: null,
    shipping_date: '',
    shipping_time: '',
    incoterm: undefined,
    incoterm_location: '',
    packages_count: 0,
    gross_weight: 0,
    net_weight: 0,
    volume: 0,
    appearance: '',
    notes_internal: '',
    notes_external: '',
    return_deadline: '',
    items: [],
    ...(record
      ? {
          ...record,
          items: record.items ?? [],
        }
      : {}),
  }))

  const validateCreate = v
    .schema<Partial<TransportDocument>>({
      sales_transaction_type: [v.required({ field: m.sales_transaction_type() })],
      customer_id: [v.required({ field: m.customer() })],
      incoterm: [v.required({ field: m.incoterm() })],
      shipping_date: [v.required({ field: m.shipping_date() })],
    })
    .build()

  const validateUpdate = v.schema<Partial<TransportDocument>>({}).build()

  const validate = $derived(!record ? validateCreate : validateUpdate)

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

  const warehouseAttr = $derived<WarehouseSummary | undefined>(
    record?.warehouse
      ? { id: record.warehouse.id, code: record.warehouse.code, description: record.warehouse.description }
      : undefined,
  )
  const carrierAttr = $derived<CarrierSummary | undefined>(
    record?.carrier
      ? { id: record.carrier.id, name: record.carrier.name, trade_name: record.carrier.trade_name }
      : undefined,
  )
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
        <GroupTitle heading={m.transport_document_general_information()}>
          {#snippet description()}
            {m.transport_document_general_information_description()}
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

            <WarehouseSelector name="warehouse_id" attr={warehouseAttr} class={FormFieldClass.MaxWidth} />
          {/snippet}
        </GroupTitle>

        <Separator />

        <!-- Shipping -->
        <GroupTitle heading={m.transport_document_shipping()}>
          {#snippet description()}
            {m.transport_document_shipping_description()}
          {/snippet}

          {#snippet content()}
            <CarrierSelector name="carrier_id" attr={carrierAttr} class={FormFieldClass.MaxWidth} />

            <SelectField
              name="transport_method"
              label={m.transport_method()}
              items={transportMethodItems}
              class={FormFieldClass.MinWidth} />

            <DateField name="shipping_date" label={m.shipping_date()} class={FormFieldClass.MaxWidth} />

            <TextField name="shipping_time" label={m.shipping_time()} class={FormFieldClass.MinWidth} />

            <TextField name="transport_reason" label={m.transport_reason()} class={FormFieldClass.MaxWidth} />

            <SelectField name="incoterm" label={m.incoterm()} items={incotermItems} class={FormFieldClass.MinWidth} />

            <TextField name="incoterm_location" label={m.incoterm_location()} class={FormFieldClass.MaxWidth} />
          {/snippet}
        </GroupTitle>

        <Separator />

        <!-- Packages & Weights -->
        <GroupTitle heading={m.transport_document_packages()}>
          {#snippet description()}
            {m.transport_document_packages_description()}
          {/snippet}

          {#snippet content()}
            <NumberField name="packages_count" label={m.packages_count()} class={FormFieldClass.MinWidth} />
            <NumberField name="gross_weight" label={m.gross_weight()} class={FormFieldClass.MinWidth} />
            <NumberField name="net_weight" label={m.net_weight()} class={FormFieldClass.MinWidth} />
            <NumberField name="volume" label={m.volume()} class={FormFieldClass.MinWidth} />
            <TextField name="appearance" label={m.appearance()} class={FormFieldClass.MaxWidth} />
          {/snippet}
        </GroupTitle>

        <Separator />

        <!-- Line Items -->
        <GroupTitle heading={m.transport_document_line_items()} class="max-[11rem]:flex-col">
          {#snippet description()}
            {m.transport_document_line_items_description()}
          {/snippet}

          {#snippet content()}
            <TransportDocumentItemsListEditor
              name="items"
              showLabel={false}
              {legalEntityId}
              customerId={formAPI?.values?.customer_id}
              salesTransactionType={formAPI?.values?.sales_transaction_type}
              incoterm={formAPI?.values?.incoterm}
              defaultVatCode={commercialTermsVatCode}
              required={!record}
              refreshKey={record?.version} />

            {#if record}
              {@const grossTotal = (record.items ?? []).reduce((sum, it) => sum + (it.net_value || 0), 0)}
              <div class="pr-14">
                <StackedAmountValues
                  title={m.total()}
                  rows={[
                    { type: 'grandtotal', label: m.net_total(), value: grossTotal, currencyCode: DEFAULT_CURRENCY_CODE },
                  ]} />
              </div>
            {/if}
          {/snippet}
        </GroupTitle>

        <Separator />

        <!-- Notes & Return -->
        <GroupTitle heading={m.transport_document_notes_section()}>
          {#snippet description()}
            {m.transport_document_notes_section_description()}
          {/snippet}

          {#snippet content()}
            <DateField name="return_deadline" label={m.return_deadline()} class={FormFieldClass.MaxWidth} allowClear />

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
              <RecordActionMenu buttonVariant="outline" actions={transportDocumentActions} {actionOptions} />
            {/if}

            <DownloadActionButton
              onDownload={() =>
                apiDownload({
                  url: `/legal-entities/${legalEntityId}/transport-documents/${record.id}/pdf`,
                  filename: `${record.document_number}.pdf`,
                })} />

            {#if record.state === 'open'}
              <ActionButton type="submit" variant="outline" size="icon" busyLabel="" tooltip={m.save_changes()}>
                <IconDeviceFloppy class="size-4" />
              </ActionButton>
            {/if}

            {#if carryAction && actionOptions}
              <RecordActionButton action={carryAction} {actionOptions} />
            {/if}
          {/if}
        </BottomBar>
      {/snippet}
    </FormUtil>
  {/snippet}
</RequestPlaceholder>
