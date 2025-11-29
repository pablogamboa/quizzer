<script>
    let { show = false, title = '', onclose = () => {}, children } = $props()

    function handleOverlayClick(e) {
        if (e.target === e.currentTarget) {
            onclose()
        }
    }

    function handleKeydown(e) {
        if (e.key === 'Escape') {
            onclose()
        }
    }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if show}
    <div
        class="admin-modal-overlay"
        onclick={handleOverlayClick}
        role="dialog"
        aria-modal="true"
    >
        <div class="admin-modal">
            <div class="admin-modal-header">
                <h2 class="admin-modal-title">{title}</h2>
                <button class="admin-modal-close" onclick={onclose}>×</button>
            </div>
            <div class="admin-modal-body">
                {@render children()}
            </div>
        </div>
    </div>
{/if}
