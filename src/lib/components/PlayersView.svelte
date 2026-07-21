<script>
  import { players as playersStore } from '$lib/stores/players.js';
  import Modal from '$lib/components/Modal.svelte';

  let playerList = $state([]);
  let search = $state('');
  let showAddModal = $state(false);
  let showEditModal = $state(false);
  let showDeleteModal = $state(false);
  let selectedPlayer = $state(null);

  // Form state
  let form = $state({ name: '', rating: 1200, country: '', club: '' });

  // Subscribe
  const unsubscribe = playersStore.subscribe(v => { playerList = v; });

  $effect(() => () => unsubscribe());

  let filtered = $derived(
    search.trim()
      ? playerList.filter(p =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          (p.country || '').toLowerCase().includes(search.toLowerCase()) ||
          (p.club || '').toLowerCase().includes(search.toLowerCase())
        )
      : playerList
  );

  function getInitials(name) {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }

  function getRatingClass(rating) {
    if (rating >= 2500) return 'text-gold';
    if (rating >= 2000) return 'text-success';
    if (rating >= 1500) return 'text-warning';
    return 'text-muted';
  }

  function getRatingLabel(rating) {
    if (rating >= 2500) return 'Grandmaster';
    if (rating >= 2200) return 'Master';
    if (rating >= 2000) return 'Expert';
    if (rating >= 1800) return 'Advanced';
    if (rating >= 1500) return 'Intermediate';
    return 'Beginner';
  }

  function openAdd() {
    form = { name: '', rating: 1200, country: '', club: '' };
    showAddModal = true;
  }

  function openEdit(player) {
    selectedPlayer = player;
    form = { name: player.name, rating: player.rating, country: player.country, club: player.club };
    showEditModal = true;
  }

  function openDelete(player) {
    selectedPlayer = player;
    showDeleteModal = true;
  }

  function handleAdd() {
    if (!form.name.trim()) return;
    playersStore.add({ ...form, rating: Number(form.rating) });
    showAddModal = false;
  }

  function handleEdit() {
    if (!form.name.trim() || !selectedPlayer) return;
    playersStore.update(selectedPlayer.id, { ...form, rating: Number(form.rating) });
    showEditModal = false;
    selectedPlayer = null;
  }

  function handleDelete() {
    if (!selectedPlayer) return;
    playersStore.remove(selectedPlayer.id);
    showDeleteModal = false;
    selectedPlayer = null;
  }
</script>

<div>
  <!-- Page Header -->
  <div class="page-header">
    <div>
      <h1 class="page-title">♟ <span>Players</span></h1>
      <p class="page-subtitle">{playerList.length} player{playerList.length !== 1 ? 's' : ''} registered</p>
    </div>
    <div class="flex items-center gap-3 flex-wrap">
      <div class="search-bar">
        <span class="search-icon">🔍</span>
        <input
          id="player-search"
          class="form-input"
          type="text"
          placeholder="Search players..."
          bind:value={search}
        />
      </div>
      <button id="add-player-btn" class="btn btn-primary" onclick={openAdd}>
        + Add Player
      </button>
    </div>
  </div>

  <!-- Stats row -->
  <div class="stats-row">
    <div class="stat-card">
      <span class="stat-value">{playerList.length}</span>
      <span class="stat-label">Total Players</span>
    </div>
    <div class="stat-card">
      <span class="stat-value">{playerList.filter(p => p.rating >= 2000).length}</span>
      <span class="stat-label">Masters+</span>
    </div>
    <div class="stat-card">
      <span class="stat-value">
        {playerList.length ? Math.round(playerList.reduce((a, p) => a + p.rating, 0) / playerList.length) : '—'}
      </span>
      <span class="stat-label">Avg Rating</span>
    </div>
    <div class="stat-card">
      <span class="stat-value">{playerList.length ? Math.max(...playerList.map(p => p.rating)) : '—'}</span>
      <span class="stat-label">Top Rating</span>
    </div>
  </div>

  <!-- Players Grid -->
  {#if filtered.length === 0}
    <div class="empty-state">
      <div class="empty-state-icon">♞</div>
      <div class="empty-state-title">{search ? 'No players found' : 'No players yet'}</div>
      <p class="empty-state-text">
        {search ? 'Try a different search term.' : 'Add your first player to get started.'}
      </p>
      {#if !search}
        <button class="btn btn-primary" onclick={openAdd}>+ Add Player</button>
      {/if}
    </div>
  {:else}
    <div class="grid-cards">
      {#each filtered as player (player.id)}
        <div class="card" id="player-card-{player.id}">
          <div class="flex items-center gap-3 mb-4">
            <div class="avatar avatar-lg">{getInitials(player.name)}</div>
            <div style="flex:1; min-width:0;">
              <div class="font-bold truncate" style="font-size:1rem;">{player.name}</div>
              <div class="flex gap-2 mt-1 flex-wrap">
                {#if player.country}
                  <span class="chip">🌍 {player.country}</span>
                {/if}
                {#if player.club}
                  <span class="chip">🏛 {player.club}</span>
                {/if}
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <div class="flex items-center gap-2">
                <span class="{getRatingClass(player.rating)} font-bold font-display" style="font-size:1.5rem;">{player.rating}</span>
                <span class="badge badge-upcoming" style="font-size:0.65rem;">{getRatingLabel(player.rating)}</span>
              </div>
              <div class="text-xs text-muted mt-1">ELO Rating</div>
            </div>
            <div class="flex gap-2">
              <button
                id="edit-player-{player.id}"
                class="btn btn-ghost btn-sm btn-icon"
                onclick={() => openEdit(player)}
                aria-label="Edit {player.name}"
              >✏️</button>
              <button
                id="delete-player-{player.id}"
                class="btn btn-danger btn-sm btn-icon"
                onclick={() => openDelete(player)}
                aria-label="Delete {player.name}"
              >🗑</button>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<!-- Add Player Modal -->
<Modal open={showAddModal} title="Add New Player" onClose={() => showAddModal = false}>
  {#snippet children()}
    <div class="form-group">
      <label class="form-label" for="add-name">Player Name *</label>
      <input id="add-name" class="form-input" type="text" placeholder="e.g. Magnus Carlsen" bind:value={form.name} />
    </div>
    <div class="form-grid">
      <div class="form-group">
        <label class="form-label" for="add-rating">ELO Rating</label>
        <input id="add-rating" class="form-input" type="number" min="0" max="3200" placeholder="1200" bind:value={form.rating} />
      </div>
      <div class="form-group">
        <label class="form-label" for="add-country">Country</label>
        <input id="add-country" class="form-input" type="text" placeholder="e.g. Norway" bind:value={form.country} />
      </div>
    </div>
    <div class="form-group">
      <label class="form-label" for="add-club">Club / Organization</label>
      <input id="add-club" class="form-input" type="text" placeholder="e.g. Oslo Chess Club" bind:value={form.club} />
    </div>
  {/snippet}
  {#snippet footer()}
    <button class="btn btn-ghost" onclick={() => showAddModal = false}>Cancel</button>
    <button id="confirm-add-player" class="btn btn-primary" onclick={handleAdd} disabled={!form.name.trim()}>
      Add Player
    </button>
  {/snippet}
</Modal>

<!-- Edit Player Modal -->
<Modal open={showEditModal} title="Edit Player" onClose={() => { showEditModal = false; selectedPlayer = null; }}>
  {#snippet children()}
    <div class="form-group">
      <label class="form-label" for="edit-name">Player Name *</label>
      <input id="edit-name" class="form-input" type="text" bind:value={form.name} />
    </div>
    <div class="form-grid">
      <div class="form-group">
        <label class="form-label" for="edit-rating">ELO Rating</label>
        <input id="edit-rating" class="form-input" type="number" min="0" max="3200" bind:value={form.rating} />
      </div>
      <div class="form-group">
        <label class="form-label" for="edit-country">Country</label>
        <input id="edit-country" class="form-input" type="text" bind:value={form.country} />
      </div>
    </div>
    <div class="form-group">
      <label class="form-label" for="edit-club">Club</label>
      <input id="edit-club" class="form-input" type="text" bind:value={form.club} />
    </div>
  {/snippet}
  {#snippet footer()}
    <button class="btn btn-ghost" onclick={() => { showEditModal = false; selectedPlayer = null; }}>Cancel</button>
    <button id="confirm-edit-player" class="btn btn-primary" onclick={handleEdit} disabled={!form.name.trim()}>
      Save Changes
    </button>
  {/snippet}
</Modal>

<!-- Delete Confirm Modal -->
<Modal open={showDeleteModal} title="Delete Player?" onClose={() => { showDeleteModal = false; selectedPlayer = null; }}>
  {#snippet children()}
    <p>Are you sure you want to delete <strong style="color:var(--color-text-primary)">{selectedPlayer?.name}</strong>? This cannot be undone.</p>
  {/snippet}
  {#snippet footer()}
    <button class="btn btn-ghost" onclick={() => { showDeleteModal = false; selectedPlayer = null; }}>Cancel</button>
    <button id="confirm-delete-player" class="btn btn-danger" onclick={handleDelete}>Delete Player</button>
  {/snippet}
</Modal>
