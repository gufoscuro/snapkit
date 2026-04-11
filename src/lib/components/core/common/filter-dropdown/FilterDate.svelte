<script lang="ts">
  import { Button } from '$lib/components/ui/button'
  import { Calendar } from '$lib/components/ui/calendar'
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
  import * as m from '$lib/paraglide/messages'
  import type { DateFilterConfig } from '$lib/utils/filters'
  import { getLocalTimeZone, today, type DateValue } from '@internationalized/date'

  interface Props {
    entry: DateFilterConfig
    value: DateValue | undefined
    onchange: (value: DateValue | undefined) => void
    standalone?: boolean
  }

  const { entry, value, onchange, standalone = false }: Props = $props()

  const todayDate = today(getLocalTimeZone())
  const minValue = $derived(!(entry.allowPast ?? true) ? todayDate : undefined)
  const maxValue = $derived(!(entry.allowFuture ?? true) ? todayDate : undefined)
</script>

{#snippet calendarContent()}
  <div class="p-1">
    <Calendar type="single" {value} onValueChange={v => onchange(v)} {minValue} {maxValue} />
    {#if value}
      <div class="flex justify-center pb-2">
        <Button variant="ghost" size="sm" onclick={() => onchange(undefined)}>
          {m.filters_remove()}
        </Button>
      </div>
    {/if}
  </div>
{/snippet}

{#if standalone}
  {@render calendarContent()}
{:else}
  <DropdownMenu.Sub>
    <DropdownMenu.SubTrigger class="text-xs">
      {entry.label}
      {#if value}
        <span class="ms-auto text-xs text-muted-foreground">
          {value.toDate(getLocalTimeZone()).toLocaleDateString()}
        </span>
      {/if}
    </DropdownMenu.SubTrigger>
    <DropdownMenu.SubContent class="p-0">
      {@render calendarContent()}
    </DropdownMenu.SubContent>
  </DropdownMenu.Sub>
{/if}
