<script lang="ts">
  import FullCalendar from '$components/features/calendar/FullCalendar.svelte'
  import { apiRequest } from '$lib/utils/request'
  import dayjs from 'dayjs'
  import duration from 'dayjs/plugin/duration'
  import type { EventClickArg, EventInput, EventSourceFuncArg } from 'svelte-fullcalendar'

  type ProductionItem = {
    id: string
    starts_at: string
    ends_at: string
    product_name: string
    product_internal_id: string
    status: 'planned' | 'in_progress' | 'completed'
  }

  dayjs.extend(duration)

  let calendarAPI: (() => any) | undefined = $state(undefined)

  function onEventClick(info: EventClickArg) {
    console.log('Event clicked:', info.event.extendedProps)
  }

  async function onFetchEvents({ start: from, end: to }: EventSourceFuncArg): Promise<EventInput[]> {
    const events = await apiRequest<ProductionItem[]>({
      url: 'product/production/_search',
      method: 'POST',
      data: {
        statuses: [
          {
            status: 'planned',
            from: from.toISOString(),
            to: to.toISOString(),
          },
          {
            status: 'in_progress',
          },
          {
            status: 'completed',
            from: from.toISOString(),
            to: to.toISOString(),
          },
        ],
      },
    })

    return events.map(event => {
      const start = dayjs(event.starts_at)
      const end = dayjs(event.ends_at)
      const duration = dayjs.duration(end.diff(start))
      const adjustedEnd = duration.asDays() >= 1 ? end.add(1, 'day').endOf('day') : end

      return {
        title: `${event.product_name} (${event.product_internal_id})`,
        start: start.toDate(),
        end: adjustedEnd.toDate(),
        allDay: true,
        classNames: 'text-white',
        textColor: 'var(--text-color)',
        extendedProps: {
          ...event,
        },
      }
    })
  }
</script>

<FullCalendar {onFetchEvents} {onEventClick} bind:getAPI={calendarAPI} />
