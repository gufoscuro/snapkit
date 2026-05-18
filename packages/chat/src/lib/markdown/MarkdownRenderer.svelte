<script lang="ts">
  /* eslint-disable svelte/no-at-html-tags */
  import DOMPurify from 'dompurify'
  import { marked } from 'marked'

  interface Props {
    markdown: string
    class?: string
  }

  const { markdown, class: className = '' }: Props = $props()
  const html = $derived(DOMPurify.sanitize(marked.parse(markdown) as string))
</script>

<div class="prose prose-sm max-w-none dark:prose-invert {className}">
  {@html html}
</div>

<style>
  div :global(li > p) {
    margin: 0;
  }
</style>
