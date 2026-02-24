import { useState, useCallback } from 'react';
import {
  addPlayer as apiAddPlayer,
  updatePlayer as apiUpdatePlayer,
  deletePlayer as apiDeletePlayer,
  updatePlayerStats as apiUpdatePlayerStats,
  resetPlayerStats as apiResetPlayerStats,
} from '../services/playerService';
import { DEFAULT_BASE_SKILL, DEFAULT_ELO } from '../constants/config';

/**
 * Hook for managing players in a group
 */
export function usePlayers(groupId) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addPlayer = useCallback(async (playerData) => {
    try {
      setLoading(true);
      setError(null);

      const newPlayer = await apiAddPlayer(groupId, {
        name: playerData.name,
        baseSkill: playerData.baseSkill || DEFAULT_BASE_SKILL,
        photo: playerData.photo,
      });

      // Ensure all required fields are present
      const player = {
        ...newPlayer,
        elo: newPlayer.elo || DEFAULT_ELO,
        gamesPlayed: newPlayer.gamesPlayed || 0,
        winCount: newPlayer.winCount || 0,
        playCount: newPlayer.playCount || 0,
        isPlaying: false,
        consecutiveGames: 0,
        lastFinishTime: 0,
        lastRestTime: Date.now(),
      };

      setPlayers(prev => [...prev, player]);
      return player;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  const updatePlayer = useCallback(async (playerId, updates) => {
    try {
      setLoading(true);
      setError(null);

      const updatedPlayer = await apiUpdatePlayer(groupId, playerId, updates);

      setPlayers(prev =>
        prev.map(p => {
          if (p.id === playerId) {
            return {
              ...updatedPlayer,
              // Preserve frontend-only state
              isPlaying: p.isPlaying,
              isResting: p.isResting
            };
          }
          return p;
        })
      );

      return updatedPlayer;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  const deletePlayer = useCallback(async (playerId) => {
    try {
      setLoading(true);
      setError(null);

      await apiDeletePlayer(groupId, playerId);

      setPlayers(prev => prev.filter(p => p.id !== playerId));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  const updatePlayerStats = useCallback(async (playerId, stats) => {
    try {
      const updatedPlayer = await apiUpdatePlayerStats(groupId, playerId, stats);

      setPlayers(prev =>
        prev.map(p => {
          if (p.id === playerId) {
            return {
              ...updatedPlayer,
              // Preserve frontend-only state
              isPlaying: p.isPlaying,
              isResting: p.isResting
            };
          }
          return p;
        })
      );

      return updatedPlayer;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [groupId]);

  const resetStats = useCallback(async (resetType = 'all') => {
    try {
      setLoading(true);
      setError(null);

      await apiResetPlayerStats(groupId, resetType);

      setPlayers(prev => prev.map(p => {
        if (resetType === 'all' || resetType === 'playCount') {
          p.playCount = 0;
          p.gamesPlayed = 0;
        }
        if (resetType === 'all' || resetType === 'winCount') {
          p.winCount = 0;
        }
        if (resetType === 'all' || resetType === 'elo') {
          // Re-calculate initial ELO
          const baseNorm = ((p.baseSkill || 50) - 0) / (100 - 0);
          p.elo = 1500 + (baseNorm - 0.5) * 400;
        }
        return { ...p };
      }));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  const setPlayersData = useCallback((data) => {
    setPlayers(data);
  }, []);

  return {
    players,
    setPlayers: setPlayersData,
    addPlayer,
    updatePlayer,
    deletePlayer,
    updatePlayerStats,
    resetStats,
    loading,
    error,
  };
}
