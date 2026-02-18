import { calculateCompositeSkill } from './eloSystem';
import { PLAYERS_PER_COURT } from '../constants/config';

/**
 * Get available players (not currently playing and not resting)
 */
export function getAvailablePlayers(players) {
  return players.filter(p => !p.isPlaying && !p.isResting);
}

/**
 * Get players sorted by play count (ascending) for queue
 */
export function getPlayerQueue(players) {
  return [...players].sort((a, b) => {
    const playDiff = (a.playCount || 0) - (b.playCount || 0);
    if (playDiff !== 0) return playDiff;
    
    // If play count is equal, prioritize by rest time (last finished time)
    return (a.lastFinishTime || 0) - (b.lastFinishTime || 0);
  });
}

/**
 * Calculate team balance score (lower is better balanced)
 */
function calculateTeamBalance(team1, team2) {
  const skill1 = team1.reduce((sum, p) => sum + calculateCompositeSkill(p), 0);
  const skill2 = team2.reduce((sum, p) => sum + calculateCompositeSkill(p), 0);
  return Math.abs(skill1 - skill2);
}

/**
 * Generate all possible team combinations for doubles (2v2)
 */
function generateDoublesTeamCombinations(players) {
  const combinations = [];
  const n = players.length;

  // Generate all combinations of 2 players for team 1
  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      const team1 = [players[i], players[j]];
      const remaining = players.filter((_, idx) => idx !== i && idx !== j);
      
      // Generate all combinations of 2 players for team 2 from remaining
      for (let k = 0; k < remaining.length - 1; k++) {
        for (let l = k + 1; l < remaining.length; l++) {
          const team2 = [remaining[k], remaining[l]];
          combinations.push({ team1, team2 });
        }
      }
    }
  }

  return combinations;
}

/**
 * Generate matchup for singles (1v1)
 */
function generateSinglesMatchup(players) {
  if (players.length < 2) return null;

  // For singles, just pair the first two players in queue
  // or use skill-based matchmaking
  const sortedByQueue = getPlayerQueue(players);
  
  return {
    team1: [sortedByQueue[0]],
    team2: [sortedByQueue[1]],
  };
}

/**
 * Generate fair matchup for doubles (2v2) using balanced matchmaking
 */
function generateDoublesMatchup(players) {
  if (players.length < 4) return null;

  const sortedByQueue = getPlayerQueue(players);
  const topPlayers = sortedByQueue.slice(0, 4);

  // Generate all possible team combinations
  const combinations = generateDoublesTeamCombinations(topPlayers);

  // Find the most balanced combination
  let bestMatchup = null;
  let bestBalance = Infinity;

  for (const combo of combinations) {
    const balance = calculateTeamBalance(combo.team1, combo.team2);
    if (balance < bestBalance) {
      bestBalance = balance;
      bestMatchup = combo;
    }
  }

  return bestMatchup;
}

/**
 * Generate a fair matchup based on game mode
 * Considers play count, skill level, and rest time
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

/**
 * Check if there are enough players to start a match
 */
export function hasEnoughPlayers(players, gameMode, existingCourts = []) {
  const available = getAvailablePlayers(players);
  const requiredPlayers = PLAYERS_PER_COURT[gameMode];
  
  return available.length >= requiredPlayers;
}

/**
 * Calculate average skill level for a team
 */
export function calculateTeamAverageSkill(team) {
  if (!team || team.length === 0) return 0;
  const totalSkill = team.reduce((sum, p) => sum + calculateCompositeSkill(p), 0);
  return totalSkill / team.length;
}

/**
 * Validate matchup fairness
 * Returns true if teams are reasonably balanced
 */
export function isMatchupFair(team1, team2, threshold = 0.15) {
  const skill1 = calculateTeamAverageSkill(team1);
  const skill2 = calculateTeamAverageSkill(team2);
  const difference = Math.abs(skill1 - skill2);
  
  // Teams should be within threshold of each other
  return difference <= threshold;
}

/**
 * Get rest priority score (higher means more deserving of rest)
 * Based on consecutive games played without rest
 */
export function getRestPriority(player) {
  const consecutiveGames = player.consecutiveGames || 0;
  const lastRestTime = player.lastRestTime || 0;
  
  // Players who played many consecutive games get higher priority
  return consecutiveGames * 1000 + (Date.now() - lastRestTime);
}

/**
 * Determine who should rest (if applicable)
 * Returns players who have played the most consecutive games
 */
export function getPlayersNeedingRest(players, minConsecutiveGames = 3) {
  return players
    .filter(p => (p.consecutiveGames || 0) >= minConsecutiveGames)
    .sort((a, b) => getRestPriority(b) - getRestPriority(a));
}
