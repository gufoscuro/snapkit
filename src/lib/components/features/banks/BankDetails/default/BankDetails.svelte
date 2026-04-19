<!--
  @component BankDetails
  @description Fetches and displays bank details for create/edit.
  Uses useDetailRecord for lifecycle management and FormUtil for form state.
  @keywords bank, details, form, settings
  @api GET /api/legal-entities/{legalEntity}/banks/{bank} (Moddo API)
  @api POST /api/legal-entities/{legalEntity}/banks (Moddo API)
  @api PUT /api/legal-entities/{legalEntity}/banks/{bank} (Moddo API)
-->
<script lang="ts">
  import RequestPlaceholder from '$components/core/common/RequestPlaceholder.svelte'
  import BottomBar from '$components/core/form/BottomBar.svelte'
  import BusyButton from '$components/core/form/BusyButton.svelte'
  import { FormFieldClass } from '$components/core/form/form.js'
  import FormErrorMessage from '$components/core/form/FormErrorMessage.svelte'
  import FormUtil from '$components/core/form/FormUtil.svelte'
  import TextField from '$components/core/form/TextField.svelte'
  import { v } from '$components/core/form/validation'
  import ProvinceSelector from '$components/features/form/ProvinceSelector.svelte'
  import { useDetailRecord } from '$lib/hooks/use-detail-record.svelte'
  import * as m from '$lib/paraglide/messages'
  import type { LegalEntity, LegalEntityBank } from '$lib/types/api-types'
  import { useBreadcrumbTitle } from '$lib/utils/breadcrumb-title'
  import { api } from '$lib/utils/request'

  let { legalEntity, uuid, pageId }: { legalEntity?: LegalEntity | null; uuid?: string; pageId?: string } = $props()

  const legalEntityId = $derived(legalEntity?.id)
  const breadcrumbTitle = useBreadcrumbTitle()

  const detail = useDetailRecord<LegalEntityBank>({
    getUuid: () => uuid,
    fetch: id => api.safe.get<LegalEntityBank>(`/legal-entities/${legalEntityId}/banks/${id}`),
    create: data => api.post(`/legal-entities/${legalEntityId}/banks`, { data }),
    update: (id, data) => api.put(`/legal-entities/${legalEntityId}/banks/${id}`, { data }),
    getDetailRoute: record => `/settings/banks/upsert/${record.id}`,
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

  const initialValues = $derived.by(() => ({
    code: '',
    name: '',
    branch: '',
    abi: '',
    cab: '',
    cin: '',
    account_number: '',
    iban: '',
    address: '',
    city: '',
    province: '',
    postal_code: '',
    country_code: '',
    bic_swift: '',
    ...(record ?? {}),
  }))

  const validateCreate = v
    .schema<Partial<LegalEntityBank>>({
      code: [v.required(), v.maxLength(20)],
      name: [v.required(), v.maxLength(100)],
      branch: [v.maxLength(100)],
      abi: [v.maxLength(5)],
      cab: [v.maxLength(5)],
      cin: [v.maxLength(1)],
      account_number: [v.maxLength(30)],
      iban: [v.maxLength(34)],
      address: [v.maxLength(255)],
      city: [v.maxLength(255)],
      province: [v.maxLength(255)],
      postal_code: [v.maxLength(10)],
      country_code: [v.maxLength(2)],
      bic_swift: [v.maxLength(11)],
    })
    .build()

  const validateUpdate = v
    .schema<Partial<LegalEntityBank>>({
      code: [v.maxLength(20)],
      name: [v.maxLength(100)],
      branch: [v.maxLength(100)],
      abi: [v.maxLength(5)],
      cab: [v.maxLength(5)],
      cin: [v.maxLength(1)],
      account_number: [v.maxLength(30)],
      iban: [v.maxLength(34)],
      address: [v.maxLength(255)],
      city: [v.maxLength(255)],
      province: [v.maxLength(255)],
      postal_code: [v.maxLength(10)],
      country_code: [v.maxLength(2)],
      bic_swift: [v.maxLength(11)],
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
        <TextField name="branch" label={m.bank_branch()} class={FormFieldClass.MaxWidth} />
        <TextField name="iban" label={m.bank_iban()} class={FormFieldClass.MaxWidth} />
        <TextField name="bic_swift" label={m.bank_bic_swift()} class={FormFieldClass.MaxWidth} />

        <div class="max-w-2xl gap-4 md:flex">
          <TextField name="abi" label={m.bank_abi()} width="w-auto" />
          <TextField name="cab" label={m.bank_cab()} width="w-auto" />
          <TextField name="cin" label={m.bank_cin()} width="w-auto" />
        </div>

        <TextField name="account_number" label={m.bank_account_number()} class={FormFieldClass.MaxWidth} />
        <TextField name="address" label={m.bank_address()} class={FormFieldClass.MaxWidth} />

        <div class="max-w-xl gap-4 md:flex">
          <TextField name="city" label={m.bank_city()} width="w-auto" />
          <ProvinceSelector name="province" label={m.bank_province()} width="w-auto" />
        </div>

        <div class="max-w-xl gap-4 md:flex">
          <TextField name="postal_code" label={m.bank_postal_code()} width="w-auto" />
          <TextField name="country_code" label={m.bank_country_code()} width="w-auto" />
        </div>

        <BottomBar>
          <BusyButton type="submit">{m.save_changes()}</BusyButton>
        </BottomBar>
      {/snippet}
    </FormUtil>
  {/snippet}
</RequestPlaceholder>
