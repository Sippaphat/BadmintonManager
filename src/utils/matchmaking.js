import { calculateCompositeSkill } from './eloSystem';
import { PLAYERS_PER_COURT } from '../constants/config';

/**
 * Get available players (not currently playing and not resting voluntarily)
 */
export function getAvailablePlayers(players) {
  return players.filter(p => !p.isPlaying && !p.isResting);
}

/**
 * Rule 3: Select players for the round. 
 * Choose players with the highest rest counter and the lowest total games played.
 */
export function getPlayerQueue(players) {
  return [...players].sort((a, b) => {
    // 1. Highest rest counter first
    const restDiff = (b.restCounter || 0) - (a.restCounter || 0);
    if (restDiff !== 0) return restDiff;

    // 2. Lowest total games played first
    const gamesDiff = (a.gamesPlayed || 0) - (b.gamesPlayed || 0);
    if (gamesDiff !== 0) return gamesDiff;

    // 3. Fallback: lowest playCount
    const playDiff = (a.playCount || 0) - (b.playCount || 0);
    if (playDiff !== 0) return playDiff;

    // 4. Fallback: longest wait time
    return (a.lastFinishTime || 0) - (b.lastFinishTime || 0);
  });
}

/**
 * Rule 9 & 10: Apply pairing penalty and force rotation.
 * Checks if two players have a pairing penalty. Returns true if they are penalized.
 */
function hasPairingPenalty(player1, player2, allPlayersCount) {
  const p1History = player1.partnerHistory || [];
  const p2History = player2.partnerHistory || [];

  // If they are in each other's history, they have a penalty
  const penalized = p1History.includes(player2._id || player2.id) || p2History.includes(player1._id || player1.id);

  // Rule 10: Remove the pairing penalty only after those two players team up with every other person.
  // We trigger the clear on the backend, so here we just check if it exists.
  return penalized;
}

/**
 * Rule 5 & 6: Sort by Elo and build teams [1, 4] vs [2, 3]
 * with Pairing Penalty check.
 */
function generateDoublesMatchup(available) {
  if (available.length < 4) return null;

  const sortedQueue = getPlayerQueue(available);

  // We need to pick 4 players that don't violate the pairing penalty when grouped as [Highest + Lowest, Next + Next]
  // Because the queue might dictate top 4, but if putting the highest and lowest together violates a penalty we might need to swap the lowest with the next person in queue.
  let selectedPlayers = null;
  let team1 = null;
  let team2 = null;

  // Find the first valid group of 4 players
  // Start with top 4 in queue. If they fail the pairing penalty, we try swapping the 4th, 3rd, 2nd, 1st players with others down the line.
  // For simplicity, we try the greedy approach: take top 4. check pairing. If invalid, swap out the lowest Elo player for the 5th in queue, etc.

  for (let i = 0; i < sortedQueue.length - 3; i++) {
    for (let j = i + 1; j < sortedQueue.length - 2; j++) {
      for (let k = j + 1; k < sortedQueue.length - 1; k++) {
        for (let l = k + 1; l < sortedQueue.length; l++) {

          let candidateGroup = [sortedQueue[i], sortedQueue[j], sortedQueue[k], sortedQueue[l]];

          // Rule 5: Sort the selected players by their Elo rating.
          candidateGroup.sort((a, b) => (b.elo || 1500) - (a.elo || 1500));

          // Rule 6: pair the highest rated player (0) with the lowest rated player (3).
          // Pair the next highest player (1) with the next lowest player (2).
          const candidateTeam1 = [candidateGroup[0], candidateGroup[3]];
          const candidateTeam2 = [candidateGroup[1], candidateGroup[2]];

          // Check penalties
          const team1Penalized = hasPairingPenalty(candidateTeam1[0], candidateTeam1[1], available.length);
          const team2Penalized = hasPairingPenalty(candidateTeam2[0], candidateTeam2[1], available.length);

          if (!team1Penalized && !team2Penalized) {
            team1 = candidateTeam1;
            team2 = candidateTeam2;
            selectedPlayers = candidateGroup;
            break;
          }
        }
        if (selectedPlayers) break;
      }
      if (selectedPlayers) break;
    }
    if (selectedPlayers) break;
  }

  // Fallback: If ALL combinations of 4 players have penalties (or we couldn't find a valid team), 
  // just ignore the penalty for the top 4 in queue.
  if (!selectedPlayers) {
    const top4 = sortedQueue.slice(0, 4);
    top4.sort((a, b) => (b.elo || 1500) - (a.elo || 1500));
    team1 = [top4[0], top4[3]];
    team2 = [top4[1], top4[2]];
  }

  return { team1, team2 };
}

function generateSinglesMatchup(available) {
  if (available.length < 2) return null;

  const sortedQueue = getPlayerQueue(available);

  // For singles, simply take top 2 in queue, ignore pairing penalty (it's 1v1)
  const top2 = sortedQueue.slice(0, 2);
  top2.sort((a, b) => (b.elo || 1500) - (a.elo || 1500));

  return {
    team1: [top2[0]],
    team2: [top2[1]],
  };
}

/**
 * Generate a fair matchup based on game mode
 */
export function generateFairMatchup(players, gameMode) {
  const available = getAvailablePlayers(players);
  const requiredPlayers = PLAYERS_PER_COURT[gameMode];

  if (available.length < requiredPlayers) {
    return null;
  }

  if (gameMode === 'singles') {
    return generateSinglesMatchup(available);
  } else {
    return generateDoublesMatchup(available);
  }
}

export function hasEnoughPlayers(players, gameMode, existingCourts = []) {
  const available = getAvailablePlayers(players);
  const requiredPlayers = PLAYERS_PER_COURT[gameMode];
  return available.length >= requiredPlayers;
}
