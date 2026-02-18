import {
  ELO_K_FACTOR_NEW,
  ELO_K_FACTOR_REGULAR,
  ELO_NEW_PLAYER_THRESHOLD,
  ELO_MIN,
  ELO_MAX,
  DEFAULT_ELO,
  DEFAULT_BASE_SKILL,
} from '../constants/config';

/**
 * Normalize base skill (0-100) to 0-1 range
 */
export function normalizeBaseSkill(baseSkill, min = 0, max = 100) {
  const normalized = (baseSkill - min) / (max - min);
  return Math.max(0, Math.min(1, normalized));
}

/**
 * Normalize ELO rating to 0-1 range
 */
export function normalizeElo(elo, min = ELO_MIN, max = ELO_MAX) {
  const normalized = (elo - min) / (max - min);
  return Math.max(0, Math.min(1, normalized));
}

/**
 * Calculate weights for base skill vs ELO based on games played
 * New players rely more on base skill, experienced players on ELO
 */
export function calculateWeights(gamesPlayed) {
  // Start with 10% ELO weight, increase to 90% by ~30 games
  const eloWeight = Math.min(0.9, 0.1 + gamesPlayed / 30);
  const baseWeight = 1 - eloWeight;
  return { baseWeight, eloWeight };
}

/**
 * Calculate composite skill score combining base skill and ELO
 * Returns a value between 0 and 1
 */
export function calculateCompositeSkill(player) {
  const baseSkill = player.baseSkill !== undefined ? player.baseSkill : DEFAULT_BASE_SKILL;
  const elo = player.elo !== undefined ? player.elo : DEFAULT_ELO;
  const gamesPlayed = player.gamesPlayed || 0;

  const normalizedBase = normalizeBaseSkill(baseSkill);
  const normalizedElo = normalizeElo(elo);
  const { baseWeight, eloWeight } = calculateWeights(gamesPlayed);

  return baseWeight * normalizedBase + eloWeight * normalizedElo;
}

/**
 * Calculate expected score for a player/team in a match
 * Based on ELO ratings
 */
export function calculateExpectedScore(eloA, eloB) {
  return 1 / (1 + Math.pow(10, (eloB - eloA) / 400));
}

/**
 * Update ELO rating after a match
 */
export function updateEloRating(currentElo, actualScore, expectedScore, gamesPlayed) {
  const kFactor = gamesPlayed < ELO_NEW_PLAYER_THRESHOLD 
    ? ELO_K_FACTOR_NEW 
    : ELO_K_FACTOR_REGULAR;
  
  return currentElo + kFactor * (actualScore - expectedScore);
}

/**
 * Update ELO ratings for all players in a match
 * Returns a map of playerId -> updated player data
 */
export function updateMatchRatings(players, teamAIds, teamBIds, teamAWon) {
  const playersMap = {};
  players.forEach(p => playersMap[p.id] = p);

  const teamA = Array.from(teamAIds)
    .map(id => playersMap[id])
    .filter(Boolean);
  
  const teamB = Array.from(teamBIds)
    .map(id => playersMap[id])
    .filter(Boolean);

  if (teamA.length === 0 || teamB.length === 0) {
    return {};
  }

  // Calculate average ELO for each team
  const avgEloA = teamA.reduce(
    (sum, p) => sum + (p.elo || DEFAULT_ELO), 
    0
  ) / teamA.length;
  
  const avgEloB = teamB.reduce(
    (sum, p) => sum + (p.elo || DEFAULT_ELO), 
    0
  ) / teamB.length;

  // Calculate expected scores
  const expectedA = calculateExpectedScore(avgEloA, avgEloB);
  const expectedB = 1 - expectedA;

  // Actual scores (1 for win, 0 for loss)
  const actualA = teamAWon ? 1 : 0;
  const actualB = 1 - actualA;

  // Update ratings for all players
  const updatedPlayers = {};

  for (const player of teamA) {
    const newElo = updateEloRating(
      player.elo || DEFAULT_ELO,
      actualA,
      expectedA,
      player.gamesPlayed || 0
    );
    updatedPlayers[player.id] = {
      ...player,
      elo: newElo,
      gamesPlayed: (player.gamesPlayed || 0) + 1,
      winCount: (player.winCount || 0) + (teamAWon ? 1 : 0),
    };
  }

  for (const player of teamB) {
    const newElo = updateEloRating(
      player.elo || DEFAULT_ELO,
      actualB,
      expectedB,
      player.gamesPlayed || 0
    );
    updatedPlayers[player.id] = {
      ...player,
      elo: newElo,
      gamesPlayed: (player.gamesPlayed || 0) + 1,
      winCount: (player.winCount || 0) + (teamAWon ? 0 : 1),
    };
  }

  return updatedPlayers;
}

/**
 * Calculate win rate percentage
 */
export function calculateWinRate(player) {
  if (!player.gamesPlayed || player.gamesPlayed === 0) {
    return 0;
  }
  return ((player.winCount || 0) / player.gamesPlayed * 100).toFixed(1);
}
