<script>
  import { tournaments as tournamentsStore } from '$lib/stores/tournaments.js';
  import { players as playersStore } from '$lib/stores/players.js';
  import { matches as matchesStore } from '$lib/stores/matches.js';
  import { generateRound, simulateRound, computeRankings } from '$lib/utils/matchmaker.js';
  import Modal from '$lib/components/Modal.svelte';

  /** @type {{ tournamentId: string, onBack: () => void }} */
  let { tournamentId, onBack } = $props();

  let tournamentList = $state([]);
  let playerList = $state([]);
  let matchesData = $state({});
  let showAddPlayerModal = $state(false);

  const unsubT = tournamentsStore.subscribe(v => { tournamentList = v; });
  const unsubP = playersStore.subscribe(v => { playerList = v; });
  const unsubM = matchesStore.subscribe(v => { matchesData = v; });

  $effect(() => () => { unsubT(); unsubP(); unsubM(); });

  let tournament = $derived(tournamentList.find(t => t.id === tournamentId));
  let enrolled = $derived(tournament ? playerList.filter(p => tournament.playerIds.includes(p.id)) : []);
  let rounds = $derived(matchesData[tournamentId] || []);
  let rankings = $derived(computeRankings(rounds, enrolled));

  let availableToAdd = $derived(
    playerList.filter(p => !tournament?.playerIds.includes(p.id))
  );

  let selectedPlayerIds = $state([]);

  function getInitials(name) {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }

  function removePlayer(playerId) {
    tournamentsStore.removePlayer(tournamentId, playerId);
  }

  function generateNewRound() {
    if (enrolled.length < 2) return;
    const roundNumber = rounds.length + 1;
    const newRound = generateRound(enrolled, roundNumber);
    matchesStore.setRounds(tournamentId, [...rounds, newRound]);
    tournamentsStore.setStatus(tournamentId, 'active');
  }

  function simulateCurrentRound() {
    const lastIndex = rounds.length - 1;
    if (lastIndex < 0) return;
    const simulated = simulateRound(rounds[lastIndex]);
    const updatedRounds = rounds.map((r, i) => i === lastIndex ? simulated : r);
    matchesStore.setRounds(tournamentId, updatedRounds);
  }

  function isRoundComplete(round) {
    return round.every(m => m.winnerId !== null);
  }

  function openAddPlayer() {
    selectedPlayerIds = [];
    showAddPlayerModal = true;
  }

  function handleAddPlayers() {
    for (const id of selectedPlayerIds) {
      tournamentsStore.addPlayer(tournamentId, id);
    }
    showAddPlayerModal = false;
    selectedPlayerIds = [];
  }

  function togglePlayerSelect(id) {
    if (selectedPlayerIds.includes(id)) {
      selectedPlayerIds = selectedPlayerIds.filter(pid => pid !== id);
    } else {
      selectedPlayerIds = [...selectedPlayerIds, id];
    }
  }

  function completeTournament() {
    tournamentsStore.setStatus(tournamentId, 'completed');
  }

  function clearMatches() {
    matchesStore.clearTournament(tournamentId);
    tournamentsStore.setStatus(tournamentId, 'upcoming');
  }

  let currentRoundComplete = $derived(
    rounds.length > 0 && isRoundComplete(rounds[rounds.length - 1])
  );

  let canGenerate = $derived(enrolled.length >= 2);
</script>

{#if !tournament}
  <div class="empty-state">
    <div class="empty-state-icon">❓</div>
    <div class="empty-state-title">Tournament not found</div>
    <button class="btn btn-ghost" onclick={onBack}>← Back to Tournaments</button>
  </div>
{:else}
  <div>
    <!-- Back + Header -->
    <div style="margin-bottom:1.5rem;">
      <button class="btn btn-ghost btn-sm" id="back-to-tournaments" onclick={onBack}>
        ← Back to Tournaments
      </button>
    </div>

    <div class="page-header">
      <div>
        <h1 class="page-title">⚔ <span>{tournament.name}</span></h1>
        <div class="flex gap-2 mt-2 flex-wrap">
          <span class="chip">📅 {tournament.date}</span>
          <span class="chip">⚙ {tournament.format}</span>
          <span class="badge badge-{tournament.status === 'upcoming' ? 'upcoming' : tournament.status === 'active' ? 'active' : 'completed'}">
            {tournament.status === 'upcoming' ? 'Upcoming' : tournament.status === 'active' ? 'In Progress' : 'Completed'}
          </span>
        </div>
      </div>
      <div class="flex gap-2 flex-wrap">
        {#if tournament.status !== 'completed'}
          <button
            id="complete-tournament-btn"
            class="btn btn-success btn-sm"
            onclick={completeTournament}
          >
            ✓ Mark Complete
          </button>
        {/if}
        {#if rounds.length > 0}
          <button
            id="clear-matches-btn"
            class="btn btn-danger btn-sm"
            onclick={clearMatches}
          >
            🗑 Clear Matches
          </button>
        {/if}
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-row">
      <div class="stat-card">
        <span class="stat-value">{enrolled.length}</span>
        <span class="stat-label">Players Enrolled</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{rounds.length}</span>
        <span class="stat-label">Rounds Played</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{rounds.reduce((s, r) => s + r.filter(m => m.winnerId).length, 0)}</span>
        <span class="stat-label">Matches Complete</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{tournament.maxPlayers}</span>
        <span class="stat-label">Max Players</span>
      </div>
    </div>

    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1.5rem; align-items:start;">

      <!-- ===== LEFT: Players Panel ===== -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <h2 class="font-display" style="font-size:1.1rem;">Players ({enrolled.length})</h2>
          {#if enrolled.length < tournament.maxPlayers}
            <button id="add-players-btn" class="btn btn-primary btn-sm" onclick={openAddPlayer}>
              + Add Players
            </button>
          {/if}
        </div>

        {#if enrolled.length === 0}
          <div class="card" style="text-align:center; padding:2rem;">
            <div style="font-size:2.5rem; margin-bottom:0.5rem; opacity:0.3;">♟</div>
            <div class="text-muted text-sm">No players enrolled yet.</div>
            <button class="btn btn-primary btn-sm mt-4" onclick={openAddPlayer}>+ Add Players</button>
          </div>
        {:else}
          <div style="display:flex; flex-direction:column; gap:0.5rem;">
            {#each enrolled as player (player.id)}
              {@const stat = rankings.find(r => r.player.id === player.id)}
              <div class="card" style="padding:0.75rem 1rem;">
                <div class="flex items-center gap-3">
                  <div class="avatar avatar-sm">{getInitials(player.name)}</div>
                  <div style="flex:1; min-width:0;">
                    <div class="font-bold truncate text-sm">{player.name}</div>
                    <div class="text-xs text-muted">Rating: {player.rating}</div>
                  </div>
                  {#if stat && rounds.length > 0}
                    <div class="text-xs" style="text-align:right;">
                      <span class="text-success font-bold">{stat.wins}W</span>
                      <span class="text-muted"> · </span>
                      <span class="text-danger">{stat.losses}L</span>
                      {#if stat.byes > 0}
                        <span class="text-muted"> · {stat.byes}BYE</span>
                      {/if}
                    </div>
                  {/if}
                  {#if tournament.status !== 'completed'}
                    <button
                      id="remove-player-{player.id}"
                      class="btn btn-ghost btn-sm btn-icon"
                      onclick={() => removePlayer(player.id)}
                      aria-label="Remove {player.name}"
                    >✕</button>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        {/if}

        <!-- Match Controls -->
        <div style="margin-top:1.5rem; display:flex; flex-direction:column; gap:0.75rem;">
          <h2 class="font-display" style="font-size:1.1rem;">Match Controls</h2>

          <button
            id="generate-round-btn"
            class="btn btn-primary"
            onclick={generateNewRound}
            disabled={!canGenerate || (rounds.length > 0 && !currentRoundComplete)}
          >
            ⚡ Generate Round {rounds.length + 1}
          </button>

          <button
            id="simulate-round-btn"
            class="btn btn-success"
            onclick={simulateCurrentRound}
            disabled={rounds.length === 0 || currentRoundComplete}
          >
            🎲 Simulate Current Round
          </button>

          {#if !canGenerate}
            <p class="text-xs text-muted" style="text-align:center;">
              Add at least 2 players to generate matches.
            </p>
          {:else if rounds.length > 0 && !currentRoundComplete}
            <p class="text-xs text-muted" style="text-align:center;">
              Complete or simulate the current round first.
            </p>
          {/if}
        </div>
      </div>

      <!-- ===== RIGHT: Matches Rounds ===== -->
      <div>
        <h2 class="font-display mb-3" style="font-size:1.1rem;">Match Results</h2>

        {#if rounds.length === 0}
          <div class="card" style="text-align:center; padding:2rem;">
            <div style="font-size:2.5rem; margin-bottom:0.5rem; opacity:0.3;">⚔</div>
            <div class="text-muted text-sm">No rounds generated yet.</div>
            <div class="text-xs text-muted mt-2">Click "Generate Round" to create pairings.</div>
          </div>
        {:else}
          <div style="display:flex; flex-direction:column; gap:1rem; max-height:60vh; overflow-y:auto; padding-right:4px;">
            {#each rounds as round, roundIndex}
              <div class="card" style="padding:1rem;">
                <div class="flex items-center justify-between mb-3">
                  <h3 style="font-family:var(--font-display); font-size:0.95rem; color:var(--color-gold);">
                    Round {roundIndex + 1}
                  </h3>
                  {#if isRoundComplete(round)}
                    <span class="badge badge-completed">Complete</span>
                  {:else}
                    <span class="badge badge-active animate-pulse">In Progress</span>
                  {/if}
                </div>

                <div style="display:flex; flex-direction:column; gap:0.5rem;">
                  {#each round as match (match.id)}
                    <div class="match-card" class:winner-set={match.winnerId}>
                      <!-- Player A -->
                      <div class="match-player" style="flex-direction:{match.winnerId === match.playerA?.id ? 'row' : 'row'}">
                        <div class="avatar avatar-sm">{match.playerA ? getInitials(match.playerA.name) : '?'}</div>
                        <div>
                          <div class="match-player-name">{match.playerA?.name ?? 'BYE'}</div>
                          {#if match.winnerId === match.playerA?.id}
                            <span class="match-winner-badge">Winner</span>
                          {/if}
                        </div>
                      </div>

                      <!-- VS -->
                      <div class="match-vs">
                        {#if match.isBye}
                          <span class="match-bye-badge">BYE</span>
                        {:else}
                          vs
                        {/if}
                      </div>

                      <!-- Player B -->
                      {#if !match.isBye}
                        <div class="match-player right">
                          <div>
                            <div class="match-player-name">{match.playerB?.name ?? '?'}</div>
                            {#if match.winnerId === match.playerB?.id}
                              <span class="match-winner-badge">Winner</span>
                            {/if}
                          </div>
                          <div class="avatar avatar-sm">{match.playerB ? getInitials(match.playerB.name) : '?'}</div>
                        </div>
                      {/if}
                    </div>
                  {/each}
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<!-- Add Players Modal -->
<Modal open={showAddPlayerModal} title="Add Players to Tournament" onClose={() => showAddPlayerModal = false}>
  {#snippet children()}
    {#if availableToAdd.length === 0}
      <p class="text-muted text-sm">All registered players are already enrolled.</p>
    {:else}
      <p class="text-sm text-muted" style="margin-bottom:0.75rem;">
        Select players to add to this tournament:
      </p>
      <div style="display:flex; flex-direction:column; gap:0.5rem; max-height:300px; overflow-y:auto;">
        {#each availableToAdd as player (player.id)}
          <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
          <div
            class="player-select-item"
            class:selected={selectedPlayerIds.includes(player.id)}
            onclick={() => togglePlayerSelect(player.id)}
          >
            <input
              type="checkbox"
              id="select-player-{player.id}"
              checked={selectedPlayerIds.includes(player.id)}
              onchange={() => togglePlayerSelect(player.id)}
            />
            <div class="avatar avatar-sm">{getInitials(player.name)}</div>
            <div style="flex:1;">
              <div class="font-bold text-sm">{player.name}</div>
              <div class="text-xs text-muted">Rating: {player.rating}{player.country ? ` · ${player.country}` : ''}</div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  {/snippet}
  {#snippet footer()}
    <button class="btn btn-ghost" onclick={() => showAddPlayerModal = false}>Cancel</button>
    <button
      id="confirm-add-players"
      class="btn btn-primary"
      onclick={handleAddPlayers}
      disabled={selectedPlayerIds.length === 0}
    >
      Add {selectedPlayerIds.length > 0 ? `(${selectedPlayerIds.length})` : ''} Players
    </button>
  {/snippet}
</Modal>

<style>
  .match-card.winner-set {
    border-color: rgba(240, 192, 64, 0.15);
    background: rgba(240, 192, 64, 0.03);
  }
</style>
