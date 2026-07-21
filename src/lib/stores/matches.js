import { writable } from 'svelte/store';

const STORAGE_KEY = 'chess_matches';

function loadFromStorage() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function createMatchesStore() {
  const { subscribe, set, update } = writable(loadFromStorage());

  function persist(matches) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(matches));
  }

  return {
    subscribe,
    setRounds(tournamentId, rounds) {
      update(matches => {
        const updated = { ...matches, [tournamentId]: rounds };
        persist(updated);
        return updated;
      });
    },
    updateMatch(tournamentId, roundIndex, matchIndex, changes) {
      update(matches => {
        const rounds = matches[tournamentId] ? [...matches[tournamentId]] : [];
        if (rounds[roundIndex]) {
          const round = [...rounds[roundIndex]];
          round[matchIndex] = { ...round[matchIndex], ...changes };
          rounds[roundIndex] = round;
        }
        const updated = { ...matches, [tournamentId]: rounds };
        persist(updated);
        return updated;
      });
    },
    clearTournament(tournamentId) {
      update(matches => {
        const updated = { ...matches };
        delete updated[tournamentId];
        persist(updated);
        return updated;
      });
    },
    getTournamentMatches(tournamentId) {
      let result = [];
      const unsubscribe = this.subscribe(matches => {
        result = matches[tournamentId] || [];
      });
      unsubscribe();
      return result;
    }
  };
}

export const matches = createMatchesStore();
