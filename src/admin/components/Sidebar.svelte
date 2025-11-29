<script>
    let { currentPage = 'dashboard' } = $props()

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'questions', label: 'Questions', icon: '❓' },
        { id: 'themes', label: 'Themes', icon: '🎨' },
    ]
</script>

<aside class="admin-sidebar">
    <div class="admin-sidebar-header">
        <h1 class="admin-sidebar-title">
            <span>🎯</span>
            Quizzer Admin
        </h1>
    </div>

    <nav>
        <ul class="admin-nav">
            {#each navItems as item}
                <li class="admin-nav-item">
                    <a
                        href="#/{item.id}"
                        class="admin-nav-link"
                        class:active={currentPage === item.id}
                    >
                        <span class="admin-nav-icon">{item.icon}</span>
                        {item.label}
                    </a>
                </li>
            {/each}
        </ul>
    </nav>

    <div
        style="margin-top: auto; padding: 1.5rem; border-top: 1px solid var(--admin-sidebar-hover);"
    >
        <a
            href="/"
            class="admin-nav-link"
            style="color: var(--admin-sidebar-text);"
        >
            <span class="admin-nav-icon">←</span>
            Back to Quiz
        </a>
    </div>
</aside>
