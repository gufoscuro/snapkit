<script lang="ts">
  import { chatUi } from '$lib/chat/store'
  import ChatDrawer from './ChatDrawer.svelte'
  import ChatFloatingButton from './ChatFloatingButton.svelte'
</script>

<!-- While a page docks the chat into its own layout, the floating surface stands
     down: both render the same conversation, so showing them together would
     duplicate it on screen. -->
{#if !chatUi.dockOwner}
  <ChatFloatingButton />
  <ChatDrawer />
{/if}
