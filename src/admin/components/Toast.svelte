<script>
    import { toasts, removeToast } from '../lib/toast.js'
</script>

{#if $toasts.length > 0}
    <div class="admin-toast-container">
        {#each $toasts as toast (toast.id)}
            <div class="admin-toast admin-toast-{toast.type}">
                <span>{toast.message}</span>
                <button
                    class="admin-modal-close"
                    onclick={() => removeToast(toast.id)}
                    style="margin-left: 0.5rem;"
                >
                    ×
                </button>
            </div>
        {/each}
    </div>
{/if}
