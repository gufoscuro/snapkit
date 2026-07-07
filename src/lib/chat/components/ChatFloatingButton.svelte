<script lang="ts">
  import Button from '$components/ui/button/button.svelte'
  import { chatUi } from '$lib/chat/store'
  import * as m from '$lib/paraglide/messages'
  import IconMessageChatbot from '@tabler/icons-svelte/icons/message-chatbot'
</script>

<Button
  variant="ghost"
  size="icon"
  title={m.open_moddo_assistant()}
  class="fixed top-3 right-4 z-40 shadow-lg"
  aria-label={m.open_moddo_assistant()}
  onclick={() => chatUi.toggle()}>
  <IconMessageChatbot />
</Button>
