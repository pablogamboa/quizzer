<script>
    import Sidebar from './Sidebar.svelte'
    import Toast from './Toast.svelte'

    let { children, currentPage = 'dashboard' } = $props()
</script>

<div class="admin-layout">
    <Sidebar {currentPage} />
    <main class="admin-main">
        {@render children()}
    </main>
</div>

<Toast />
