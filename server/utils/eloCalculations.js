/**
 * ELO calculation utilities for badminton matchmaking
 */

const DEFAULT_K_FACTOR = 32;
const MIN_ELO = 800;
const MAX_ELO = 2800;

/**
 * Calculate expected score for a player
 * @param {number} playerElo - Player's ELO rating
 * @param {number} opponentElo - Opponent's ELO rating
 * @returns {number} Expected score (0-1)
 */
export function calculateExpectedScore(playerElo, opponentElo) {
  return 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
}

/**
 * Calculate team average ELO
 * @param {Array<Object>} players - Array of player objects with elo property
 * @returns {number} Average ELO
 */
export function calculateTeamElo(players) {
  if (!players || players.length === 0) return 1500;
  const sum = players.reduce((acc, player) => acc + (player.elo || 1500), 0);
  return sum / players.length;
}

/**
 * Calculate ELO change for a match
 * @param {number} currentElo - Current ELO rating
 * @param {number} expectedScore - Expected score (0-1)
 * @param {number} actualScore - Actual score (0=loss, 0.5=draw, 1=win)
 * @param {number} kFactor - K-factor (default 32)
 * @returns {number} ELO change (can be negative)
 */
export function calculateEloChange(currentElo, expectedScore, actualScore, kFactor = DEFAULT_K_FACTOR) {
  return Math.round(kFactor * (actualScore - expectedScore));
}

/**
 * Update ELO rating
 * @param {number} currentElo - Current ELO rating
 * @param {number} eloChange - ELO change from match
 * @returns {number} New ELO rating (clamped to MIN_ELO and MAX_ELO)
 */
export function updateElo(currentElo, eloChange) {
  const newElo = currentElo + eloChange;
  return Math.max(MIN_ELO, Math.min(MAX_ELO, Math.round(newElo)));
}

/**
 * Calculate composite skill considering both base skill and ELO
 * @param {Object} player - Player object with baseSkill, elo, and gamesPlayed
 * @returns {number} Composite skill rating
 */
export function calculateCompositeSkill(player) {
  const { baseSkill = 50, elo = 1500, gamesPlayed = 0 } = player;
  
  // Convert base skill (0-100) to ELO-like scale
  const baseSkillElo = 1500 + ((baseSkill - 50) / 50) * 400;
  
  // Weight calculation: more games = more weight on ELO
  // 0 games: 100% base skill
  // 5 games: 50% base skill, 50% ELO
  // 10+ games: 20% base skill, 80% ELO
  const experienceFactor = Math.min(gamesPlayed / 10, 1);
  const baseWeight = 1 - (0.8 * experienceFactor);
  const eloWeight = 0.8 * experienceFactor;
  
  const compositeSkill = baseSkillElo * baseWeight + elo * eloWeight;
  
  return Math.round(compositeSkill);
}

/**
 * Calculate ELO updates for all players in a match
 * @param {Array<Object>} team1 - Team 1 players (winners)
 * @param {Array<Object>} team2 - Team 2 players (losers)
 * @param {number} kFactor - K-factor for ELO calculation
 * @returns {Object} ELO updates for all players { playerId: { oldElo, newElo, change } }
 */
export function calculateMatchEloUpdates(team1, team2, kFactor = DEFAULT_K_FACTOR) {
  const team1Elo = calculateTeamElo(team1);
  const team2Elo = calculateTeamElo(team2);
  
  const updates = {};
  
  // Calculate updates for team1 (winners)
  team1.forEach(player => {
    const expectedScore = calculateExpectedScore(player.elo, team2Elo);
    const eloChange = calculateEloChange(player.elo, expectedScore, 1, kFactor);
    const newElo = updateElo(player.elo, eloChange);
    
    updates[player._id.toString()] = {
      oldElo: player.elo,
      newElo,
      change: eloChange
    };
  });
  
  // Calculate updates for team2 (losers)
  team2.forEach(player => {
    const expectedScore = calculateExpectedScore(player.elo, team1Elo);
    const eloChange = calculateEloChange(player.elo, expectedScore, 0, kFactor);
    const newElo = updateElo(player.elo, eloChange);
    
    updates[player._id.toString()] = {
      oldElo: player.elo,
      newElo,
      change: eloChange
    };
  });
  
  return updates;
}

/**
 * Calculate team balance score (lower is better)
 * @param {Array<Object>} team1 - Team 1 players
 * @param {Array<Object>} team2 - Team 2 players
 * @returns {number} Balance score
 */
export function calculateTeamBalance(team1, team2) {
  const team1Skill = team1.reduce((sum, p) => sum + calculateCompositeSkill(p), 0);
  const team2Skill = team2.reduce((sum, p) => sum + calculateCompositeSkill(p), 0);
  
  return Math.abs(team1Skill - team2Skill);
}

/**
 * Generate fair teams from a list of players
 * @param {Array<Object>} players - Array of player objects
 * @param {number} teamSize - Size of each team (default 2)
 * @returns {Object} { team1, team2, balance }
 */
export function generateFairTeams(players, teamSize = 2) {
  if (players.length !== teamSize * 2) {
    throw new Error(`Need exactly ${teamSize * 2} players, got ${players.length}`);
  }
  
  // Calculate composite skill for all players
  const playersWithSkill = players.map(p => ({
    ...p,
    compositeSkill: calculateCompositeSkill(p)
  }));
  
  // Sort by composite skill
  playersWithSkill.sort((a, b) => b.compositeSkill - a.compositeSkill);
  
  // Try all possible combinations and find the most balanced
  const combinations = generateCombinations(playersWithSkill, teamSize);
  let bestCombination = null;
  let bestBalance = Infinity;
  
  for (const team1 of combinations) {
    const team2 = playersWithSkill.filter(p => !team1.includes(p));
    const balance = calculateTeamBalance(team1, team2);
    
    if (balance < bestBalance) {
      bestBalance = balance;
      bestCombination = { team1, team2 };
    }
  }
  
  return {
    team1: bestCombination.team1,
    team2: bestCombination.team2,
    balance: bestBalance
  };
}

/**
 * Generate all combinations of k elements from array
 * @param {Array} arr - Array of elements
 * @param {number} k - Number of elements to choose
 * @returns {Array<Array>} Array of combinations
 */
function generateCombinations(arr, k) {
  const result = [];
  
  function combine(start, combo) {
    if (combo.length === k) {
      result.push([...combo]);
      return;
    }
    
    for (let i = start; i < arr.length; i++) {
      combo.push(arr[i]);
      combine(i + 1, combo);
      combo.pop();
    }
  }
  
  combine(0, []);
  return result;
}

export default {
  calculateExpectedScore,
  calculateTeamElo,
  calculateEloChange,
  updateElo,
  calculateCompositeSkill,
  calculateMatchEloUpdates,
  calculateTeamBalance,
  generateFairTeams
};
