<script lang="ts" module>
  export const CalendarMode = Object.freeze({
    Month: 'dayGridMonth',
    Year: 'dayGridYear',
  })
  export type CalendarMode = (typeof CalendarMode)[keyof typeof CalendarMode]
</script>

<script lang="ts">
  import daygridPlugin from '@fullcalendar/daygrid'
  import interactionPlugin from '@fullcalendar/interaction'
  import type { CalendarOptions, EventClickArg, EventInput, EventSourceFuncArg } from 'svelte-fullcalendar'
  import FullCalendar from 'svelte-fullcalendar'

  interface Props {
    mode?: CalendarMode
    options?: CalendarOptions
    onEventClick?: (info: EventClickArg) => void
    onFetchEvents?: (fetchInfo: EventSourceFuncArg) => Promise<EventInput[]>
    getAPI?: () => any
  }

  let {
    mode = CalendarMode.Month,
    options = {},
    onEventClick = () => {},
    onFetchEvents = async () => [],
    getAPI = $bindable(),
  }: Props = $props()

  let loading = $state(false)
  let calendarAPI: (() => any) | null = $state(null)

  $effect(() => {
    getAPI = () => (calendarAPI ? calendarAPI() : null)
  })

  const language = 'en'

  const defaultOptions: CalendarOptions = $derived({
    height: '100%',
    aspectRatio: 2,
    initialView: mode,
    themeSystem: 'standard',
    headerToolbar: {
      left: 'title',
      end: 'prev,next',
    },
    titleFormat: { year: 'numeric', month: 'long' },
    plugins: [daygridPlugin, interactionPlugin],
    locale: language.includes('en') ? 'en' : 'it',
    firstDay: language.includes('en') ? 0 : 1,
    displayEventTime: false,
    hiddenDays: [0, 6],

    events: async function (fetchInfo, successCallback) {
      try {
        loading = true
        const nextEvents: EventInput[] = await onFetchEvents(fetchInfo)
        successCallback(nextEvents)
      } catch (error) {
        console.error('Error fetching events:', error)
      } finally {
        loading = false
      }
    },
    eventClick: function (info: EventClickArg) {
      onEventClick(info)
    },

    ...options,
  })
</script>

<div class="FullCalendar relative h-full w-full text-sm" class:selectable={options.selectable}>
  <FullCalendar options={defaultOptions} bind:getAPI={calendarAPI} />
</div>

<style lang="postcss">
  @reference "tailwindcss";

  .FullCalendar {
    --fc-small-font-size: 0.85em;
    --fc-page-bg-color: var(--background);
    --fc-neutral-bg-color: var(--background);
    --fc-neutral-text-color: #808080;
    --fc-border-color: var(--border);

    --fc-button-text-color: var(--foreground);
    --fc-button-bg-color: color-mix(in oklch, var(--secondary) 30%, transparent);
    --fc-button-hover-bg-color: var(--secondary);
    --fc-button-active-bg-color: var(--secondary);
    --fc-button-border-color: var(--border);
    --fc-button-hover-border-color: var(--border);
    --fc-button-active-border-color: var(--border);
  }

  .FullCalendar :global(.fc-button) {
    @apply rounded-md;
  }
  .FullCalendar :global(.fc-button:focus) {
    outline: none;
    box-shadow: none;
  }

  .FullCalendar :global(.fc-toolbar-title) {
    @apply text-xl font-semibold capitalize;
  }

  .FullCalendar :global(.fc-col-header-cell) {
    background-color: color-mix(in oklch, var(--muted) 30%, transparent);
    @apply capitalize;
  }

  .FullCalendar :global(.fc-scroller) {
    @apply snap-y snap-proximity scroll-smooth;
  }

  .FullCalendar :global(.fc-daygrid-body tr[role='row']) {
    @apply snap-start;
  }

  .FullCalendar :global(.fc-event-title-container) {
    @apply px-1 leading-[14px];
  }

  .FullCalendar :global(.fc-event-main),
  .FullCalendar :global(.fc-event-title-container) {
    @apply cursor-pointer;
  }

  .FullCalendar.selectable :global(.fc-daygrid-day-frame) {
    @apply cursor-pointer;
  }
  /* .FullCalendar.selectable :global(.fc-daygrid-day-frame:hover) {
    @apply bg-info/10;
  } */
</style>
