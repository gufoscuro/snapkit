<script lang="ts">
  import * as Command from '../ui/command'
  import * as Popover from '../ui/popover'
  import type { Snippet } from 'svelte'
  import type { ChatCommand } from '../types'

  type Props = {
    open: boolean
    commands: ChatCommand[]
    onPick: (cmd: ChatCommand) => void
    trigger: Snippet<[Record<string, unknown>]>
  }

  let { open = $bindable(false), commands, onPick, trigger }: Props = $props()

  let query = $state('')

  function handleSelect(cmd: ChatCommand) {
    onPick(cmd)
    query = ''
    open = false
  }

  function handleOpenChange(next: boolean) {
    if (!next) query = ''
  }
</script>

<Popover.Root bind:open onOpenChange={handleOpenChange}>
  <Popover.Trigger>
    {#snippet child({ props })}
      {@render trigger(props)}
    {/snippet}
  </Popover.Trigger>

  <Popover.Content side="top" align="start" class="w-80 p-0">
    <Command.Root>
      <Command.Input bind:value={query} placeholder="Search commands..." />
      <Command.List>
        <Command.Empty>
          {#if query.trim().length > 0}
            Unknown command: <span class="font-mono">/{query.trim()}</span>
          {:else}
            No commands available
          {/if}
        </Command.Empty>
        {#if commands.length > 0}
          <Command.Group>
            {#each commands as cmd (cmd.name)}
              <Command.Item value={cmd.name} onSelect={() => handleSelect(cmd)}>
                <span class="font-mono text-xs">/{cmd.name}</span>
                <span class="ml-2 truncate text-xs text-muted-foreground">{cmd.description}</span>
              </Command.Item>
            {/each}
          </Command.Group>
        {/if}
      </Command.List>
    </Command.Root>
  </Popover.Content>
</Popover.Root>
