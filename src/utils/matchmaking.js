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
 * Choose players with the highest rest counter, then effectivePlayCount (dayPlayCount + dayPlayOffset).
 * A negative dayPlayOffset gives players who missed games a head start on a new day.
 */
export function getPlayerQueue(players) {
  return [...players].sort((a, b) => {
    // 1. Highest rest counter first
    const restDiff = (b.restCounter || 0) - (a.restCounter || 0);
    if (restDiff !== 0) return restDiff;

    // 2. Lowest effective day play count first (dayPlayCount + dayPlayOffset)
    const aEffective = (a.dayPlayCount || 0) + (a.dayPlayOffset || 0);
    const bEffective = (b.dayPlayCount || 0) + (b.dayPlayOffset || 0);
    const effectiveDiff = aEffective - bEffective;
    if (effectiveDiff !== 0) return effectiveDiff;

    // 3. Fallback: lowest total games played overall
    const gamesDiff = (a.gamesPlayed || 0) - (b.gamesPlayed || 0);
    if (gamesDiff !== 0) return gamesDiff;

    // 4. Fallback: lowest playCount
    const playDiff = (a.playCount || 0) - (b.playCount || 0);
    if (playDiff !== 0) return playDiff;

    // 5. Fallback: longest wait time
    return (a.lastFinishTime || 0) - (b.lastFinishTime || 0);
  });
}

/**
 * Generate a canonical pair key for a session pair set.
 * Always sorts IDs so (A,B) === (B,A).
 */
export function pairKey(id1, id2) {
  const a = (id1 || '').toString();
  const b = (id2 || '').toString();
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

/**
 * Rule 1 (Highest Priority): Block pairs that already played together in this session.
 * Rule 9 & 10: Apply persistent pairing penalty (partnerHistory).
 * Returns true if two players should NOT be paired.
 * @param {Object} player1
 * @param {Object} player2
 * @param {Set<string>} sessionPairsSet - Pairs already used in this session
 */
function hasPairingPenalty(player1, player2, sessionPairsSet) {
  const id1 = (player1._id || player1.id || '').toString();
  const id2 = (player2._id || player2.id || '').toString();

  // Rule 1 (Highest Priority): Block same pair from current session
  if (sessionPairsSet && sessionPairsSet.size > 0) {
    const key = pairKey(id1, id2);
    if (sessionPairsSet.has(key)) return true;
  }

  // Rule 9 & 10: Partner history penalty (persistent across sessions)
  const p1History = player1.partnerHistory || [];
  const p2History = player2.partnerHistory || [];
  return p1History.includes(id2) || p2History.includes(id1);
}

/**
 * Rule 5 & 6: Sort by Elo and build teams [1, 4] vs [2, 3]
 * with Pairing Penalty + Session pair block.
 * @param {Array} available
 * @param {Set<string>} sessionPairsSet
 */
function generateDoublesMatchup(available, sessionPairsSet) {
  if (available.length < 4) return null;

  const sortedQueue = getPlayerQueue(available);

  let selectedPlayers = null;
  let team1 = null;
  let team2 = null;

  for (let i = 0; i < sortedQueue.length - 3; i++) {
    for (let j = i + 1; j < sortedQueue.length - 2; j++) {
      for (let k = j + 1; k < sortedQueue.length - 1; k++) {
        for (let l = k + 1; l < sortedQueue.length; l++) {

          let candidateGroup = [sortedQueue[i], sortedQueue[j], sortedQueue[k], sortedQueue[l]];

          // Rule 5: Sort the selected players by their Elo rating.
          candidateGroup.sort((a, b) => (b.elo || 1500) - (a.elo || 1500));

          // Rule 6: pair highest (0) with lowest (3); next highest (1) with next (2).
          const candidateTeam1 = [candidateGroup[0], candidateGroup[3]];
          const candidateTeam2 = [candidateGroup[1], candidateGroup[2]];

          // Check penalties (session block has highest priority inside hasPairingPenalty)
          const team1Penalized = hasPairingPenalty(candidateTeam1[0], candidateTeam1[1], sessionPairsSet);
          const team2Penalized = hasPairingPenalty(candidateTeam2[0], candidateTeam2[1], sessionPairsSet);

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

  // Fallback: If ALL combinations are penalized, ignore penalty for top 4 in queue.
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
  const top2 = sortedQueue.slice(0, 2);
  top2.sort((a, b) => (b.elo || 1500) - (a.elo || 1500));

  return {
    team1: [top2[0]],
    team2: [top2[1]],
  };
}

/**
 * Generate a fair matchup based on game mode.
 * @param {Array} players
 * @param {string} gameMode - 'doubles' | 'singles'
 * @param {Set<string>} sessionPairsSet - Pair keys already used in this session (block same pair)
 */
export function generateFairMatchup(players, gameMode, sessionPairsSet = new Set()) {
  const available = getAvailablePlayers(players);
  const requiredPlayers = PLAYERS_PER_COURT[gameMode];

  if (available.length < requiredPlayers) {
    return null;
  }

  if (gameMode === 'singles') {
    return generateSinglesMatchup(available);
  } else {
    return generateDoublesMatchup(available, sessionPairsSet);
  }
}

export function hasEnoughPlayers(players, gameMode, existingCourts = []) {
  const available = getAvailablePlayers(players);
  const requiredPlayers = PLAYERS_PER_COURT[gameMode];
  return available.length >= requiredPlayers;
}
