<script lang="ts">
  import { Button } from '$components/ui/button'
  import type { SnippetProps } from '$utils/runtime'

  const { tenantInterfaceDetails }: SnippetProps = $props()
</script>

<div class="sticky top-0 flex h-14 w-full items-center justify-between gap-3 border-b bg-background px-4">
  <Button variant="ghost" href="javascript:history.back()" class="px-2">← Back</Button>
</div>
