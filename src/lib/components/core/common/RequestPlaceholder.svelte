<script lang="ts">
  import Spinner from '$components/ui/spinner/spinner.svelte'
  import type { SafeApiResponse } from '$utils/request'
  import type { Snippet } from 'svelte'

  let loading = $state(false)
  let exception = $state<string | null>(null)

  const {
    promise,
    content,
    loadingContent,
    errorContent,
  }: {
    promise: Promise<SafeApiResponse<unknown>> | null
    content?: Snippet
    loadingContent?: Snippet
    errorContent?: Snippet<[exception: string]>
  } = $props()

  $effect(() => {
    if (!promise) return

    loading = true
    exception = null

    promise.then(({ error }) => {
      loading = false
      if (error) {
        exception = error.message || 'An error occurred'
      }
    })
  })
</script>

{#if loading && loadingContent}
  {@render loadingContent()}
{:else if loading}
  <div class="flex h-full w-full items-center justify-center">
    <p class="text-sm text-muted-foreground">
      <Spinner />
    </p>
  </div>
{:else if exception && errorContent}
  {@render errorContent(exception)}
{:else if exception}
  <div class="flex h-full w-full items-center justify-center">
    <div>
      <h2 class="text-center text-lg font-semibold">Ouch!</h2>
      <p class="max-w-2xl text-sm">{exception}</p>
    </div>
  </div>
{:else}
  {@render content?.()}
{/if}
