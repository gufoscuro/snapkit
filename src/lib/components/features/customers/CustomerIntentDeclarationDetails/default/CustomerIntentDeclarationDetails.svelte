<!--
  @component CustomerIntentDeclarationDetails
  @description Fetches and displays a customer's intent declaration (dichiarazione d'intento).
  Handles both create and update, groups fields into protocol / amount / notes sections, and exposes
  the verify / revoke / invalidate / archive lifecycle actions. Provides the declaration to page state
  so IntentDeclarationSidebar can consume it.
  @keywords customer, intent declaration, dichiarazione intento, details, form, upsert, plafond
  @api GET /api/legal-entities/{legalEntity}/customers/{customer}/intent-declarations/{intentDeclaration} (Moddo API)
  @api POST /api/legal-entities/{legalEntity}/customers/{customer}/intent-declarations (Moddo API)
  @api PUT /api/legal-entities/{legalEntity}/customers/{customer}/intent-declarations/{intentDeclaration} (Moddo API)
-->
<script lang="ts" module>
  // eslint-disable-next-line no-import-assign
  export { CustomerIntentDeclarationDetailsContract as contract } from './CustomerIntentDeclarationDetails.contract.js'
</script>

<script lang="ts">
  import { goto } from '$app/navigation'
  import RequestPlaceholder from '$components/core/common/RequestPlaceholder.svelte'
  import BottomBar from '$components/core/form/BottomBar.svelte'
  import BusyButton from '$components/core/form/BusyButton.svelte'
  import DateField from '$components/core/form/DateField.svelte'
  import { FormFieldClass } from '$components/core/form/form.js'
  import FormErrorMessage from '$components/core/form/FormErrorMessage.svelte'
  import FormUtil from '$components/core/form/FormUtil.svelte'
  import NumberField from '$components/core/form/NumberField.svelte'
  import PriceField from '$components/core/form/PriceField.svelte'
  import SelectField from '$components/core/form/SelectField.svelte'
  import SwitchField from '$components/core/form/SwitchField.svelte'
  import TextareaField from '$components/core/form/TextareaField.svelte'
  import TextField from '$components/core/form/TextField.svelte'
  import { v } from '$components/core/form/validation'
  import GroupTitle from '$components/features/globals/GroupTitle.svelte'
  import Separator from '$components/ui/separator/separator.svelte'
  import { RecordActionMenu } from '$lib/components/ui/record-action-menu'
  import { useProvides } from '$lib/contexts/page-state'
  import { useDetailRecord } from '$lib/hooks/use-detail-record.svelte'
  import * as m from '$lib/paraglide/messages'
  import type { Customer, IntentDeclaration } from '$lib/types/api-types'
  import { useBreadcrumbTitle } from '$lib/utils/breadcrumb-title'
  import { intentDeclarationAmountTypeConfig } from '$lib/utils/enum-labels'
  import { createRoute } from '$lib/utils/route-builder'
  import { api } from '$utils/request.js'
  import type { SnippetProps } from '$utils/runtime'
  import { onDestroy, onMount } from 'svelte'
  import { createIntentDeclarationActions, type IntentDeclarationActionOptions } from '../../intent-declaration-actions'
  import { CustomerIntentDeclarationDetailsContract } from './CustomerIntentDeclarationDetails.contract.js'

  let { pageDetails, legalEntity }: SnippetProps = $props()

  const uuid = $derived(pageDetails.params.did)
  const customerId = $derived(pageDetails.params.uuid)
  const legalEntityId = $derived(legalEntity?.id)

  const declarationHandle = useProvides(CustomerIntentDeclarationDetailsContract, 'intentDeclaration')
  const breadcrumbTitle = useBreadcrumbTitle()

  // The declared amount is denominated in the customer's currency.
  let customer = $state<Customer | null>(null)
  const currency = $derived(customer?.default_currency ?? 'EUR')

  onMount(async () => {
    if (legalEntityId && customerId) {
      customer = await api.get<Customer>(`/legal-entities/${legalEntityId}/customers/${customerId}`)
      breadcrumbTitle.setLabel('customer-details', customer.name)
    }
  })

  onDestroy(() => {
    breadcrumbTitle.clearLabel('customer-details')
  })

  const detail = useDetailRecord<IntentDeclaration>({
    getUuid: () => uuid,
    fetch: id =>
      api.safe.get<IntentDeclaration>(
        `/legal-entities/${legalEntityId}/customers/${customerId}/intent-declarations/${id}`,
      ),
    create: data => api.post(`/legal-entities/${legalEntityId}/customers/${customerId}/intent-declarations`, { data }),
    update: (id, data) =>
      api.put(`/legal-entities/${legalEntityId}/customers/${customerId}/intent-declarations/${id}`, { data }),
    getDetailRoute: record =>
      createRoute({ $id: 'customer-intent-declaration-details', params: { uuid: customerId, did: record.id } }),
    onFetched: data => {
      declarationHandle.set(data)
      breadcrumbTitle.setLabel(pageDetails.config.$id, data.protocol)
    },
    cleanup: () => {
      declarationHandle.unset()
      breadcrumbTitle.clearLabel(pageDetails.config.$id)
    },
  })

  const { handleSubmit, handleSuccess, handleFailure, refetch } = detail
  const record = $derived(detail.record)
  const promise = $derived(detail.promise)

  // Once verified (riscontro telematico) the identity fields become immutable and
  // declared_amount is decrease-only — the backend enforces it; we mirror it in the UI.
  const isVerified = $derived(!!record?.verified_at)

  const initialValues = $derived.by(() => ({
    protocol_number: '',
    protocol_progressive: '',
    receipt_date: '',
    reference_year: new Date().getFullYear(),
    amount_type: 'up_to_amount' as const,
    declared_amount: 0,
    is_customs: false,
    note: '',
    ...(record ?? {}),
  }))

  const amountTypeItems = Object.entries(intentDeclarationAmountTypeConfig).map(([value, cfg]) => ({
    value,
    label: cfg.label(),
  }))

  const validateCreate = v
    .schema<Partial<IntentDeclaration>>({
      protocol_number: [v.required()],
      protocol_progressive: [v.required()],
      receipt_date: [v.required()],
      reference_year: [v.required()],
      amount_type: [v.required()],
      declared_amount: [v.required()],
    })
    .build()

  const validateUpdate = v.schema<Partial<IntentDeclaration>>({}).build()

  const validate = $derived(!record ? validateCreate : validateUpdate)

  // Lifecycle record actions (only meaningful in edit mode)
  const declarationActions = $derived(
    legalEntityId && customerId
      ? createIntentDeclarationActions({
          legalEntityId,
          customerId,
          onSuccess: refetch,
          // eslint-disable-next-line svelte/no-navigation-without-resolve
          onArchived: () => goto(createRoute({ $id: 'customer-intent-declarations', params: { uuid: customerId } })),
        })
      : [],
  )

  const actionOptions = $derived.by((): IntentDeclarationActionOptions | null => {
    if (!record) return null
    return {
      targetId: record.id,
      protocol: record.protocol,
      version: record.version,
      status: record.status,
      verifiedAt: record.verified_at,
      revokedAt: record.revoked_at,
      invalidatedAt: record.invalidated_at,
      isArchivable: (record as IntentDeclaration & { is_archivable?: boolean }).is_archivable,
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
      class="relative flex flex-col gap-4 pb-breadcrumbs">
      {#snippet withContext()}
        <FormErrorMessage />

        <GroupTitle heading={m.intent_declaration_protocol_section()}>
          {#snippet description()}
            {m.intent_declaration_protocol_section_description()}
          {/snippet}
          {#snippet content()}
            <TextField
              name="protocol_number"
              label={m.intent_declaration_protocol_number()}
              class={FormFieldClass.MaxWidth}
              disabled={isVerified}
              focus={!record} />
            <TextField
              name="protocol_progressive"
              label={m.intent_declaration_protocol_progressive()}
              class={FormFieldClass.MaxWidth}
              disabled={isVerified} />
            <DateField
              name="receipt_date"
              label={m.intent_declaration_receipt_date()}
              class={FormFieldClass.MaxWidth} />
            <NumberField
              name="reference_year"
              label={m.intent_declaration_reference_year()}
              class={FormFieldClass.MaxWidth}
              step="1"
              disabled={isVerified} />
          {/snippet}
        </GroupTitle>

        <Separator />

        <GroupTitle heading={m.intent_declaration_amount_section()}>
          {#snippet description()}
            {m.intent_declaration_amount_section_description()}
          {/snippet}
          {#snippet content()}
            <SelectField
              name="amount_type"
              label={m.intent_declaration_amount_type()}
              items={amountTypeItems}
              class={FormFieldClass.MaxWidth}
              disabled={isVerified} />

            <div class={FormFieldClass.MaxWidth}>
              <PriceField
                name="declared_amount"
                label={m.intent_declaration_declared_amount()}
                {currency}
                decimals={2} />
            </div>
          {/snippet}
        </GroupTitle>

        <Separator />

        <GroupTitle heading={m.intent_declaration_other_section()}>
          {#snippet description()}
            {m.intent_declaration_other_section_description()}
          {/snippet}
          {#snippet content()}
            <SwitchField name="is_customs" label={m.intent_declaration_customs()} />
            <TextareaField name="note" label={m.intent_declaration_note()} class={FormFieldClass.MaxWidth} />
          {/snippet}
        </GroupTitle>
      {/snippet}

      {#snippet bottom()}
        <BottomBar>
          {#if record && actionOptions}
            <RecordActionMenu buttonVariant="outline" actions={declarationActions} {actionOptions} />
          {/if}
          <BusyButton type="submit">{m.save_changes()}</BusyButton>
        </BottomBar>
      {/snippet}
    </FormUtil>
  {/snippet}
</RequestPlaceholder>
