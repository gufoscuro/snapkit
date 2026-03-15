<script lang="ts">
  import { getFormContextOptional } from '$components/core/form/form-context'
  import * as Alert from '$components/ui/alert'
  import * as m from '$lib/paraglide/messages'
  import AlertCircleIcon from '@lucide/svelte/icons/alert-circle'
  import { FormFieldClass } from './form'

  interface Props {
    class?: string
    columnsLayout?: boolean
  }

  const { class: className = '', columnsLayout = false }: Props = $props()

  const form = getFormContextOptional()
  const errorMessage = $derived(form?.errorMessage || null)
</script>

{#if errorMessage}
  <Alert.Root
    variant="destructive"
    class="{FormFieldClass.MaxWidth} {columnsLayout ? 'lg:max-w-none' : ''} {className} max-w-md">
    <AlertCircleIcon />
    <Alert.Title>{m.form_error_title()}</Alert.Title>
    <Alert.Description class="[&_p]:leading-tight">
      <p>{errorMessage}</p>
    </Alert.Description>
  </Alert.Root>
{/if}
