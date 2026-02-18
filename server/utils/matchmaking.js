import { calculateCompositeSkill, calculateTeamBalance } from './eloCalculations.js';

/**
 * Sort players by play count (queue order - least played first)
 * @param {Array<Object>} players - Array of player objects
 * @returns {Array<Object>} Sorted players
 */
export function sortByPlayCount(players) {
  return [...players].sort((a, b) => {
    // Primary: play count (ascending)
    if (a.playCount !== b.playCount) {
      return a.playCount - b.playCount;
    }
    
    // Secondary: consecutive games (ascending - prioritize rested players)
    if (a.consecutiveGames !== b.consecutiveGames) {
      return a.consecutiveGames - b.consecutiveGames;
    }
    
    // Tertiary: composite skill (descending - higher skill first among tied)
    return calculateCompositeSkill(b) - calculateCompositeSkill(a);
  });
}

/**
 * Sort players by ELO rating (leaderboard order - highest first)
 * @param {Array<Object>} players - Array of player objects
 * @returns {Array<Object>} Sorted players
 */
export function sortByElo(players) {
  return [...players].sort((a, b) => {
    // Primary: ELO (descending)
    if (a.elo !== b.elo) {
      return b.elo - a.elo;
    }
    
    // Secondary: win rate (descending)
    const aWinRate = a.gamesPlayed > 0 ? a.winCount / a.gamesPlayed : 0;
    const bWinRate = b.gamesPlayed > 0 ? b.winCount / b.gamesPlayed : 0;
    
    if (aWinRate !== bWinRate) {
      return bWinRate - aWinRate;
    }
    
    // Tertiary: games played (descending - more experienced first)
    return b.gamesPlayed - a.gamesPlayed;
  });
}

/**
 * Get next players for a match based on queue
 * @param {Array<Object>} players - Array of player objects
 * @param {number} count - Number of players needed
 * @param {Array<string>} excludeIds - Player IDs to exclude (currently playing)
 * @returns {Array<Object>} Selected players
 */
export function getNextPlayers(players, count, excludeIds = []) {
  const available = players.filter(p => !excludeIds.includes(p._id.toString()));
  const sorted = sortByPlayCount(available);
  return sorted.slice(0, count);
}

/**
 * Generate matches for rotation mode
 * @param {Array<Object>} players - Array of player objects
 * @param {number} numCourts - Number of courts
 * @param {Array<string>} currentPlayerIds - IDs of currently playing players
 * @returns {Array<Object>} Array of matches { court, team1, team2 }
 */
export function generateRotationMatches(players, numCourts, currentPlayerIds = []) {
  const playersPerCourt = 4;
  const totalPlayersNeeded = numCourts * playersPerCourt;
  
  const matches = [];
  const usedPlayerIds = [...currentPlayerIds];
  
  for (let courtIndex = 0; courtIndex < numCourts; courtIndex++) {
    const nextPlayers = getNextPlayers(players, playersPerCourt, usedPlayerIds);
    
    if (nextPlayers.length < playersPerCourt) {
      break; // Not enough players for this court
    }
    
    // Generate fair teams
    const { team1, team2 } = generateBalancedTeams(nextPlayers);
    
    matches.push({
      court: courtIndex + 1,
      team1,
      team2
    });
    
    // Add these players to used list
    usedPlayerIds.push(...nextPlayers.map(p => p._id.toString()));
  }
  
  return matches;
}

/**
 * Generate balanced teams from players
 * @param {Array<Object>} players - Array of exactly 4 players
 * @returns {Object} { team1, team2 }
 */
export function generateBalancedTeams(players) {
  if (players.length !== 4) {
    throw new Error('Need exactly 4 players for doubles');
  }
  
  // Calculate composite skill for all
  const playersWithSkill = players.map(p => ({
    ...p,
    compositeSkill: calculateCompositeSkill(p)
  }));
  
  // Sort by skill
  playersWithSkill.sort((a, b) => b.compositeSkill - a.compositeSkill);
  
  // Try all possible team combinations
  const combinations = [
    // [0,1] vs [2,3]
    { team1: [playersWithSkill[0], playersWithSkill[1]], team2: [playersWithSkill[2], playersWithSkill[3]] },
    // [0,2] vs [1,3]
    { team1: [playersWithSkill[0], playersWithSkill[2]], team2: [playersWithSkill[1], playersWithSkill[3]] },
    // [0,3] vs [1,2]
    { team1: [playersWithSkill[0], playersWithSkill[3]], team2: [playersWithSkill[1], playersWithSkill[2]] }
  ];
  
  // Find most balanced combination
  let bestCombination = combinations[0];
  let bestBalance = calculateTeamBalance(combinations[0].team1, combinations[0].team2);
  
  for (let i = 1; i < combinations.length; i++) {
    const balance = calculateTeamBalance(combinations[i].team1, combinations[i].team2);
    if (balance < bestBalance) {
      bestBalance = balance;
      bestCombination = combinations[i];
    }
  }
  
  return bestCombination;
}

/**
 * Update player rest tracking after a match
 * @param {Array<Object>} playedPlayers - Players who just played
 * @param {Array<Object>} allPlayers - All players in the group
 * @returns {Array<Object>} Updated play count information
 */
export function updateRestTracking(playedPlayers, allPlayers) {
  const playedIds = playedPlayers.map(p => p._id.toString());
  const updates = [];
  
  allPlayers.forEach(player => {
    const playerId = player._id.toString();
    
    if (playedIds.includes(playerId)) {
      // Player just played - increment counters
      updates.push({
        playerId,
        playCount: player.playCount + 1,
        consecutiveGames: player.consecutiveGames + 1,
        lastRestTime: null
      });
    } else if (player.consecutiveGames > 0) {
      // Player is resting - reset consecutive counter
      updates.push({
        playerId,
        playCount: player.playCount,
        consecutiveGames: 0,
        lastRestTime: new Date()
      });
    }
  });
  
  return updates;
}

/**
 * Calculate if a player should be prioritized for rest
 * @param {Object} player - Player object
 * @param {number} restThreshold - Number of consecutive games before rest (default 3)
 * @returns {boolean} True if player should rest
 */
export function shouldRest(player, restThreshold = 3) {
  return player.consecutiveGames >= restThreshold;
}

/**
 * Filter players who need rest
 * @param {Array<Object>} players - Array of player objects
 * @param {number} restThreshold - Number of consecutive games before rest
 * @returns {Object} { needsRest, available }
 */
export function filterByRestNeeds(players, restThreshold = 3) {
  const needsRest = [];
  const available = [];
  
  players.forEach(player => {
    if (shouldRest(player, restThreshold)) {
      needsRest.push(player);
    } else {
      available.push(player);
    }
  });
  
  return { needsRest, available };
}

/**
 * Generate fair matchups considering rest
 * @param {Array<Object>} players - Array of player objects
 * @param {number} numCourts - Number of courts
 * @param {Object} options - Options { restThreshold, excludeIds }
 * @returns {Array<Object>} Array of matches
 */
export function generateFairMatchups(players, numCourts, options = {}) {
  const { restThreshold = 3, excludeIds = [] } = options;
  
  // Filter out excluded and players needing rest
  const { available } = filterByRestNeeds(
    players.filter(p => !excludeIds.includes(p._id.toString())),
    restThreshold
  );
  
  // Generate matches from available players
  return generateRotationMatches(available, numCourts, excludeIds);
}

export default {
  sortByPlayCount,
  sortByElo,
  getNextPlayers,
  generateRotationMatches,
  generateBalancedTeams,
  updateRestTracking,
  shouldRest,
  filterByRestNeeds,
  generateFairMatchups
};
