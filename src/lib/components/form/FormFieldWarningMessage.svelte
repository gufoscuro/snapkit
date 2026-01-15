<script lang="ts">
  import type { FormFieldMessagePosition } from '$components/form/form'

  export let id: string
  export let message: string | undefined = undefined
  export let position: FormFieldMessagePosition = 'bottom'
</script>

<div class="relative">
  <div
    id="warning-{id}"
    class:absolute={position === 'floating-top' || position === 'floating-bottom'}
    class:bottom-1={position === 'floating-top'}
    class:top-1={position === 'floating-bottom'}
    class:mt-1={position === 'bottom'}
    class:mb-1={position === 'top'}
    class:z-10={position === 'floating-top' || position === 'floating-bottom'}
    class="bg-warning text-warning-foreground left-0 inline-block rounded-sm px-2 py-0.5 text-xs {position ===
    'floating-bottom'
      ? 'pointer-events-none translate-y-2 opacity-0 transition-all duration-200 group-hover/message:translate-y-0 group-hover/message:opacity-100'
      : ''}">
    {message}
  </div>
</div>
