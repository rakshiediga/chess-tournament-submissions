/**
 * Shuffles an array using Fisher-Yates algorithm
 */
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Generate a single round of matches from a list of players.
 * If odd number of players, one gets a "bye" (automatic win).
 * @param {Array} players - array of player objects
 * @param {number} roundNumber - 1-based round number
 * @returns {Array} array of match objects
 */
export function generateRound(players, roundNumber) {
  const shuffled = shuffle(players);
  const matches = [];
  let byePlayer = null;

  if (shuffled.length % 2 !== 0) {
    byePlayer = shuffled.pop();
  }

  for (let i = 0; i < shuffled.length; i += 2) {
    matches.push({
      id: crypto.randomUUID(),
      round: roundNumber,
      playerA: shuffled[i],
      playerB: shuffled[i + 1],
      winnerId: null,
      loserId: null,
      isBye: false,
      completedAt: null
    });
  }

  if (byePlayer) {
    matches.push({
      id: crypto.randomUUID(),
      round: roundNumber,
      playerA: byePlayer,
      playerB: null,
      winnerId: byePlayer.id,
      loserId: null,
      isBye: true,
      completedAt: new Date().toISOString()
    });
  }

  return matches;
}

/**
 * Simulate all pending matches in a round — randomly pick winners
 * @param {Array} roundMatches - array of match objects
 * @returns {Array} updated matches with winners assigned
 */
export function simulateRound(roundMatches) {
  return roundMatches.map(match => {
    if (match.winnerId !== null || match.isBye) return match;

    const winnerIsA = Math.random() < 0.5;
    const winner = winnerIsA ? match.playerA : match.playerB;
    const loser = winnerIsA ? match.playerB : match.playerA;

    return {
      ...match,
      winnerId: winner.id,
      loserId: loser.id,
      completedAt: new Date().toISOString()
    };
  });
}

/**
 * Compute rankings from all match rounds for a tournament
 * @param {Array} rounds - array of rounds (each round is an array of matches)
 * @param {Array} players - array of player objects enrolled in the tournament
 * @returns {Array} sorted array of { player, wins, losses, byes, points }
 */
export function computeRankings(rounds, players) {
  const stats = {};

  for (const player of players) {
    stats[player.id] = { player, wins: 0, losses: 0, byes: 0, points: 0 };
  }

  for (const round of rounds) {
    for (const match of round) {
      if (match.isBye && match.playerA) {
        if (stats[match.playerA.id]) {
          stats[match.playerA.id].byes += 1;
          stats[match.playerA.id].points += 1;
        }
      } else if (match.winnerId) {
        if (stats[match.winnerId]) {
          stats[match.winnerId].wins += 1;
          stats[match.winnerId].points += 1;
        }
        if (match.loserId && stats[match.loserId]) {
          stats[match.loserId].losses += 1;
        }
      }
    }
  }

  return Object.values(stats).sort((a, b) => b.points - a.points || b.wins - a.wins);
}
