<!--
  @component DeliveryDateCell
  @description Compact table cell fusing a line's requested and confirmed delivery
  dates into one: shows the confirmed date, or the requested date rendered muted
  with a clock marker when no confirmation exists yet. Parses the calendar day
  locally (never through UTC) to avoid the near-midnight day shift.
  @keywords delivery, schedule, date, requested, confirmed, cell, table
-->
<script lang="ts">
  import * as m from '$lib/paraglide/messages.js'
  import { calendarDayParts } from '$lib/utils/date'
  import IconClock from '@tabler/icons-svelte/icons/clock'

  let { requested, confirmed }: { requested?: string | null; confirmed?: string | null } = $props()

  // Confirmed wins; otherwise fall back to the requested date and flag it as not-yet-confirmed.
  const effective = $derived(confirmed || requested || null)
  const unconfirmed = $derived(!confirmed && !!requested)

  const formatted = $derived.by(() => {
    const parts = calendarDayParts(effective ?? undefined)
    if (!parts) return '-'
    // Build a UTC-midnight date from the local calendar parts and format in UTC,
    // so the displayed day matches the stored calendar day regardless of timezone.
    const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day))
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'short', timeZone: 'UTC' }).format(date)
  })
</script>

{#if effective}
  <span
    class="inline-flex items-center gap-1 {unconfirmed ? 'text-muted-foreground' : ''}"
    title={unconfirmed ? m.delivery_date_unconfirmed() : undefined}>
    {formatted}
    {#if unconfirmed}
      <IconClock class="size-3" aria-label={m.delivery_date_unconfirmed()} />
    {/if}
  </span>
{:else}
  -
{/if}
