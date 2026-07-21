<script>
  import { tournaments as tournamentsStore } from '$lib/stores/tournaments.js';
  import { players as playersStore } from '$lib/stores/players.js';
  import { matches as matchesStore } from '$lib/stores/matches.js';
  import { computeRankings } from '$lib/utils/matchmaker.js';

  let tournamentList = $state([]);
  let playerList = $state([]);
  let matchesData = $state({});
  let selectedTournamentId = $state('all');

  const unsubT = tournamentsStore.subscribe(v => { tournamentList = v; });
  const unsubP = playersStore.subscribe(v => { playerList = v; });
  const unsubM = matchesStore.subscribe(v => { matchesData = v; });

  $effect(() => () => { unsubT(); unsubP(); unsubM(); });

  // Tournaments that have match data
  let tournamentsWithData = $derived(
    tournamentList.filter(t => (matchesData[t.id] || []).length > 0)
  );

  let activeTournament = $derived(
    selectedTournamentId === 'all'
      ? null
      : tournamentList.find(t => t.id === selectedTournamentId)
  );

  // Aggregate rankings across all tournaments or single one
  let rankings = $derived(() => {
    if (selectedTournamentId === 'all') {
      // Aggregate across all tournaments
      const stats = {};
      for (const p of playerList) {
        stats[p.id] = { player: p, wins: 0, losses: 0, byes: 0, points: 0, tournaments: 0 };
      }
      for (const tournament of tournamentList) {
        const rounds = matchesData[tournament.id] || [];
        if (!rounds.length) continue;
        const enrolled = playerList.filter(p => tournament.playerIds.includes(p.id));
        const tourneyRankings = computeRankings(rounds, enrolled);
        for (const r of tourneyRankings) {
          if (stats[r.player.id]) {
            stats[r.player.id].wins += r.wins;
            stats[r.player.id].losses += r.losses;
            stats[r.player.id].byes += r.byes;
            stats[r.player.id].points += r.points;
            if (r.wins + r.losses + r.byes > 0) stats[r.player.id].tournaments++;
          }
        }
      }
      return Object.values(stats)
        .filter(s => s.points > 0 || s.wins > 0)
        .sort((a, b) => b.points - a.points || b.wins - a.wins);
    } else {
      const tournament = tournamentList.find(t => t.id === selectedTournamentId);
      if (!tournament) return [];
      const rounds = matchesData[selectedTournamentId] || [];
      const enrolled = playerList.filter(p => tournament.playerIds.includes(p.id));
      return computeRankings(rounds, enrolled).filter(r => r.wins + r.losses + r.byes > 0);
    }
  });

  function getMedalIcon(index) {
    return ['🥇', '🥈', '🥉'][index] ?? '';
  }

  function getRowClass(index) {
    return `rank-${index + 1 <= 3 ? index + 1 : 'other'}`;
  }

  function getInitials(name) {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }

  let podiumData = $derived(rankings().slice(0, 3));
</script>

<div>
  <div class="page-header">
    <div>
      <h1 class="page-title">🥇 <span>Rankings</span></h1>
      <p class="page-subtitle">Player standings and achievements</p>
    </div>

    <!-- Tournament filter -->
    <div class="form-group" style="min-width:200px;">
      <label class="form-label" for="rankings-filter">Filter by Tournament</label>
      <select id="rankings-filter" class="form-select" bind:value={selectedTournamentId}>
        <option value="all">All Tournaments</option>
        {#each tournamentsWithData as t (t.id)}
          <option value={t.id}>{t.name}</option>
        {/each}
      </select>
    </div>
  </div>

  {#if rankings().length === 0}
    <div class="empty-state">
      <div class="empty-state-icon">♛</div>
      <div class="empty-state-title">No Rankings Available</div>
      <p class="empty-state-text">
        {tournamentsWithData.length === 0
          ? 'Run some matches in a tournament to see rankings.'
          : 'No match data for the selected tournament.'}
      </p>
    </div>
  {:else}
    <!-- PODIUM (top 3) -->
    {#if podiumData.length >= 2}
      <div class="card" style="margin-bottom:2rem; padding:2rem;">
        <h2 class="font-display text-gold" style="text-align:center; margin-bottom:0.25rem; font-size:1.5rem;">
          🏆 Champions Podium
        </h2>
        {#if activeTournament}
          <p class="text-muted" style="text-align:center; font-size:0.8rem; margin-bottom:1.5rem;">{activeTournament.name}</p>
        {:else}
          <p class="text-muted" style="text-align:center; font-size:0.8rem; margin-bottom:1.5rem;">Overall Standings</p>
        {/if}

        <div class="podium">
          <!-- 2nd place (left) -->
          {#if podiumData[1]}
            <div class="podium-place podium-2">
              <div class="podium-avatar" style="position:relative;">
                <div class="avatar avatar-lg" style="background:linear-gradient(135deg,#8888a0,#c0c0d0); color:#0a0a0f;">
                  {getInitials(podiumData[1].player.name)}
                </div>
                <span class="podium-crown">🥈</span>
              </div>
              <div class="podium-name">{podiumData[1].player.name}</div>
              <div class="podium-points">{podiumData[1].points} pts</div>
              <div class="podium-block">2</div>
            </div>
          {/if}

          <!-- 1st place (center) -->
          <div class="podium-place podium-1">
            <div class="podium-avatar" style="position:relative;">
              <div class="avatar avatar-lg" style="background:linear-gradient(135deg,#c8960a,#f0c040); color:#1a0f00; box-shadow: 0 0 24px var(--color-gold-glow);">
                {getInitials(podiumData[0].player.name)}
              </div>
              <span class="podium-crown">👑</span>
            </div>
            <div class="podium-name" style="color:var(--color-gold);">{podiumData[0].player.name}</div>
            <div class="podium-points">{podiumData[0].points} pts</div>
            <div class="podium-block">1</div>
          </div>

          <!-- 3rd place (right) -->
          {#if podiumData[2]}
            <div class="podium-place podium-3">
              <div class="podium-avatar" style="position:relative;">
                <div class="avatar avatar-lg" style="background:linear-gradient(135deg,#8b5010,#cd7f32); color:#0a0a0f;">
                  {getInitials(podiumData[2].player.name)}
                </div>
                <span class="podium-crown">🥉</span>
              </div>
              <div class="podium-name">{podiumData[2].player.name}</div>
              <div class="podium-points">{podiumData[2].points} pts</div>
              <div class="podium-block">3</div>
            </div>
          {/if}
        </div>
      </div>
    {/if}

    <!-- FULL LEADERBOARD TABLE -->
    <div class="card">
      <h2 class="font-display" style="font-size:1.1rem; margin-bottom:1rem;">Full Leaderboard</h2>
      <div style="overflow-x:auto;">
        <table class="rank-table">
          <thead>
            <tr>
              <th style="width:48px;">#</th>
              <th>Player</th>
              <th>Rating</th>
              <th style="text-align:center;">Wins</th>
              <th style="text-align:center;">Losses</th>
              <th style="text-align:center;">Byes</th>
              <th style="text-align:center;">Points</th>
              {#if selectedTournamentId === 'all'}
                <th style="text-align:center;">Tournaments</th>
              {/if}
            </tr>
          </thead>
          <tbody>
            {#each rankings() as row, i (row.player.id)}
              <tr class={getRowClass(i)} id="rank-row-{row.player.id}">
                <td>
                  <span class="rank-num">
                    {getMedalIcon(i) || (i + 1)}
                  </span>
                </td>
                <td>
                  <div class="flex items-center gap-2">
                    <div class="avatar avatar-sm">{getInitials(row.player.name)}</div>
                    <div>
                      <div class="font-bold text-sm">{row.player.name}</div>
                      {#if row.player.country}
                        <div class="text-xs text-muted">{row.player.country}</div>
                      {/if}
                    </div>
                  </div>
                </td>
                <td>
                  <span class="text-sm" style="font-family:var(--font-display); font-weight:700;">{row.player.rating}</span>
                </td>
                <td style="text-align:center;">
                  <span class="text-success font-bold">{row.wins}</span>
                </td>
                <td style="text-align:center;">
                  <span class="text-danger">{row.losses}</span>
                </td>
                <td style="text-align:center;">
                  <span class="text-muted">{row.byes}</span>
                </td>
                <td style="text-align:center;">
                  <span class="font-bold" style="font-family:var(--font-display); color:var(--color-gold);">
                    {row.points}
                  </span>
                </td>
                {#if selectedTournamentId === 'all'}
                  <td style="text-align:center;">
                    <span class="text-muted text-sm">{row.tournaments}</span>
                  </td>
                {/if}
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  {/if}
</div>
