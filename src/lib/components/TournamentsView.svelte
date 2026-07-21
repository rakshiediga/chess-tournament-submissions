<script>
  import { tournaments as tournamentsStore } from '$lib/stores/tournaments.js';
  import { players as playersStore } from '$lib/stores/players.js';
  import { matches as matchesStore } from '$lib/stores/matches.js';
  import Modal from '$lib/components/Modal.svelte';

  /** @type {{ onNavigateToDetail: (id: string) => void }} */
  let { onNavigateToDetail } = $props();

  let tournamentList = $state([]);
  let playerList = $state([]);
  let matchesData = $state({});

  let showAddModal = $state(false);
  let showEditModal = $state(false);
  let showDeleteModal = $state(false);
  let selectedTournament = $state(null);

  let form = $state({ name: '', date: '', format: 'Swiss', maxPlayers: 8 });

  const today = new Date().toISOString().split('T')[0];

  const unsubT = tournamentsStore.subscribe(v => { tournamentList = v; });
  const unsubP = playersStore.subscribe(v => { playerList = v; });
  const unsubM = matchesStore.subscribe(v => { matchesData = v; });

  $effect(() => () => { unsubT(); unsubP(); unsubM(); });

  function getStatusBadgeClass(status) {
    return `badge badge-${status === 'upcoming' ? 'upcoming' : status === 'active' ? 'active' : 'completed'}`;
  }

  function getStatusLabel(status) {
    return { upcoming: 'Upcoming', active: 'In Progress', completed: 'Completed' }[status] ?? status;
  }

  function getEnrolledPlayers(tournament) {
    return playerList.filter(p => tournament.playerIds.includes(p.id));
  }

  function getMatchCount(tournamentId) {
    const rounds = matchesData[tournamentId] || [];
    return rounds.reduce((sum, r) => sum + r.length, 0);
  }

  function openAdd() {
    form = { name: '', date: today, format: 'Swiss', maxPlayers: 8 };
    showAddModal = true;
  }

  function openEdit(t) {
    selectedTournament = t;
    form = { name: t.name, date: t.date, format: t.format, maxPlayers: t.maxPlayers };
    showEditModal = true;
  }

  function openDelete(t) {
    selectedTournament = t;
    showDeleteModal = true;
  }

  function handleAdd() {
    if (!form.name.trim()) return;
    tournamentsStore.add({ ...form, maxPlayers: Number(form.maxPlayers) });
    showAddModal = false;
  }

  function handleEdit() {
    if (!form.name.trim() || !selectedTournament) return;
    tournamentsStore.update(selectedTournament.id, { ...form, maxPlayers: Number(form.maxPlayers) });
    showEditModal = false;
    selectedTournament = null;
  }

  function handleDelete() {
    if (!selectedTournament) return;
    tournamentsStore.remove(selectedTournament.id);
    matchesStore.clearTournament(selectedTournament.id);
    showDeleteModal = false;
    selectedTournament = null;
  }
</script>

<div>
  <div class="page-header">
    <div>
      <h1 class="page-title">🏆 <span>Tournaments</span></h1>
      <p class="page-subtitle">{tournamentList.length} tournament{tournamentList.length !== 1 ? 's' : ''} created</p>
    </div>
    <button id="add-tournament-btn" class="btn btn-primary" onclick={openAdd}>+ New Tournament</button>
  </div>

  <!-- Stats -->
  <div class="stats-row">
    <div class="stat-card">
      <span class="stat-value">{tournamentList.length}</span>
      <span class="stat-label">Total</span>
    </div>
    <div class="stat-card">
      <span class="stat-value">{tournamentList.filter(t => t.status === 'active').length}</span>
      <span class="stat-label">Active</span>
    </div>
    <div class="stat-card">
      <span class="stat-value">{tournamentList.filter(t => t.status === 'completed').length}</span>
      <span class="stat-label">Completed</span>
    </div>
    <div class="stat-card">
      <span class="stat-value">{playerList.length}</span>
      <span class="stat-label">Players Available</span>
    </div>
  </div>

  {#if tournamentList.length === 0}
    <div class="empty-state">
      <div class="empty-state-icon">🏆</div>
      <div class="empty-state-title">No tournaments yet</div>
      <p class="empty-state-text">Create your first chess tournament to get started.</p>
      <button class="btn btn-primary" onclick={openAdd}>+ New Tournament</button>
    </div>
  {:else}
    <div class="grid-cards-wide">
      {#each tournamentList as tournament (tournament.id)}
        {@const enrolled = getEnrolledPlayers(tournament)}
        {@const matchCount = getMatchCount(tournament.id)}
        <div class="card" id="tournament-card-{tournament.id}" style="cursor:default;">
          <!-- Header -->
          <div class="flex items-center justify-between mb-3">
            <span class={getStatusBadgeClass(tournament.status)}>
              {getStatusLabel(tournament.status)}
            </span>
            <div class="flex gap-2">
              <button
                id="edit-tournament-{tournament.id}"
                class="btn btn-ghost btn-sm btn-icon"
                onclick={() => openEdit(tournament)}
                aria-label="Edit {tournament.name}"
              >✏️</button>
              <button
                id="delete-tournament-{tournament.id}"
                class="btn btn-danger btn-sm btn-icon"
                onclick={() => openDelete(tournament)}
                aria-label="Delete {tournament.name}"
              >🗑</button>
            </div>
          </div>

          <!-- Title -->
          <h3 class="font-display" style="font-size:1.2rem; margin-bottom:0.5rem; color:var(--color-text-primary);">
            {tournament.name}
          </h3>

          <!-- Meta -->
          <div class="flex gap-2 flex-wrap mb-3">
            <span class="chip">📅 {tournament.date}</span>
            <span class="chip">⚔ {tournament.format}</span>
            <span class="chip">👥 Max {tournament.maxPlayers}</span>
          </div>

          <div class="divider"></div>

          <!-- Enrolled players preview -->
          <div class="flex items-center justify-between mt-2">
            <div class="flex items-center gap-2">
              <div class="flex" style="gap: -4px;">
                {#each enrolled.slice(0, 4) as p}
                  <div class="avatar avatar-sm" style="border: 2px solid var(--color-bg-card);">
                    {p.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()}
                  </div>
                {/each}
                {#if enrolled.length > 4}
                  <div class="avatar avatar-sm" style="background:var(--color-bg-glass); color:var(--color-text-muted); border: 2px solid var(--color-bg-card);">
                    +{enrolled.length - 4}
                  </div>
                {/if}
              </div>
              <span class="text-sm text-muted">{enrolled.length} player{enrolled.length !== 1 ? 's' : ''}</span>
            </div>
            <span class="text-sm text-muted">{matchCount} match{matchCount !== 1 ? 'es' : ''}</span>
          </div>

          <button
            id="open-tournament-{tournament.id}"
            class="btn btn-ghost w-full mt-3"
            onclick={() => onNavigateToDetail(tournament.id)}
          >
            Open Tournament →
          </button>
        </div>
      {/each}
    </div>
  {/if}
</div>

<!-- Add Modal -->
<Modal open={showAddModal} title="New Tournament" onClose={() => showAddModal = false}>
  {#snippet children()}
    <div class="form-group">
      <label class="form-label" for="t-add-name">Tournament Name *</label>
      <input id="t-add-name" class="form-input" type="text" placeholder="e.g. Spring Open 2026" bind:value={form.name} />
    </div>
    <div class="form-grid">
      <div class="form-group">
        <label class="form-label" for="t-add-date">Date</label>
        <input id="t-add-date" class="form-input" type="date" bind:value={form.date} />
      </div>
      <div class="form-group">
        <label class="form-label" for="t-add-max">Max Players</label>
        <input id="t-add-max" class="form-input" type="number" min="2" max="128" bind:value={form.maxPlayers} />
      </div>
    </div>
    <div class="form-group">
      <label class="form-label" for="t-add-format">Format</label>
      <select id="t-add-format" class="form-select" bind:value={form.format}>
        <option>Swiss</option>
        <option>Round Robin</option>
        <option>Single Elimination</option>
        <option>Double Elimination</option>
        <option>Blitz</option>
      </select>
    </div>
  {/snippet}
  {#snippet footer()}
    <button class="btn btn-ghost" onclick={() => showAddModal = false}>Cancel</button>
    <button id="confirm-add-tournament" class="btn btn-primary" onclick={handleAdd} disabled={!form.name.trim()}>
      Create Tournament
    </button>
  {/snippet}
</Modal>

<!-- Edit Modal -->
<Modal open={showEditModal} title="Edit Tournament" onClose={() => { showEditModal = false; selectedTournament = null; }}>
  {#snippet children()}
    <div class="form-group">
      <label class="form-label" for="t-edit-name">Tournament Name *</label>
      <input id="t-edit-name" class="form-input" type="text" bind:value={form.name} />
    </div>
    <div class="form-grid">
      <div class="form-group">
        <label class="form-label" for="t-edit-date">Date</label>
        <input id="t-edit-date" class="form-input" type="date" bind:value={form.date} />
      </div>
      <div class="form-group">
        <label class="form-label" for="t-edit-max">Max Players</label>
        <input id="t-edit-max" class="form-input" type="number" min="2" max="128" bind:value={form.maxPlayers} />
      </div>
    </div>
    <div class="form-group">
      <label class="form-label" for="t-edit-format">Format</label>
      <select id="t-edit-format" class="form-select" bind:value={form.format}>
        <option>Swiss</option>
        <option>Round Robin</option>
        <option>Single Elimination</option>
        <option>Double Elimination</option>
        <option>Blitz</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label" for="t-edit-status">Status</label>
      <select id="t-edit-status" class="form-select" bind:value={selectedTournament.status}
        onchange={() => tournamentsStore.setStatus(selectedTournament.id, selectedTournament.status)}>
        <option value="upcoming">Upcoming</option>
        <option value="active">In Progress</option>
        <option value="completed">Completed</option>
      </select>
    </div>
  {/snippet}
  {#snippet footer()}
    <button class="btn btn-ghost" onclick={() => { showEditModal = false; selectedTournament = null; }}>Cancel</button>
    <button id="confirm-edit-tournament" class="btn btn-primary" onclick={handleEdit} disabled={!form.name.trim()}>
      Save Changes
    </button>
  {/snippet}
</Modal>

<!-- Delete Modal -->
<Modal open={showDeleteModal} title="Delete Tournament?" onClose={() => { showDeleteModal = false; selectedTournament = null; }}>
  {#snippet children()}
    <p>Delete <strong style="color:var(--color-text-primary)">{selectedTournament?.name}</strong>? All match data will be permanently removed.</p>
  {/snippet}
  {#snippet footer()}
    <button class="btn btn-ghost" onclick={() => { showDeleteModal = false; selectedTournament = null; }}>Cancel</button>
    <button id="confirm-delete-tournament" class="btn btn-danger" onclick={handleDelete}>Delete Tournament</button>
  {/snippet}
</Modal>
