<script>
  /** @type {{ currentPage: string, onNavigate: (page: string) => void }} */
  let { currentPage, onNavigate } = $props();

  const navItems = [
    { id: 'players',     icon: '♟',  label: 'Players' },
    { id: 'tournaments', icon: '🏆',  label: 'Tournaments' },
    { id: 'rankings',    icon: '🥇',  label: 'Rankings' },
  ];
</script>

<aside class="sidebar">
  <div class="sidebar-logo">
    <span class="logo-icon">♔</span>
    <div>
      <div class="logo-text">ChessTourney</div>
      <div class="logo-subtitle">Tournament Manager</div>
    </div>
  </div>

  <nav class="sidebar-nav" aria-label="Main navigation">
    <span class="nav-section-label">Menu</span>
    {#each navItems as item (item.id)}
      <button
        id="nav-{item.id}"
        class="nav-link"
        class:active={currentPage === item.id}
        onclick={() => onNavigate(item.id)}
        aria-current={currentPage === item.id ? 'page' : undefined}
      >
        <span class="nav-icon">{item.icon}</span>
        <span>{item.label}</span>
      </button>
    {/each}
  </nav>

  <div class="sidebar-footer">
    <div>♟ Chess Tournament</div>
    <div>Management System</div>
  </div>
</aside>
