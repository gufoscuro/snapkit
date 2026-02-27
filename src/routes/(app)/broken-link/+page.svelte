<script lang="ts">
  import { page } from '$app/state'
  import * as m from '$lib/paraglide/messages'
  import { Bug } from 'lucide-svelte'
</script>

<div
  class="fixed inset-0 z-20 flex h-full w-full cursor-default items-center justify-center bg-background/70 backdrop-blur-sm">
  <div>
    <div class="flex justify-center">
      <div>
        <div class="mt-1 flex items-center gap-1">
          <Bug class="size-5 rotate-12 text-destructive" />
          <Bug class="size-5 -rotate-45 text-destructive" />
        </div>
      </div>
    </div>
    <h2 class="mt-2 flex justify-center text-center text-lg font-semibold">{m.broken_link()}</h2>
    <p class="max-w-xl pb-16 text-center text-sm text-muted-foreground">
      {m.broken_link_message({ linkId: page.url.searchParams.get('link-id') || '' })}
    </p>
  </div>
</div>
