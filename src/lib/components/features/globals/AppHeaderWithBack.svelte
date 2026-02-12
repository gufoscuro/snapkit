<script lang="ts">
  import { Button } from '$components/ui/button'
  import type { SnippetProps } from '$utils/runtime'

  const { tenantInterfaceDetails }: SnippetProps = $props()
</script>

<header
  class="sticky top-0 z-10 flex h-14 w-full shrink-0 items-center justify-between gap-3 border-b bg-background px-4">
  <Button variant="ghost" href="javascript:history.back()" class="px-2">← Back</Button>
</header>

<style>
  header {
    view-transition-name: header;
  }
</style>
