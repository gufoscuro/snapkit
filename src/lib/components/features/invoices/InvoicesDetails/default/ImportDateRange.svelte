<!--
  @component ImportDateRange
  @description Context-free date-range control for the invoice import picker.
  Clears the surrounding form context (like InvoiceDueDatesEditor) so its two
  DateFields don't autowire into the invoice form — they only scope the
  invoiceable-documents picker (`date_from` / `date_to`) used to gather the DDTs
  of a cumulative (riepilogativa) invoice. Emits plain `YYYY-MM-DD` strings.
  @keywords invoice, import, date-range, filter, cumulative, riepilogativa
  @uses DateField
-->
<script lang="ts">
  import DateField from '$components/core/form/DateField.svelte'
  import { clearFormContext } from '$components/core/form/form-context'
  import * as m from '$lib/paraglide/messages'

  type Props = {
    from?: string
    to?: string
    onFromChange?: (value: string) => void
    onToChange?: (value: string) => void
    class?: string
  }

  let { from = '', to = '', onFromChange, onToChange, class: className = '' }: Props = $props()

  // Detach from the parent invoice form so the DateFields below don't register as
  // form fields (they are picker filters, not part of the invoice payload).
  clearFormContext()

  /** DateField hands back a UTC-midnight Date; keep only the calendar day. */
  function toIsoDay(date: Date | null): string {
    return date ? date.toISOString().slice(0, 10) : ''
  }
</script>

<div class="flex items-end gap-2 {className}">
  <DateField
    name="import_date_from"
    label={m.date_from()}
    value={from}
    width="w-40"
    allowClear
    onChange={date => onFromChange?.(toIsoDay(date))} />
  <DateField
    name="import_date_to"
    label={m.date_to()}
    value={to}
    width="w-40"
    allowClear
    onChange={date => onToChange?.(toIsoDay(date))} />
</div>
