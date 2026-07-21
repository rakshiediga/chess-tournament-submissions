import { writable } from 'svelte/store';

const STORAGE_KEY = 'chess_players';

function loadFromStorage() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function createPlayersStore() {
  const { subscribe, set, update } = writable(loadFromStorage());

  function persist(players) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
  }

  return {
    subscribe,
    add(player) {
      update(players => {
        const newPlayer = {
          id: crypto.randomUUID(),
          name: player.name,
          rating: player.rating || 1200,
          country: player.country || '',
          club: player.club || '',
          createdAt: new Date().toISOString()
        };
        const updated = [...players, newPlayer];
        persist(updated);
        return updated;
      });
    },
    update(id, changes) {
      update(players => {
        const updated = players.map(p => p.id === id ? { ...p, ...changes } : p);
        persist(updated);
        return updated;
      });
    },
    remove(id) {
      update(players => {
        const updated = players.filter(p => p.id !== id);
        persist(updated);
        return updated;
      });
    },
    reset() {
      set([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };
}

export const players = createPlayersStore();
