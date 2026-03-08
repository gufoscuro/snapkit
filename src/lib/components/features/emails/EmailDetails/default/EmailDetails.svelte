<!--
  @component EmailDetails
  @description Fetches and displays email details for create/edit.
  Uses useDetailRecord for lifecycle management and FormUtil for form state.
  @keywords email, details, form, settings
  @api GET /api/legal-entities/{legalEntity}/emails/{email} (Moddo API)
  @api POST /api/legal-entities/{legalEntity}/emails (Moddo API)
  @api PUT /api/legal-entities/{legalEntity}/emails/{email} (Moddo API)
-->
<script lang="ts">
  import RequestPlaceholder from '$components/core/common/RequestPlaceholder.svelte'
  import BusyButton from '$components/core/form/BusyButton.svelte'
  import { FormFieldClass } from '$components/core/form/form.js'
  import FormErrorMessage from '$components/core/form/FormErrorMessage.svelte'
  import FormUtil from '$components/core/form/FormUtil.svelte'
  import TextField from '$components/core/form/TextField.svelte'
  import { v } from '$components/core/form/validation'
  import { useDetailRecord } from '$lib/hooks/use-detail-record.svelte'
  import * as m from '$lib/paraglide/messages'
  import type { LegalEntity, LegalEntityEmail } from '$lib/types/api-types'
  import { useBreadcrumbTitle } from '$lib/utils/breadcrumb-title'
  import { api } from '$lib/utils/request'

  let { legalEntity, uuid }: { legalEntity?: LegalEntity | null; uuid?: string } = $props()

  const legalEntityId = $derived(legalEntity?.id)
  const breadcrumbTitle = useBreadcrumbTitle()

  const detail = useDetailRecord<LegalEntityEmail>({
    getUuid: () => uuid,
    fetch: id => api.safe.get<LegalEntityEmail>(`/legal-entities/${legalEntityId}/emails/${id}`),
    create: data => api.post(`/legal-entities/${legalEntityId}/emails`, { data }),
    update: (id, data) => api.put(`/legal-entities/${legalEntityId}/emails/${id}`, { data }),
    getDetailRoute: record => `/settings/emails/upsert/${record.id}`,
    onFetched: data => {
      breadcrumbTitle.set(data.label)
    },
    cleanup: () => {
      breadcrumbTitle.clear()
    },
  })

  const { handleSubmit, handleSuccess, handleFailure } = detail
  const record = $derived(detail.record)
  const promise = $derived(detail.promise)

  const initialValues = $derived.by(() => ({
    label: '',
    email: '',
    display_name: '',
    reply_to: '',
    ...(record ?? {}),
  }))

  const validateCreate = v
    .schema<Partial<LegalEntityEmail>>({
      label: [v.required(), v.maxLength(255)],
      email: [v.required(), v.maxLength(255), v.email()],
      display_name: [v.maxLength(255)],
      reply_to: [v.maxLength(255), v.email()],
    })
    .build()

  const validateUpdate = v
    .schema<Partial<LegalEntityEmail>>({
      label: [v.maxLength(255)],
      email: [v.maxLength(255), v.email()],
      display_name: [v.maxLength(255)],
      reply_to: [v.maxLength(255), v.email()],
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

        <TextField name="label" label={m.email_label()} class={FormFieldClass.MaxWidth} focus={!record} />
        <TextField name="email" label={m.email()} class={FormFieldClass.MaxWidth} />
        <TextField name="display_name" label={m.email_display_name()} class={FormFieldClass.MaxWidth} />
        <TextField name="reply_to" label={m.email_reply_to()} class={FormFieldClass.MaxWidth} />

        <div class="fixed right-0 bottom-0 flex h-14 w-full items-center justify-end px-4">
          <BusyButton type="submit">{m.save_changes()}</BusyButton>
        </div>
      {/snippet}
    </FormUtil>
  {/snippet}
</RequestPlaceholder>
