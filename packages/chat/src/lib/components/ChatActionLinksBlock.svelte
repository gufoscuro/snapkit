<script lang="ts">
  /* eslint-disable svelte/no-navigation-without-resolve */
  import { buttonVariants } from '../ui/button'
  import type { ToolUseBlock } from '../types'

  type Variant = 'default' | 'secondary' | 'outline'
  type Link = { label: string; url: string; description?: string; variant?: Variant }

  let { block }: { block: ToolUseBlock } = $props()

  const title = $derived(typeof block.input.title === 'string' ? (block.input.title as string) : null)
  const description = $derived(
    typeof block.input.description === 'string' ? (block.input.description as string) : null,
  )
  const links = $derived<Link[]>(
    Array.isArray(block.input.links)
      ? (block.input.links as unknown[])
          .filter(
            (l): l is { label: unknown; url: unknown; description?: unknown; variant?: unknown } =>
              !!l && typeof l === 'object',
          )
          .filter(l => typeof l.label === 'string' && typeof l.url === 'string')
          .map(l => ({
            label: l.label as string,
            url: l.url as string,
            description: typeof l.description === 'string' ? l.description : undefined,
            variant: l.variant === 'secondary' || l.variant === 'outline' ? l.variant : 'default',
          }))
      : [],
  )
</script>

{#if links.length > 0}
  <div class="rounded-md border bg-background/60 p-3">
    {#if title}
      <div class="text-sm font-medium">{title}</div>
    {/if}
    {#if description}
      <div class="mt-1 text-xs text-muted-foreground">{description}</div>
    {/if}
    <div class="mt-3 flex flex-wrap gap-2">
      {#each links as link (link.url)}
        <a
          class={buttonVariants({ variant: link.variant, size: 'sm' })}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          title={link.description}>
          {link.label}
        </a>
      {/each}
    </div>
  </div>
{/if}
