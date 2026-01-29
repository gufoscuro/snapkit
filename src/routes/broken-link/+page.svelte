<script lang="ts">
  import { page } from '$app/state'
</script>

<div class="flex h-screen w-full items-center justify-center">
  <div class="text-center">
    <h1 class="text-4xl font-bold">Missing link</h1>
    <p class="mt-2 text-muted-foreground">{page.url.searchParams.get('link-id')}</p>
  </div>
</div>
