import { writable } from 'svelte/store';

const STORAGE_KEY = 'chess_tournaments';

function loadFromStorage() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function createTournamentsStore() {
  const { subscribe, set, update } = writable(loadFromStorage());

  function persist(tournaments) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tournaments));
  }

  return {
    subscribe,
    add(tournament) {
      update(tournaments => {
        const newTournament = {
          id: crypto.randomUUID(),
          name: tournament.name,
          date: tournament.date || new Date().toISOString().split('T')[0],
          format: tournament.format || 'Swiss',
          maxPlayers: tournament.maxPlayers || 8,
          playerIds: [],
          status: 'upcoming',
          createdAt: new Date().toISOString()
        };
        const updated = [...tournaments, newTournament];
        persist(updated);
        return updated;
      });
    },
    update(id, changes) {
      update(tournaments => {
        const updated = tournaments.map(t => t.id === id ? { ...t, ...changes } : t);
        persist(updated);
        return updated;
      });
    },
    remove(id) {
      update(tournaments => {
        const updated = tournaments.filter(t => t.id !== id);
        persist(updated);
        return updated;
      });
    },
    addPlayer(tournamentId, playerId) {
      update(tournaments => {
        const updated = tournaments.map(t => {
          if (t.id === tournamentId && !t.playerIds.includes(playerId)) {
            return { ...t, playerIds: [...t.playerIds, playerId] };
          }
          return t;
        });
        persist(updated);
        return updated;
      });
    },
    removePlayer(tournamentId, playerId) {
      update(tournaments => {
        const updated = tournaments.map(t => {
          if (t.id === tournamentId) {
            return { ...t, playerIds: t.playerIds.filter(id => id !== playerId) };
          }
          return t;
        });
        persist(updated);
        return updated;
      });
    },
    setStatus(id, status) {
      update(tournaments => {
        const updated = tournaments.map(t => t.id === id ? { ...t, status } : t);
        persist(updated);
        return updated;
      });
    }
  };
}

export const tournaments = createTournamentsStore();
