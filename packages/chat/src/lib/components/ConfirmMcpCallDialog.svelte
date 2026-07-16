<!--
  @component ConfirmMcpCallDialog
  @description Singleton dialog asking the user to authorize an AI-initiated
  MCP command call. Surfaces the server and command name prominently so the
  user can spot potentially destructive operations before approving.
-->
<script lang="ts" module>
  class ConfirmMcpCallDialogState {
    open = $state(false)
    options = $state<ConfirmMcpCallOptions | null>(null)

    constructor() {
      this.confirm = this.confirm.bind(this)
      this.cancel = this.cancel.bind(this)
    }

    request(options: ConfirmMcpCallOptions) {
      this.options = options
      this.open = true
    }

    confirm() {
      const opts = this.options
      this.open = false
      this.options = null
      opts?.onConfirm()
    }

    cancel() {
      const opts = this.options
      this.open = false
      this.options = null
      opts?.onCancel?.()
    }
  }

  const dialogState = new ConfirmMcpCallDialogState()

  export type ConfirmMcpCallOptions = {
    /** MCP server display name. */
    server: string
    /** Command name being invoked. */
    command: string
    /** Called when the user grants authorization. */
    onConfirm: () => void
    /** Called when the user declines or dismisses the dialog. */
    onCancel?: () => void
  }

  export type ConfirmMcpMessages = {
    title: string
    description: string
    serverLabel: string
    commandLabel: string
    cancel: string
    authorize: string
  }

  export const defaultConfirmMcpMessages: ConfirmMcpMessages = {
    title: 'Allow AI to run command',
    description:
      "The assistant wants to execute this command on the MCP server. Review what the command does before allowing — you'll be asked again before any further call.",
    serverLabel: 'Server',
    commandLabel: 'Command',
    cancel: 'Cancel',
    authorize: 'Allow',
  }

  export function confirmMcpCall(options: ConfirmMcpCallOptions) {
    dialogState.request(options)
  }
</script>

<script lang="ts">
  import * as AlertDialog from '../ui/alert-dialog'

  let { messages = {} }: { messages?: Partial<ConfirmMcpMessages> } = $props()

  const m = $derived({ ...defaultConfirmMcpMessages, ...messages })
</script>

<AlertDialog.Root bind:open={dialogState.open}>
  <AlertDialog.Content class="z-60" overlayClass="z-60">
    <AlertDialog.Header>
      <AlertDialog.Title>{m.title}</AlertDialog.Title>
      <AlertDialog.Description>{m.description}</AlertDialog.Description>
    </AlertDialog.Header>

    {#if dialogState.options}
      <div
        class="my-2 grid grid-cols-[auto_1fr] items-baseline gap-x-3 gap-y-2 rounded-md border bg-muted/30 p-3 text-sm">
        <span class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {m.serverLabel}
        </span>
        <code class="font-mono">{dialogState.options.server}</code>
        <span class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {m.commandLabel}
        </span>
        <code class="font-mono">{dialogState.options.command}</code>
      </div>
    {/if}

    <AlertDialog.Footer>
      <AlertDialog.Cancel onclick={dialogState.cancel}>
        {m.cancel}
      </AlertDialog.Cancel>
      <AlertDialog.Action onclick={dialogState.confirm}>
        {m.authorize}
      </AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
