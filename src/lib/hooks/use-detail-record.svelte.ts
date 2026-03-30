import { goto } from '$app/navigation'
import type { FailurePayload, SuccessPayload } from '$components/core/form/FormUtil.svelte'
import * as m from '$lib/paraglide/messages'
import type { SafeApiResponse } from '$lib/utils/request'
import { toast } from 'svelte-sonner'

export type DetailRecordOptions<T extends { id: string }> = {
  /**
   * Returns the UUID from route params.
   * Returns undefined when in create mode (no uuid in URL).
   */
  getUuid: () => string | undefined
  /**
   * Fetches the record by UUID.
   * Should use the api client's safe method (e.g. api.safe.get).
   */
  fetch: (uuid: string) => Promise<SafeApiResponse<T>>
  /**
   * Creates a new record. Should throw on error (FormUtil catches it).
   * Should use the api client (e.g. api.post).
   */
  create: (data: Record<string, unknown>) => Promise<unknown>
  /**
   * Updates an existing record. Should throw on error (FormUtil catches it).
   * Should use the api client (e.g. api.put).
   */
  update: (uuid: string, data: Record<string, unknown>) => Promise<unknown>
  /**
   * Returns the route to navigate to after a successful create.
   */
  getDetailRoute: (record: T) => string
  /** Called after a successful GET with the retrieved record. */
  onFetched?: (record: T) => void
  /** Called after a successful GET or an update of the record */
  onUpdated?: (record: T) => void
  /** Called on component unmount (breadcrumb clear, page-state unset, etc.). */
  cleanup?: () => void
  /** Extra data merged into every submit payload (e.g. `{ custom_fields: {} }`). */
  extraSubmitData?: Record<string, unknown>
}

/**
 * Composable that manages the full lifecycle of a create/update detail form.
 *
 * - Fetches the record by UUID (skipped in create mode)
 * - Submits create or update based on whether a record is loaded
 * - After create, navigates to the detail page of the new record
 * - After update, refreshes local state with the API response
 * - Handles success toast and failure toast+log consistently
 *
 * The hook is API-agnostic: consumers provide their own fetch/create/update
 * callbacks using the appropriate api client.
 *
 * **IMPORTANT — reactivity:** `record`, `promise` and `isCreate` are reactive
 * properties backed by `$state`/`$derived`. Do NOT destructure them directly —
 * use `$derived` in the consuming component to preserve tracking:
 *
 * @example
 * const detail = useDetailRecord<Customer>({
 *   getUuid: () => uuid,
 *   fetch:  (id) => api.safe.get<Customer>(`/legal-entities/${legalEntityId}/customers/${id}`),
 *   create: (data) => api.post(`/legal-entities/${legalEntityId}/customers`, { data }),
 *   update: (id, data) => api.put(`/legal-entities/${legalEntityId}/customers/${id}`, { data }),
 *   getDetailRoute: (record) => createRoute({ $id: 'customer-details', params: { uuid: record.id } }),
 *   onFetched: (data) => { breadcrumbTitle.setLabel(pageDetails.config.$id, data.name) },
 *   cleanup:   ()     => { breadcrumbTitle.clearLabel(pageDetails.config.$id) },
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

    // Reading uuid and calling fetch/create/update callbacks synchronously
    // before the first await ensures $effect tracks all reactive dependencies
    // (e.g. legalEntityId closures) and re-runs when they change.
    const req = options.fetch(uuid)
    promise = req

    const { data } = await req
    record = data
    if (data) {
      options.onFetched?.(data)
      options.onUpdated?.(data)
    }
  }

  $effect(() => {
    fetchRecord()
    return () => options.cleanup?.()
  })

  async function handleSubmit(values: Partial<T>): Promise<void> {
    const uuid = options.getUuid()
    const data = { ...values, ...options.extraSubmitData }

    if (!record) {
      return options.create(data) as Promise<void>
    }

    return options.update(uuid!, data) as Promise<void>
  }

  function handleSuccess({ result }: SuccessPayload<unknown>) {
    toast.success(m.changes_saved())

    if (!record) {
      // eslint-disable-next-line svelte/no-navigation-without-resolve
      goto(options.getDetailRoute(result as T), { replaceState: true })
      return
    }

    if (result) {
      record = result as T
      options.onUpdated?.(record)
    }
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
    refetch: fetchRecord,
  }
}
