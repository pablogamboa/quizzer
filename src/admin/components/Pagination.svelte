<script>
    let {
        page = 1,
        totalPages = 1,
        total = 0,
        pageSize = 25,
        onPageChange = () => {},
    } = $props()

    const start = $derived((page - 1) * pageSize + 1)
    const end = $derived(Math.min(page * pageSize, total))
</script>

<div class="admin-pagination">
    <div class="admin-pagination-info">
        Showing {start} to {end} of {total} results
    </div>
    <div class="admin-pagination-buttons">
        <button
            class="admin-btn admin-btn-outline admin-btn-sm"
            disabled={page <= 1}
            onclick={() => onPageChange(page - 1)}
        >
            Previous
        </button>
        <span style="padding: 0 0.75rem; font-size: 0.875rem;">
            Page {page} of {totalPages}
        </span>
        <button
            class="admin-btn admin-btn-outline admin-btn-sm"
            disabled={page >= totalPages}
            onclick={() => onPageChange(page + 1)}
        >
            Next
        </button>
    </div>
</div>
