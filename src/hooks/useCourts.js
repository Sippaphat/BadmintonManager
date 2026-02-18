import { useState, useCallback, useEffect } from 'react';
import { generateFairMatchup, hasEnoughPlayers } from '../utils/matchmaking';
import { updateMatchRatings } from '../utils/eloSystem';
import { PLAYERS_PER_COURT } from '../constants/config';

/**
 * Hook for managing courts and matches
 */
export function useCourts(numberOfCourts, gameMode, players, updatePlayerStats) {
  const [courts, setCourts] = useState([]);

  // Initialize courts
  useEffect(() => {
    const initialCourts = Array.from({ length: numberOfCourts }, (_, i) => ({
      id: i + 1,
      team1: [],
      team2: [],
      score: { team1: 0, team2: 0 },
      servingPlayer: null,
    }));
    setCourts(initialCourts);
  }, [numberOfCourts]);

  // Assign random match to a court
  const assignRandomMatch = useCallback((courtId) => {
    // If no court specified, find the first empty one
    let targetCourtId = courtId;

    if (!targetCourtId) {
      const emptyCourt = courts.find(c => c.team1.length === 0 && c.team2.length === 0);
      if (emptyCourt) {
        targetCourtId = emptyCourt.id;
      } else {
        // No empty courts available
        return false;
      }
    }

    const matchup = generateFairMatchup(players, gameMode);

    if (!matchup) {
      return false;
    }

    setCourts(prev => prev.map(court => {
      if (court.id === targetCourtId) {
        return {
          ...court,
          team1: matchup.team1,
          team2: matchup.team2,
          score: { team1: 0, team2: 0 },
          servingPlayer: { team: 1, index: 0 }, // Default serve
        };
      }
      return court;
    }));

    // Update players' playing status
    const allPlayerIds = [
      ...matchup.team1.map(p => p.id),
      ...matchup.team2.map(p => p.id),
    ];

    return allPlayerIds;
  }, [courts, players, gameMode]);

  // Manually set court players
  const setCourtPlayers = useCallback((courtId, players) => {
    setCourts(prev => prev.map(court => {
      if (court.id === courtId) {
        const playersPerTeam = PLAYERS_PER_COURT[gameMode] / 2;
        return {
          ...court,
          team1: players.slice(0, playersPerTeam),
          team2: players.slice(playersPerTeam, playersPerTeam * 2),
          score: { team1: 0, team2: 0 },
          servingPlayer: players.length >= playersPerTeam * 2 ? { team: 1, index: 0 } : null,
        };
      }
      return court;
    }));
  }, [gameMode]);

  // Add player to court
  const addPlayerToCourt = useCallback((courtId, player) => {
    let added = false;

    setCourts(prev => prev.map(court => {
      if (court.id === courtId && !added) {
        const maxPerTeam = PLAYERS_PER_COURT[gameMode] / 2;
        const team1Count = court.team1.length;
        const team2Count = court.team2.length;

        if (team1Count < maxPerTeam) {
          added = true;
          return { ...court, team1: [...court.team1, player] };
        } else if (team2Count < maxPerTeam) {
          added = true;
          return { ...court, team2: [...court.team2, player] };
        }
      }
      return court;
    }));

    return added;
  }, [gameMode]);

  // Add player to specific position
  const addPlayerToPosition = useCallback((courtId, teamNum, index, player) => {
    setCourts(prev => prev.map(court => {
      if (court.id === courtId) {
        const teamKey = teamNum === 1 ? 'team1' : 'team2';
        const newTeam = [...court[teamKey]];
        newTeam[index] = player;

        return { ...court, [teamKey]: newTeam };
      }
      return court;
    }));
  }, []);

  // Remove player from court
  const removePlayerFromCourt = useCallback((courtId, playerId) => {
    setCourts(prev => prev.map(court => {
      if (court.id === courtId) {
        return {
          ...court,
          team1: court.team1.filter(p => p.id !== playerId),
          team2: court.team2.filter(p => p.id !== playerId),
        };
      }
      return court;
    }));
  }, []);

  // Update score
  const updateScore = useCallback((courtId, team, increment = true) => {
    setCourts(prev => prev.map(court => {
      if (court.id === courtId) {
        const newScore = { ...court.score };
        if (increment) {
          newScore[`team${team}`] = Math.max(0, newScore[`team${team}`] + 1);
        } else {
          newScore[`team${team}`] = Math.max(0, newScore[`team${team}`] - 1);
        }
        return { ...court, score: newScore };
      }
      return court;
    }));
  }, []);

  // Switch serve
  const switchServe = useCallback((courtId) => {
    setCourts(prev => prev.map(court => {
      if (court.id === courtId && court.servingPlayer) {
        const { team, index } = court.servingPlayer;
        const currentTeam = team === 1 ? court.team1 : court.team2;

        // Switch to next player in same team, or switch team
        let newTeam = team;
        let newIndex = index + 1;

        if (newIndex >= currentTeam.length) {
          newTeam = team === 1 ? 2 : 1;
          newIndex = 0;
        }

        return {
          ...court,
          servingPlayer: { team: newTeam, index: newIndex },
        };
      }
      return court;
    }));
  }, []);

  // Set specific player as server
  const setServingPlayer = useCallback((courtId, team, playerIndex) => {
    setCourts(prev => prev.map(court => {
      if (court.id === courtId) {
        return {
          ...court,
          servingPlayer: { team, index: playerIndex },
        };
      }
      return court;
    }));
  }, []);

  // Reset score
  const resetScore = useCallback((courtId) => {
    setCourts(prev => prev.map(court => {
      if (court.id === courtId) {
        return {
          ...court,
          score: { team1: 0, team2: 0 },
        };
      }
      return court;
    }));
  }, []);

  // Finish match
  const finishMatch = useCallback(async (courtId, winnerTeam) => {
    const court = courts.find(c => c.id === courtId);
    if (!court) return null;

    const team1Ids = court.team1.map(p => p.id);
    const team2Ids = court.team2.map(p => p.id);
    const team1Won = winnerTeam === 1;

    // Update ELO ratings
    const updatedRatings = updateMatchRatings(players, team1Ids, team2Ids, team1Won);

    // Update player stats in backend
    for (const [playerId, playerData] of Object.entries(updatedRatings)) {
      await updatePlayerStats(playerId, {
        elo: playerData.elo,
        gamesPlayed: playerData.gamesPlayed,
        winCount: playerData.winCount,
        playCount: playerData.gamesPlayed, // Sync playCount with gamesPlayed
      });
    }

    // Clear court
    setCourts(prev => prev.map(court => {
      if (court.id === courtId) {
        return {
          ...court,
          team1: [],
          team2: [],
          score: { team1: 0, team2: 0 },
          servingPlayer: null,
        };
      }
      return court;
    }));

    return {
      court,
      winnerTeam,
      updatedRatings: Object.keys(updatedRatings),
    };
  }, [courts, players, updatePlayerStats]);

  // Clear all courts
  const clearAllCourts = useCallback(() => {
    setCourts(prev => prev.map(court => ({
      ...court,
      team1: [],
      team2: [],
      score: { team1: 0, team2: 0 },
      servingPlayer: null,
    })));
  }, []);

  return {
    courts,
    assignRandomMatch,
    setCourtPlayers,
    addPlayerToCourt,
    addPlayerToPosition,
    removePlayerFromCourt,
    updateScore,
    switchServe,
    setServingPlayer,
    resetScore,
    finishMatch,
    clearAllCourts,
  };
}
