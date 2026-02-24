import { useState, useCallback, useEffect, useRef } from 'react';
import { generateFairMatchup, hasEnoughPlayers } from '../utils/matchmaking';
import { updateMatchRatings } from '../utils/eloSystem';
import { PLAYERS_PER_COURT } from '../constants/config';

/**
 * Hook for managing courts and matches
 */
export function useCourts(numberOfCourts, gameMode, players, updatePlayerStats, groupId) {
  const [courts, setCourts] = useState([]);
  const courtsRef = useRef([]);

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
    courtsRef.current = initialCourts;
  }, [numberOfCourts]);

  // Sync ref with courts if an external update happens (e.g. from clearAllCourts)
  useEffect(() => {
    courtsRef.current = courts;
  }, [courts]);

  // Assign random match to a court
  const assignRandomMatch = useCallback((courtId) => {
    // Read synchronously from ref
    const currentCourts = [...courtsRef.current];

    // If no court specified, find the first empty one
    let targetCourtId = courtId;

    if (!targetCourtId) {
      const emptyCourt = currentCourts.find(c => c.team1.length === 0 && c.team2.length === 0);
      if (emptyCourt) {
        targetCourtId = emptyCourt.id;
      } else {
        // No empty courts available
        return false;
      }
    }

    // Determine who is actually available synchronously
    const playingIds = new Set();
    currentCourts.forEach(c => {
      c.team1.forEach(p => playingIds.add(p.id));
      c.team2.forEach(p => playingIds.add(p.id));
    });

    const mockPlayers = players.map(p => ({
      ...p,
      isPlaying: playingIds.has(p.id) || p.isPlaying
    }));

    const matchup = generateFairMatchup(mockPlayers, gameMode);

    if (!matchup) {
      return false;
    }

    // Mutate local array synchronously for next rapid click
    for (let i = 0; i < currentCourts.length; i++) {
      if (currentCourts[i].id === targetCourtId) {
        currentCourts[i] = {
          ...currentCourts[i],
          team1: matchup.team1,
          team2: matchup.team2,
          score: { team1: 0, team2: 0 },
          servingPlayer: { team: 1, index: 0 }, // Default serve
        };
      }
    }

    // Update the ref and the React state
    courtsRef.current = currentCourts;
    setCourts(currentCourts);

    // Update players' playing status
    const allPlayerIds = [
      ...matchup.team1.map(p => p.id),
      ...matchup.team2.map(p => p.id),
    ];

    // Increment rest counter for sitting players (fire and forget API calls)
    const available = mockPlayers.filter(p => !p.isPlaying && !p.isResting);
    const sittingPlayers = available.filter(p => !allPlayerIds.includes(p.id));
    sittingPlayers.forEach(p => {
      updatePlayerStats(p.id, {
        restCounter: (p.restCounter || 0) + 1
      });
    });

    return allPlayerIds;
  }, [players, gameMode, updatePlayerStats]);

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

    setCourts(prev => {
      const next = prev.map(court => {
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
      });
      courtsRef.current = next;
      return next;
    });

    return added;
  }, [gameMode]);

  // Add player to specific position
  const addPlayerToPosition = useCallback((courtId, teamNum, index, player) => {
    setCourts(prev => {
      const next = prev.map(court => {
        if (court.id === courtId) {
          const teamKey = teamNum === 1 ? 'team1' : 'team2';
          const newTeam = [...court[teamKey]];
          newTeam[index] = player;

          return { ...court, [teamKey]: newTeam };
        }
        return court;
      });
      courtsRef.current = next;
      return next;
    });
  }, []);

  // Remove player from court
  const removePlayerFromCourt = useCallback((courtId, playerId) => {
    setCourts(prev => {
      const next = prev.map(court => {
        if (court.id === courtId) {
          return {
            ...court,
            team1: court.team1.filter(p => p.id !== playerId),
            team2: court.team2.filter(p => p.id !== playerId),
          };
        }
        return court;
      });
      courtsRef.current = next;
      return next;
    });
  }, []);

  // Swap / replace players on court
  const swapPlayers = useCallback((courtId, fromPosition, toPosition, player) => {
    setCourts(prev => {
      const next = prev.map(court => {
        if (court.id === courtId) {
          const [fromTeamKey, fromIndexStr] = fromPosition.split('-');
          const [toTeamKey, toIndexStr] = toPosition.split('-');
          const fromIndex = parseInt(fromIndexStr);
          const toIndex = parseInt(toIndexStr);

          const newCourt = { ...court, team1: [...court.team1], team2: [...court.team2] };

          const targetPlayer = newCourt[toTeamKey][toIndex];
          newCourt[toTeamKey][toIndex] = player;
          newCourt[fromTeamKey][fromIndex] = targetPlayer; // targetPlayer could be undefined/null if slot was empty

          return newCourt;
        }
        return court;
      });
      courtsRef.current = next;
      return next;
    });
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

    // Update ELO ratings locally first so we can send the exact diffs to the backend
    const updatedRatings = updateMatchRatings(players, team1Ids, team2Ids, team1Won);

    // Record the match in backend (if groupId provided)
    if (groupId) {
      import('../services/matchService').then(({ recordMatch }) => {
        const participants = [];
        const allPlayers = [...court.team1, ...court.team2];

        allPlayers.forEach(p => {
          const teamNum = court.team1.some(t => t.id === p.id) ? 1 : 2;
          const isMatchWinner = teamNum === winnerTeam;
          const eloBefore = p.elo || 1500;
          const eloAfter = updatedRatings[p.id]?.elo || eloBefore;

          let pointDifferential = 0;
          if (winnerTeam) {
            const diff = Math.abs(court.score.team1 - court.score.team2);
            pointDifferential = isMatchWinner ? diff : -diff;
          }

          participants.push({
            playerId: p.id,
            team: teamNum,
            eloBefore,
            eloAfter,
            isWinner: isMatchWinner,
            pointDifferential
          });
        });

        recordMatch(groupId, {
          team1: team1Ids,
          team2: team2Ids,
          score: court.score,
          winnerTeam,
          participants
        }).catch(e => console.error('Failed to record match', e));
      });
    }

    // Apply pairing penalty (partnerHistory)
    const winningTeam = team1Won ? court.team1 : court.team2;
    const isDoubles = winningTeam.length === 2;

    // Update player stats in backend
    for (const [playerId, playerData] of Object.entries(updatedRatings)) {
      const p = players.find(x => x.id === playerId);
      let newHistory = Array.isArray(p.partnerHistory) ? [...p.partnerHistory] : [];

      if (isDoubles && winningTeam.some(w => w.id === playerId)) {
        const partner = winningTeam.find(w => w.id !== playerId);
        if (!newHistory.includes(partner.id)) {
          newHistory.push(partner.id);
        }
        // Force partner rotation: clear history if they've paired with almost everyone
        // Subtract 1 for self, subtract more to roughly threshold
        const possiblePartners = players.length - 1;
        if (possiblePartners > 0 && newHistory.length >= Math.max(1, possiblePartners - 2)) {
          newHistory = [];
        }
      }

      await updatePlayerStats(playerId, {
        elo: playerData.elo,
        gamesPlayed: playerData.gamesPlayed,
        winCount: playerData.winCount,
        playCount: playerData.gamesPlayed, // Sync playCount with gamesPlayed
        restCounter: 0, // Reset rest counter after playing
        partnerHistory: newHistory
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
  }, [courts, players, updatePlayerStats, groupId]);

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
    swapPlayers,
    updateScore,
    switchServe,
    setServingPlayer,
    resetScore,
    finishMatch,
    clearAllCourts,
  };
}
