/** Use this on a vertically scrollable container to ensure that it automatically scrolls to the bottom of the content.
 *
 * ## Usage
 * ```svelte
 * <script lang="ts">
 *      import { UseAutoScroll } from '../hooks/use-auto-scroll.svelte';
 *
 *      let { children } = $props();
 *
 *      const autoScroll = new UseAutoScroll();
 * </script>
 *
 * <div>
 *      <div bind:this={autoScroll.ref}>
 *          {@render children?.()}
 *      </div>
 *      {#if !autoScroll.isAtBottom}
 *          <button onclick={() => autoScroll.scrollToBottom()}>
 *              Scroll To Bottom
 *          </button>
 *      {/if}
 * </div>
 * ```
 */
export class UseAutoScroll {
	#ref = $state<HTMLElement>();
	// Live scroll metrics mirrored into reactive state so `isAtBottom` re-evaluates
	// on scroll AND when the content height changes (not just on scroll events).
	#scrollTop: number = $state(0);
	#scrollHeight: number = $state(0);
	#clientHeight: number = $state(0);
	#userHasScrolled = $state(false);
	private lastScrollHeight = 0;

	/** Reads the container's scroll metrics off the DOM into reactive state. */
	#measure() {
		if (!this.#ref) return;
		this.#scrollTop = this.#ref.scrollTop;
		this.#scrollHeight = this.#ref.scrollHeight;
		this.#clientHeight = this.#ref.clientHeight;
	}

	// This sets everything up once #ref is bound
	set ref(ref: HTMLElement | undefined) {
		this.#ref = ref;

		if (!this.#ref) return;

		this.lastScrollHeight = this.#ref.scrollHeight;

		// start from bottom or the previously-restored position
		this.#ref.scrollTo(0, this.#scrollTop ? this.#scrollTop : this.#ref.scrollHeight);
		this.#measure();

		this.#ref.addEventListener('scroll', () => {
			if (!this.#ref) return;

			this.#measure();
			this.disableAutoScroll();
		});

		window.addEventListener('resize', () => {
			this.#measure();
			this.scrollToBottom(true);
		});

		// should detect when something changed that effected the scroll height
		const observer = new MutationObserver(() => {
			if (!this.#ref) return;

			if (this.#ref.scrollHeight !== this.lastScrollHeight) {
				this.scrollToBottom(true);
			}

			this.lastScrollHeight = this.#ref.scrollHeight;
			this.#measure();
		});

		observer.observe(this.#ref, { childList: true, subtree: true });
	}

	get ref() {
		return this.#ref;
	}

	get scrollY() {
		return this.#scrollTop;
	}

	/** Checks if the container is scrolled to the bottom.
	 *
	 * Uses a 1px tolerance: `scrollTop`, `scrollHeight` and `clientHeight` can all be
	 * fractional on hi-DPI / zoomed displays, so exact equality never holds and the
	 * "scroll to bottom" affordance would get stuck visible even at the very bottom.
	 */
	get isAtBottom() {
		if (!this.#ref) return true;

		return this.#scrollHeight - this.#clientHeight - this.#scrollTop <= 1;
	}

	/** Disables auto scrolling until the container is scrolled back to the bottom */
	disableAutoScroll() {
		this.#userHasScrolled = !this.isAtBottom;
	}

	/** Scrolls the container to the bottom */
	scrollToBottom(auto = false) {
		if (!this.#ref) return;

		// don't auto scroll if user has scrolled
		if (auto && this.#userHasScrolled) return;

		this.#ref.scrollTo(0, this.#ref.scrollHeight);
	}
}
