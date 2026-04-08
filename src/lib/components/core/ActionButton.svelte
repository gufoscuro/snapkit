<!--
  @component ActionButton
  @description Icon button with optional tooltip. Wraps BusyButton so it supports
  loading/busy states out of the box. When `tooltip` is provided, the button is
  wrapped in a Tooltip and an aria-label is set automatically.
  @keywords action, icon, button, tooltip, busy
  @uses BusyButton, Tooltip
-->
<script lang="ts">
  import BusyButton from '$components/core/form/BusyButton.svelte'
  import * as Tooltip from '$components/ui/tooltip'
  import type { ComponentProps } from 'svelte'

  type BusyButtonProps = ComponentProps<typeof BusyButton>

  type TooltipSide = 'top' | 'right' | 'bottom' | 'left'
  type TooltipAlign = 'start' | 'center' | 'end'

  type Props = BusyButtonProps & {
    /** Tooltip text. Also sets aria-label for accessibility. */
    tooltip?: string
    /** Tooltip placement side. @default 'top' */
    tooltipSide?: TooltipSide
    /** Tooltip side offset in px. @default 0 */
    tooltipSideOffset?: number
    /** Tooltip alignment. @default 'center' */
    tooltipAlign?: TooltipAlign
    /** Tooltip alignment offset in px. @default 0 */
    tooltipAlignOffset?: number
  }

  let {
    tooltip,
    tooltipSide,
    tooltipSideOffset,
    tooltipAlign,
    tooltipAlignOffset,
    children,
    ...restProps
  }: Props = $props()
</script>

{#if tooltip}
  <Tooltip.Root>
    <Tooltip.Trigger>
      {#snippet child({ props })}
        <BusyButton {...props} {...restProps} aria-label={tooltip}>
          {@render children()}
        </BusyButton>
      {/snippet}
    </Tooltip.Trigger>
    <Tooltip.Content side={tooltipSide} sideOffset={tooltipSideOffset} align={tooltipAlign} alignOffset={tooltipAlignOffset}>
      {tooltip}
    </Tooltip.Content>
  </Tooltip.Root>
{:else}
  <BusyButton {...restProps}>
    {@render children()}
  </BusyButton>
{/if}
