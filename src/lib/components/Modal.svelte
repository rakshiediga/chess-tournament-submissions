<script>
  /**
   * @typedef {Object} Props
   * @property {boolean} open
   * @property {string} title
   * @property {import('svelte').Snippet} [children]
   * @property {import('svelte').Snippet} [footer]
   * @property {() => void} onClose
   */

  /** @type {Props} */
  let { open, title, children, footer, onClose } = $props();

  function handleKeydown(e) {
    if (e.key === 'Escape') onClose();
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <div class="modal-overlay" onclick={onClose} role="dialog" aria-modal="true" aria-label={title}>
    <div class="modal" onclick={(e) => e.stopPropagation()}>
      <div class="modal-header">
        <h2 class="modal-title">{title}</h2>
        <button
          id="modal-close-btn"
          class="btn btn-ghost btn-icon"
          onclick={onClose}
          aria-label="Close modal"
        >✕</button>
      </div>

      <div class="modal-body">
        {#if children}
          {@render children()}
        {/if}
      </div>

      {#if footer}
        <div class="modal-footer">
          {@render footer()}
        </div>
      {/if}
    </div>
  </div>
{/if}
