<!--
  @component PaymentTermDetails
  @description Fetches and displays payment term details for create/edit.
  Uses useDetailRecord for lifecycle management and FormUtil for form state.
  Includes PaymentTermDueDatesEditor for the terms field.
  @keywords payment-term, details, form, settings
  @api GET /api/legal-entities/{legalEntity}/payment-terms/{paymentTerm} (Moddo API)
  @api POST /api/legal-entities/{legalEntity}/payment-terms (Moddo API)
  @api PUT /api/legal-entities/{legalEntity}/payment-terms/{paymentTerm} (Moddo API)
-->
<script lang="ts">
  import RequestPlaceholder from '$components/core/common/RequestPlaceholder.svelte'
  import BottomBar from '$components/core/form/BottomBar.svelte'
  import BusyButton from '$components/core/form/BusyButton.svelte'
  import { FormFieldClass } from '$components/core/form/form.js'
  import FormErrorMessage from '$components/core/form/FormErrorMessage.svelte'
  import FormUtil from '$components/core/form/FormUtil.svelte'
  import SwitchField from '$components/core/form/SwitchField.svelte'
  import TextField from '$components/core/form/TextField.svelte'
  import { v } from '$components/core/form/validation'
  import PaymentTermDueDatesEditor, { termsRequired } from '$components/features/form/PaymentTermDueDatesEditor.svelte'
  import { useDetailRecord } from '$lib/hooks/use-detail-record.svelte'
  import * as m from '$lib/paraglide/messages'
  import type { LegalEntity, PaymentTerm, PaymentTermTerms } from '$lib/types/api-types'
  import { useBreadcrumbTitle } from '$lib/utils/breadcrumb-title'
  import { api } from '$lib/utils/request'

  let { legalEntity, uuid, pageId }: { legalEntity?: LegalEntity | null; uuid?: string; pageId?: string } = $props()

  const legalEntityId = $derived(legalEntity?.id)
  const breadcrumbTitle = useBreadcrumbTitle()

  const detail = useDetailRecord<PaymentTerm>({
    getUuid: () => uuid,
    fetch: id => api.safe.get<PaymentTerm>(`/legal-entities/${legalEntityId}/payment-terms/${id}`),
    create: data => api.post(`/legal-entities/${legalEntityId}/payment-terms`, { data }),
    update: (id, data) => api.put(`/legal-entities/${legalEntityId}/payment-terms/${id}`, { data }),
    getDetailRoute: record => `/settings/payment-terms/upsert/${record.id}`,
    onFetched: data => {
      if (pageId) breadcrumbTitle.setLabel(pageId, data.name)
    },
    cleanup: () => {
      if (pageId) breadcrumbTitle.clearLabel(pageId)
    },
  })

  const { handleSubmit, handleSuccess, handleFailure } = detail
  const record = $derived(detail.record)
  const promise = $derived(detail.promise)

  const defaultTerms: PaymentTermTerms = {
    reference_date: 'end_of_month',
    due_dates: [],
  }

  const initialValues = $derived.by(() => ({
    code: '',
    name: '',
    description: '',
    is_active: true,
    terms: defaultTerms,
    ...(record ?? {}),
  }))

  const validateCreate = v
    .schema<Partial<PaymentTerm>>({
      code: [v.required(), v.maxLength(255)],
      name: [v.required(), v.maxLength(255)],
      description: [v.maxLength(255)],
      terms: [termsRequired()],
    })
    .build()

  const validateUpdate = v
    .schema<Partial<PaymentTerm>>({
      code: [v.maxLength(255)],
      name: [v.maxLength(255)],
      description: [v.maxLength(255)],
    })
    .build()

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
      class="flex flex-col gap-4">
      {#snippet withContext()}
        <FormErrorMessage />

        <TextField name="code" label={m.code()} class={FormFieldClass.MaxWidth} focus={!record} />
        <TextField name="name" label={m.name()} class={FormFieldClass.MaxWidth} />
        <TextField name="description" label={m.description()} class={FormFieldClass.MaxWidth} />
        <SwitchField name="is_active" label={m.active()} />

        <PaymentTermDueDatesEditor
          name="terms"
          value={initialValues.terms}
          required />

        <BottomBar>
          <BusyButton type="submit">{m.save_changes()}</BusyButton>
        </BottomBar>
      {/snippet}
    </FormUtil>
  {/snippet}
</RequestPlaceholder>
