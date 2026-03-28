<script lang="ts">
  let { text, lines = 3 }: { text: string; lines?: number } = $props()
</script>

<div
  class="max-w-lg overflow-hidden wrap-break-word"
  style:display="-webkit-box"
  style:-webkit-box-orient="vertical"
  style:-webkit-line-clamp={lines}
  title={text}>
  {text}
</div>
