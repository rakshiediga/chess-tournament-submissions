<script>
  import '../app.css';

  let { children } = $props();
</script>

<svelte:head>
  <title>ChessTourney — Chess Tournament Management</title>
  <meta name="description" content="Manage chess tournaments, players, matches and rankings with ChessTournery." />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
</svelte:head>

{@render children()}
