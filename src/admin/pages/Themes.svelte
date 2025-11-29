<script>
    import { onMount } from 'svelte'
    import { getThemes, deleteTheme, updateTheme } from '../lib/api.js'
    import { showSuccess, showError } from '../lib/toast.js'
    import Modal from '../components/Modal.svelte'

    let { onEdit = () => {} } = $props()

    let themes = $state([])
    let loading = $state(true)
    let deleteModalOpen = $state(false)
    let themeToDelete = $state(null)

    async function loadThemes() {
        try {
            loading = true
            themes = await getThemes()
        } catch (err) {
            showError('Failed to load themes: ' + err.message)
        } finally {
            loading = false
        }
    }

    async function handleToggleActive(theme) {
        try {
            await updateTheme(theme.id, { isActive: !theme.isActive })
            showSuccess(`Theme ${theme.isActive ? 'deactivated' : 'activated'}`)
            loadThemes()
        } catch (err) {
            showError('Failed to update theme: ' + err.message)
        }
    }

    function confirmDelete(theme) {
        themeToDelete = theme
        deleteModalOpen = true
    }

    async function handleDelete() {
        if (!themeToDelete) return

        try {
            await deleteTheme(themeToDelete.id)
            showSuccess('Theme deleted successfully')
            deleteModalOpen = false
            themeToDelete = null
            loadThemes()
        } catch (err) {
            showError('Failed to delete theme: ' + err.message)
        }
    }

    // Group themes by category
    const themesByCategory = $derived(() => {
        const grouped = {}
        for (const theme of themes) {
            if (!grouped[theme.category]) {
                grouped[theme.category] = []
            }
            grouped[theme.category].push(theme)
        }
        return grouped
    })

    onMount(() => {
        loadThemes()
    })
</script>

<div class="admin-page-header">
    <h1 class="admin-page-title">Themes</h1>
    <button class="admin-btn admin-btn-primary" onclick={() => onEdit(null)}>
        + Add Theme
    </button>
</div>

{#if loading}
    <div class="admin-card">
        <div class="admin-loading">
            <div class="admin-spinner"></div>
        </div>
    </div>
{:else if themes.length === 0}
    <div class="admin-card">
        <div class="admin-empty-state">
            <div class="admin-empty-icon">🎨</div>
            <p>No themes found</p>
            <button
                class="admin-btn admin-btn-primary"
                style="margin-top: 1rem;"
                onclick={() => onEdit(null)}
            >
                Add Your First Theme
            </button>
        </div>
    </div>
{:else}
    {#each Object.entries(themesByCategory()) as [category, categoryThemes]}
        <div class="admin-card">
            <div class="admin-card-header">
                <h2 class="admin-card-title">{category}</h2>
                <span class="admin-badge admin-badge-secondary"
                    >{categoryThemes.length} themes</span
                >
            </div>
            <div class="admin-table-container">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th style="width: 50px;">Icon</th>
                            <th>Name</th>
                            <th>Key</th>
                            <th>Description</th>
                            <th style="width: 100px;">Questions</th>
                            <th style="width: 80px;">Status</th>
                            <th style="width: 150px;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each categoryThemes as theme}
                            <tr>
                                <td style="font-size: 1.25rem;"
                                    >{theme.icon || '-'}</td
                                >
                                <td>{theme.themeName}</td>
                                <td
                                    ><code
                                        style="font-size: 0.75rem; background: var(--admin-bg); padding: 0.25rem 0.5rem; border-radius: 4px;"
                                        >{theme.themeKey}</code
                                    ></td
                                >
                                <td
                                    style="color: var(--admin-text-muted); font-size: 0.875rem;"
                                    >{theme.description || '-'}</td
                                >
                                <td>{theme.questionCount}</td>
                                <td>
                                    {#if theme.isActive}
                                        <span
                                            class="admin-badge admin-badge-success"
                                            >Active</span
                                        >
                                    {:else}
                                        <span
                                            class="admin-badge admin-badge-secondary"
                                            >Inactive</span
                                        >
                                    {/if}
                                </td>
                                <td class="admin-table-actions">
                                    <button
                                        class="admin-btn admin-btn-outline admin-btn-sm"
                                        onclick={() =>
                                            handleToggleActive(theme)}
                                    >
                                        {theme.isActive
                                            ? 'Deactivate'
                                            : 'Activate'}
                                    </button>
                                    <button
                                        class="admin-btn admin-btn-outline admin-btn-sm"
                                        onclick={() => onEdit(theme)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        class="admin-btn admin-btn-danger admin-btn-sm"
                                        onclick={() => confirmDelete(theme)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>
    {/each}
{/if}

<Modal
    show={deleteModalOpen}
    title="Delete Theme"
    onclose={() => (deleteModalOpen = false)}
>
    <p>Are you sure you want to delete this theme?</p>
    {#if themeToDelete}
        <p style="margin-top: 0.5rem;">
            <strong>{themeToDelete.icon} {themeToDelete.themeName}</strong>
        </p>
        {#if themeToDelete.questionCount > 0}
            <p
                style="margin-top: 0.5rem; color: var(--admin-warning); font-size: 0.875rem;"
            >
                Warning: This theme has {themeToDelete.questionCount} questions associated
                with it. The questions will not be deleted but will no longer be
                tagged with this theme.
            </p>
        {/if}
    {/if}
    <div
        class="admin-modal-footer"
        style="margin-top: 1.5rem; padding: 0; border: none;"
    >
        <button
            class="admin-btn admin-btn-outline"
            onclick={() => (deleteModalOpen = false)}
        >
            Cancel
        </button>
        <button class="admin-btn admin-btn-danger" onclick={handleDelete}>
            Delete
        </button>
    </div>
</Modal>
