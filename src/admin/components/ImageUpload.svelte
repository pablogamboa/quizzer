<script>
    import { uploadImage } from '../lib/api.js'
    import { showSuccess, showError } from '../lib/toast.js'

    let { currentUrl = '', onUploaded = () => {} } = $props()

    let mode = $state('url') // 'url' or 'upload'
    let urlInput = $state(currentUrl)
    let uploading = $state(false)
    let uploadProgress = $state(0)
    let dragOver = $state(false)
    let fileInput = $state(null)

    // Sync urlInput when currentUrl changes
    $effect(() => {
        urlInput = currentUrl
    })

    function handleUrlChange() {
        onUploaded(urlInput)
    }

    async function handleFile(file) {
        if (!file) return

        // Validate file type
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/gif',
        ]
        if (!allowedTypes.includes(file.type)) {
            showError('Invalid file type. Allowed: JPG, PNG, WebP, GIF')
            return
        }

        // Validate file size (5MB)
        const maxSize = 5 * 1024 * 1024
        if (file.size > maxSize) {
            showError('File too large. Maximum size: 5MB')
            return
        }

        try {
            uploading = true
            uploadProgress = 0

            // Simulate progress (actual XHR would need more setup)
            const progressInterval = setInterval(() => {
                uploadProgress = Math.min(uploadProgress + 10, 90)
            }, 100)

            const result = await uploadImage(file)

            clearInterval(progressInterval)
            uploadProgress = 100

            urlInput = result.url
            onUploaded(result.url)
            showSuccess('Image uploaded successfully')

            // Switch to URL mode to show the result
            mode = 'url'
        } catch (err) {
            showError('Failed to upload image: ' + err.message)
        } finally {
            uploading = false
            uploadProgress = 0
        }
    }

    function handleFileSelect(e) {
        const file = e.target.files?.[0]
        if (file) {
            handleFile(file)
        }
    }

    function handleDrop(e) {
        e.preventDefault()
        dragOver = false
        const file = e.dataTransfer?.files?.[0]
        if (file) {
            handleFile(file)
        }
    }

    function handleDragOver(e) {
        e.preventDefault()
        dragOver = true
    }

    function handleDragLeave() {
        dragOver = false
    }

    function triggerFileSelect() {
        fileInput?.click()
    }
</script>

<div class="admin-tabs">
    <button
        type="button"
        class="admin-tab"
        class:active={mode === 'url'}
        onclick={() => (mode = 'url')}
    >
        URL
    </button>
    <button
        type="button"
        class="admin-tab"
        class:active={mode === 'upload'}
        onclick={() => (mode = 'upload')}
    >
        Upload
    </button>
</div>

{#if mode === 'url'}
    <div class="admin-form-group" style="margin-bottom: 0;">
        <label class="admin-label" for="imageUrl">Image URL</label>
        <input
            id="imageUrl"
            type="url"
            class="admin-input"
            bind:value={urlInput}
            oninput={handleUrlChange}
            placeholder="https://example.com/image.jpg"
        />
    </div>
{:else}
    <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onchange={handleFileSelect}
        style="display: none;"
        bind:this={fileInput}
    />

    <div
        class="admin-image-upload"
        class:dragging={dragOver}
        ondrop={handleDrop}
        ondragover={handleDragOver}
        ondragleave={handleDragLeave}
        onclick={triggerFileSelect}
        role="button"
        tabindex="0"
        onkeydown={(e) => e.key === 'Enter' && triggerFileSelect()}
    >
        {#if uploading}
            <div
                style="display: flex; flex-direction: column; align-items: center; gap: 0.75rem;"
            >
                <div class="admin-spinner"></div>
                <span>Uploading... {uploadProgress}%</span>
                <div
                    style="width: 200px; height: 4px; background: var(--admin-border); border-radius: 2px;"
                >
                    <div
                        style="height: 100%; background: var(--admin-primary); border-radius: 2px; transition: width 0.2s;"
                        style:width="{uploadProgress}%"
                    ></div>
                </div>
            </div>
        {:else}
            <div
                style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;"
            >
                <span style="font-size: 2rem;">📤</span>
                <span>Drop an image here or click to select</span>
                <span
                    style="font-size: 0.75rem; color: var(--admin-text-muted);"
                >
                    JPG, PNG, WebP, GIF - Max 5MB
                </span>
            </div>
        {/if}
    </div>
{/if}

{#if urlInput}
    <div style="margin-top: 1rem;">
        <label class="admin-label">Preview</label>
        <img
            src={urlInput}
            alt="Preview"
            class="admin-image-preview"
            style="max-width: 100%; max-height: 300px; border-radius: var(--admin-radius); border: 1px solid var(--admin-border);"
            onerror={(e) => {
                e.target.style.display = 'none'
            }}
            onload={(e) => {
                e.target.style.display = 'block'
            }}
        />
    </div>
{/if}
