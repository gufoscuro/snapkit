<!--
  @component DeliveryDateCell
  @description Compact table cell stacking a line's confirmed and requested delivery
  dates: the confirmed date on top, the requested date muted underneath. The operative
  delivery date (confirmed, or requested when unconfirmed) is coloured amber when it
  falls today and red once overdue. Parses the calendar day locally (never through UTC)
  to avoid the near-midnight day shift.
  @keywords delivery, schedule, date, requested, confirmed, overdue, due today, cell, table
-->
<script lang="ts">
  import * as m from '$lib/paraglide/messages.js'
  import { calendarDayParts, todayLocalISO } from '$lib/utils/date'

  let { requested, confirmed }: { requested?: string | null; confirmed?: string | null } = $props()

  // Format a serialized calendar-day value in UTC (built from its local parts) so the
  // displayed day matches the stored calendar day regardless of the viewer's timezone.
  function format(value?: string | null): string {
    const parts = calendarDayParts(value ?? undefined)
    if (!parts) return '-'
    const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day))
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'short', timeZone: 'UTC' }).format(date)
  }

  const confirmedText = $derived(format(confirmed))
  const requestedText = $derived(format(requested))

  // The operative delivery date drives the due/overdue colouring: confirmed wins,
  // otherwise fall back to the requested date.
  const effective = $derived(confirmed || requested || null)

  // Compare the operative day to today as a plain integer (YYYYMMDD), sidestepping any
  // timezone arithmetic. amber = due today, red = overdue.
  const status = $derived.by((): 'due-today' | 'overdue' | null => {
    const parts = calendarDayParts(effective ?? undefined)
    const today = calendarDayParts(todayLocalISO())
    if (!parts || !today) return null
    const asNumber = (p: { year: number; month: number; day: number }) => p.year * 10000 + p.month * 100 + p.day
    const diff = asNumber(parts) - asNumber(today)
    if (diff === 0) return 'due-today'
    if (diff < 0) return 'overdue'
    return null
  })

  const statusClass = $derived(
    status === 'overdue' ? 'text-destructive' : status === 'due-today' ? 'text-amber-500' : '',
  )
  const statusTitle = $derived(
    status === 'overdue' ? m.delivery_overdue() : status === 'due-today' ? m.delivery_due_today() : undefined,
  )
</script>

<div class="flex flex-col leading-tight {statusClass}" title={statusTitle}>
  <span class="text-sm">
    <span class="text-muted-foreground">{m.delivery_confirmed_short()}:</span>
    <span class="font-medium">{confirmedText}</span>
  </span>
  <span class="text-xs {statusClass ? '' : 'text-muted-foreground'}">
    <span class="text-muted-foreground">{m.delivery_requested_short()}:</span>
    {requestedText}
  </span>
</div>
