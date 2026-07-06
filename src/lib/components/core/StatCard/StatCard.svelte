<!--
  @component StatCard
  @description Presentational KPI card with built-in loading / error / empty /
  loaded states. Homogeneous chrome for dashboard metrics: muted title, large
  value, optional trend pill (top-right) and a two-line footer. Optionally the
  whole card is a link. State handling lives here because every KPI shares it;
  callers only feed data.
  @keywords kpi, stat, metric, card, dashboard, trend, skeleton
-->
<script lang="ts">
  import { Badge } from '$lib/components/ui/badge'
  import * as Card from '$lib/components/ui/card'
  import { Skeleton } from '$lib/components/ui/skeleton'
  import { Button } from '$lib/components/ui/button'
  import * as m from '$lib/paraglide/messages.js'
  import { cn } from '$lib/utils.js'
  import TrendingUpIcon from '@lucide/svelte/icons/trending-up'
  import TrendingDownIcon from '@lucide/svelte/icons/trending-down'
  import MinusIcon from '@lucide/svelte/icons/minus'
  import RotateCwIcon from '@lucide/svelte/icons/rotate-cw'
  import AlertCircleIcon from '@lucide/svelte/icons/circle-alert'
  import type { StatCardProps, StatCardSentiment } from './types'

  let {
    title,
    loading = false,
    error = null,
    onRetry,
    empty = false,
    emptyLabel,
    value,
    trend,
    footerTitle,
    footerSubtext,
    tone = 'default',
    href,
    demo = false,
    icon,
    class: className,
  }: StatCardProps = $props()

  const linkable = $derived(!!href && !loading && !error)

  const TrendIcon = $derived(
    trend?.direction === 'down' ? TrendingDownIcon : trend?.direction === 'flat' ? MinusIcon : TrendingUpIcon
  )

  const sentiment = $derived<StatCardSentiment>(
    trend?.sentiment ??
      (trend?.direction === 'up' ? 'positive' : trend?.direction === 'down' ? 'negative' : 'neutral')
  )

  const sentimentClass = $derived(
    sentiment === 'positive'
      ? 'text-emerald-600 dark:text-emerald-400'
      : sentiment === 'negative'
        ? 'text-red-600 dark:text-red-400'
        : 'text-muted-foreground'
  )
</script>

<Card.Root
  class={cn(
    'relative overflow-hidden transition-colors',
    linkable && 'hover:bg-accent/40',
    tone === 'positive' && 'border-emerald-500/30',
    className
  )}>
  <Card.Header>
    <Card.Description class="flex items-center gap-1.5">
      {#if icon}<span class="text-muted-foreground">{@render icon()}</span>{/if}
      {title}
      {#if demo}
        <Badge variant="outline" class="ml-1 h-4 px-1 text-[10px] font-normal text-muted-foreground">
          demo
        </Badge>
      {/if}
    </Card.Description>

    {#if loading}
      <Skeleton class="mt-1 h-8 w-28" />
    {:else if error}
      <Card.Title class="text-2xl font-semibold tabular-nums text-muted-foreground md:text-3xl">
        —
      </Card.Title>
    {:else}
      <Card.Title
        class={cn(
          'text-2xl font-semibold tabular-nums md:text-3xl',
          tone === 'positive' && 'text-emerald-600 dark:text-emerald-400'
        )}>
        {empty ? (emptyLabel ?? '—') : (value ?? '—')}
      </Card.Title>
    {/if}

    {#if trend && !loading && !error && !empty}
      <Card.Action>
        <Badge variant="outline" class={cn('gap-1', sentimentClass)}>
          <TrendIcon class="size-3.5" />
          {trend.label}
        </Badge>
      </Card.Action>
    {/if}
  </Card.Header>

  <Card.Footer class="flex-col items-start gap-1 text-sm">
    {#if loading}
      <Skeleton class="h-4 w-40" />
      <Skeleton class="h-3 w-24" />
    {:else if error}
      <div class="flex items-center gap-1.5 font-medium text-muted-foreground">
        <AlertCircleIcon class="size-4 shrink-0" />
        <span class="line-clamp-1">{error === 'error' ? m.dashboard_load_error() : error}</span>
      </div>
      {#if onRetry}
        <Button
          variant="ghost"
          size="sm"
          class="relative z-10 -ml-2 h-7 px-2 text-xs"
          onclick={onRetry}>
          <RotateCwIcon class="size-3.5" />
          {m.retry()}
        </Button>
      {/if}
    {:else}
      {#if footerTitle}
        <div
          class={cn(
            'flex items-center gap-1.5 font-medium',
            tone === 'positive' && 'text-emerald-600 dark:text-emerald-400'
          )}>
          {footerTitle}
          {#if trend}<TrendIcon class={cn('size-4', sentimentClass)} />{/if}
        </div>
      {/if}
      {#if footerSubtext}
        <div class="text-muted-foreground">{footerSubtext}</div>
      {/if}
    {/if}
  </Card.Footer>

  {#if linkable}
    <!-- Stretched link: covers the card without nesting interactive elements.
         Only rendered when there is no in-card button (error state). -->
    <a href={href} class="absolute inset-0" aria-label={title}>
      <span class="sr-only">{title}</span>
    </a>
  {/if}
</Card.Root>
