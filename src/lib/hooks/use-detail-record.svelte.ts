import { goto } from '$app/navigation'
import type { FailurePayload, SuccessPayload } from '$components/core/form/FormUtil.svelte'
import * as m from '$lib/paraglide/messages'
import { apiRequest, safeApiRequest, type SafeApiResponse } from '$lib/utils/request'
import { createRoute } from '$lib/utils/route-builder'
import { toast } from 'svelte-sonner'

export type DetailRecordOptions<T extends { id: string }> = {
  /**
   * Returns the UUID from route params.
   * Returns undefined when in create mode (no uuid in URL).
   */
  getUuid: () => string | undefined
  /**
   * Builds the GET URL for fetching the record.
   * Called with the current uuid (guaranteed non-empty).
   */
  fetchUrl: (uuid: string) => string
  /**
   * Builds the POST URL for creating a new record.
   */
  createUrl: () => string
  /**
   * Builds the PUT URL for updating an existing record.
   * Called with the current uuid (guaranteed non-empty).
   */
  updateUrl: (uuid: string) => string
  /** Page $id to navigate to after a successful create, e.g. 'customer-details'. */
  detailPageId: string
  /** Called after a successful GET with the retrieved record. */
  onFetched?: (record: T) => void
  /** Called on component unmount (breadcrumb clear, page-state unset, etc.). */
  cleanup?: () => void
  /** Extra data merged into every submit payload (e.g. `{ custom_fields: {} }`). */
  extraSubmitData?: Record<string, unknown>
}

/**
 * Composable that manages the full lifecycle of a create/update detail form.
 *
 * - Fetches the record by UUID (skipped in create mode)
 * - Submits POST (create) or PUT (update) based on whether a record is loaded
 * - After create, navigates to the detail page of the new record
 * - After update, refreshes local state with the API response
 * - Handles success toast and failure toast+log consistently
 *
 * **IMPORTANT — reactivity:** `record`, `promise` and `isCreate` are reactive
 * properties backed by `$state`/`$derived`. Do NOT destructure them directly —
 * use `$derived` in the consuming component to preserve tracking:
 *
 * @example
 * const detail = useDetailRecord<Customer>({
 *   getUuid: () => uuid,
 *   fetchUrl:  (id) => `/legal-entities/${legalEntityId}/customers/${id}`,
 *   createUrl: ()   => `/legal-entities/${legalEntityId}/customers`,
 *   updateUrl: (id) => `/legal-entities/${legalEntityId}/customers/${id}`,
 *   detailPageId: 'customer-details',
 *   onFetched: (data) => { breadcrumbTitle.set(data.name) },
 *   cleanup:   ()     => { breadcrumbTitle.clear() },
 *   extraSubmitData: { custom_fields: {} },
 * })
 *
 * const customer = $derived(detail.record)
 * const promise  = $derived(detail.promise)
 * const { handleSubmit, handleSuccess, handleFailure } = detail
 */
export function useDetailRecord<T extends { id: string }>(options: DetailRecordOptions<T>) {
  let record = $state<T | null>(null)
  let promise = $state<Promise<SafeApiResponse<T>> | null>(null)

  /** True when there is no UUID param in the route (i.e. we are on the create page). */
  const isCreate = $derived(!options.getUuid())

  async function fetchRecord() {
    const uuid = options.getUuid()
    if (!uuid) return

    // Reading uuid and calling fetchUrl/createUrl/updateUrl callbacks synchronously
    // before the first await ensures $effect tracks all reactive dependencies
    // (e.g. legalEntityId closures) and re-runs when they change.
    const url = options.fetchUrl(uuid)

    const req = safeApiRequest<T>({ url, method: 'GET' })
    promise = req

    const { data } = await req
    record = data
    if (data) options.onFetched?.(data)
  }

  $effect(() => {
    fetchRecord()
    return () => options.cleanup?.()
  })

  async function handleSubmit(values: Partial<T>): Promise<void> {
    const uuid = options.getUuid()
    const data = { ...values, ...options.extraSubmitData }

    if (!record) {
      return apiRequest({ method: 'POST', url: options.createUrl(), data })
    }

    return apiRequest({ method: 'PUT', url: options.updateUrl(uuid!), data })
  }

  function handleSuccess({ result }: SuccessPayload<unknown>) {
    toast.success(m.changes_saved())

    if (!record) {
      // eslint-disable-next-line svelte/no-navigation-without-resolve
      goto(createRoute({ $id: options.detailPageId, params: { uuid: (result as T).id } }))
      return
    }

    if (result) record = result as T
  }

  function handleFailure(payload: FailurePayload) {
    toast.error(m.common_error())
    console.error('[useDetailRecord] failure:', payload)
  }

  return {
    get record() {
      return record
    },
    get promise() {
      return promise
    },
    get isCreate() {
      return isCreate
    },
    handleSubmit,
    handleSuccess,
    handleFailure,
  }
}
