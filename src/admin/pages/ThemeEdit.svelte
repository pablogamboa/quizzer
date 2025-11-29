<script>
    import { onMount } from 'svelte'
    import { createTheme, updateTheme, getCategories } from '../lib/api.js'
    import { showSuccess, showError } from '../lib/toast.js'

    let { theme = null, onSave = () => {}, onCancel = () => {} } = $props()

    const isEditing = $derived(theme !== null)

    let categories = $state([])
    let loading = $state(false)
    let saving = $state(false)

    // Form state
    let form = $state({
        themeKey: theme?.themeKey || '',
        themeName: theme?.themeName || '',
        category: theme?.category || '',
        newCategory: '',
        description: theme?.description || '',
        icon: theme?.icon || '',
        isActive: theme?.isActive ?? true,
    })

    let useNewCategory = $state(false)
    let autoGenerateKey = $state(!isEditing)

    // Common emoji icons for themes
    const commonIcons = [
        '🌍',
        '🗺️',
        '🏛️',
        '🎬',
        '🎵',
        '📚',
        '🔬',
        '⚽',
        '🎮',
        '🍕',
        '🐾',
        '✈️',
        '🏆',
        '💡',
        '🎨',
    ]

    async function loadCategories() {
        try {
            loading = true
            categories = await getCategories()
        } catch (err) {
            showError('Failed to load categories: ' + err.message)
        } finally {
            loading = false
        }
    }

    function generateKey(name) {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim()
    }

    function handleNameChange() {
        if (autoGenerateKey && !isEditing) {
            form.themeKey = generateKey(form.themeName)
        }
    }

    async function handleSubmit(e) {
        e.preventDefault()

        // Validation
        if (!form.themeName.trim()) {
            showError('Theme name is required')
            return
        }

        if (!form.themeKey.trim()) {
            showError('Theme key is required')
            return
        }

        const category = useNewCategory
            ? form.newCategory.trim()
            : form.category
        if (!category) {
            showError('Category is required')
            return
        }

        const data = {
            themeKey: form.themeKey.trim(),
            themeName: form.themeName.trim(),
            category,
            description: form.description.trim() || undefined,
            icon: form.icon.trim() || undefined,
            isActive: form.isActive,
        }

        try {
            saving = true
            if (isEditing) {
                await updateTheme(theme.id, data)
                showSuccess('Theme updated successfully')
            } else {
                await createTheme(data)
                showSuccess('Theme created successfully')
            }
            onSave()
        } catch (err) {
            showError('Failed to save theme: ' + err.message)
        } finally {
            saving = false
        }
    }

    onMount(() => {
        loadCategories()
    })
</script>

<div class="admin-page-header">
    <h1 class="admin-page-title">{isEditing ? 'Edit Theme' : 'Add Theme'}</h1>
    <button class="admin-btn admin-btn-outline" onclick={onCancel}>
        Cancel
    </button>
</div>

{#if loading}
    <div class="admin-loading">
        <div class="admin-spinner"></div>
    </div>
{:else}
    <form onsubmit={handleSubmit}>
        <div class="admin-card">
            <div class="admin-card-header">
                <h2 class="admin-card-title">Theme Details</h2>
            </div>

            <div
                style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;"
            >
                <div class="admin-form-group">
                    <label class="admin-label" for="themeName">Theme Name</label
                    >
                    <input
                        id="themeName"
                        type="text"
                        class="admin-input"
                        bind:value={form.themeName}
                        oninput={handleNameChange}
                        placeholder="e.g., World Flags"
                    />
                </div>

                <div class="admin-form-group">
                    <label class="admin-label" for="themeKey">
                        Theme Key
                        {#if !isEditing}
                            <label
                                style="font-weight: normal; margin-left: 0.5rem;"
                            >
                                <input
                                    type="checkbox"
                                    bind:checked={autoGenerateKey}
                                    style="margin-right: 0.25rem;"
                                />
                                Auto-generate
                            </label>
                        {/if}
                    </label>
                    <input
                        id="themeKey"
                        type="text"
                        class="admin-input"
                        bind:value={form.themeKey}
                        placeholder="e.g., world-flags"
                        disabled={autoGenerateKey && !isEditing}
                        style={autoGenerateKey && !isEditing
                            ? 'background: var(--admin-bg);'
                            : ''}
                    />
                    <p
                        style="font-size: 0.75rem; color: var(--admin-text-muted); margin-top: 0.25rem;"
                    >
                        Unique identifier used in URLs and API. Use lowercase
                        letters, numbers, and hyphens only.
                    </p>
                </div>
            </div>

            <div class="admin-form-group">
                <label class="admin-label" for="category">Category</label>
                {#if useNewCategory}
                    <div class="admin-input-group">
                        <input
                            id="category"
                            type="text"
                            class="admin-input"
                            bind:value={form.newCategory}
                            placeholder="New category name..."
                        />
                        <button
                            type="button"
                            class="admin-btn admin-btn-outline"
                            onclick={() => {
                                useNewCategory = false
                                form.newCategory = ''
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                {:else}
                    <div class="admin-input-group">
                        <select
                            id="category"
                            class="admin-select"
                            bind:value={form.category}
                        >
                            <option value="">Select category...</option>
                            {#each categories as category}
                                <option value={category}>{category}</option>
                            {/each}
                        </select>
                        <button
                            type="button"
                            class="admin-btn admin-btn-outline"
                            onclick={() => (useNewCategory = true)}
                        >
                            + New
                        </button>
                    </div>
                {/if}
            </div>

            <div class="admin-form-group">
                <label class="admin-label" for="description"
                    >Description (Optional)</label
                >
                <textarea
                    id="description"
                    class="admin-textarea"
                    bind:value={form.description}
                    placeholder="Brief description of what this theme covers..."
                    rows="2"
                ></textarea>
            </div>

            <div class="admin-form-group">
                <label class="admin-label" for="icon">Icon (Optional)</label>
                <div class="admin-input-group">
                    <input
                        id="icon"
                        type="text"
                        class="admin-input"
                        bind:value={form.icon}
                        placeholder="e.g., 🚩"
                        style="width: 80px;"
                    />
                    <span
                        style="color: var(--admin-text-muted); font-size: 0.875rem;"
                    >
                        Enter an emoji or icon character
                    </span>
                </div>
                <div
                    style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.75rem;"
                >
                    {#each commonIcons as icon}
                        <button
                            type="button"
                            class="admin-btn admin-btn-outline admin-btn-sm"
                            style="font-size: 1.25rem; padding: 0.25rem 0.5rem; min-width: 40px;"
                            onclick={() => (form.icon = icon)}
                        >
                            {icon}
                        </button>
                    {/each}
                </div>
            </div>

            <div class="admin-form-group">
                <label class="admin-checkbox-label">
                    <input type="checkbox" bind:checked={form.isActive} />
                    Active (theme will be visible to users)
                </label>
            </div>
        </div>

        <div
            style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem;"
        >
            <button
                type="button"
                class="admin-btn admin-btn-outline"
                onclick={onCancel}
            >
                Cancel
            </button>
            <button
                type="submit"
                class="admin-btn admin-btn-primary"
                disabled={saving}
            >
                {saving
                    ? 'Saving...'
                    : isEditing
                      ? 'Save Changes'
                      : 'Create Theme'}
            </button>
        </div>
    </form>
{/if}
