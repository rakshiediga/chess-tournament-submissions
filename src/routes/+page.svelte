<script>
  import Navbar from '$lib/components/Navbar.svelte';
  import PlayersView from '$lib/components/PlayersView.svelte';
  import TournamentsView from '$lib/components/TournamentsView.svelte';
  import TournamentDetail from '$lib/components/TournamentDetail.svelte';
  import RankingsView from '$lib/components/RankingsView.svelte';

  let currentPage = $state('players');
  let activeTournamentId = $state(null);

  function navigate(page) {
    currentPage = page;
    activeTournamentId = null;
  }

  function navigateToTournamentDetail(id) {
    activeTournamentId = id;
    currentPage = 'tournament-detail';
  }

  function backToTournaments() {
    activeTournamentId = null;
    currentPage = 'tournaments';
  }
</script>

<svelte:head>
  <title>ChessTourney — {
    currentPage === 'players' ? 'Players' :
    currentPage === 'tournaments' ? 'Tournaments' :
    currentPage === 'tournament-detail' ? 'Tournament' :
    'Rankings'
  }</title>
</svelte:head>

<div class="app-layout">
  <Navbar
    currentPage={currentPage === 'tournament-detail' ? 'tournaments' : currentPage}
    onNavigate={navigate}
  />

  <main class="main-content" id="main-content">
    {#if currentPage === 'players'}
      <PlayersView />
    {:else if currentPage === 'tournaments'}
      <TournamentsView onNavigateToDetail={navigateToTournamentDetail} />
    {:else if currentPage === 'tournament-detail' && activeTournamentId}
      <TournamentDetail tournamentId={activeTournamentId} onBack={backToTournaments} />
    {:else if currentPage === 'rankings'}
      <RankingsView />
    {/if}
  </main>
</div>
