import api from './api';

/**
 * Add a new player to a group
 */
export async function addPlayer(groupId, playerData) {
  const formData = new FormData();
  formData.append('name', playerData.name);
  formData.append('baseSkill', playerData.baseSkill || 50);
  
  if (playerData.photo) {
    formData.append('photo', playerData.photo);
  }

  const response = await api.post(`/api/groups/${groupId}/players`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data.player;
}

/**
 * Update player information
 */
export async function updatePlayer(groupId, playerId, updates) {
  const formData = new FormData();
  
  if (updates.name !== undefined) {
    formData.append('name', updates.name);
  }
  if (updates.baseSkill !== undefined) {
    formData.append('baseSkill', updates.baseSkill);
  }
  if (updates.photo) {
    formData.append('photo', updates.photo);
  }

  const response = await api.put(
    `/api/groups/${groupId}/players/${playerId}`, 
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  
  return response.data.player;
}

/**
 * Delete a player
 */
export async function deletePlayer(groupId, playerId) {
  const response = await api.delete(`/api/groups/${groupId}/players/${playerId}`);
  return response.data;
}

/**
 * Update player stats after a match
 */
export async function updatePlayerStats(groupId, playerId, stats) {
  const response = await api.patch(
    `/api/groups/${groupId}/players/${playerId}/stats`,
    stats
  );
  return response.data.player;
}

/**
 * Reset player stats
 */
export async function resetPlayerStats(groupId, resetType = 'all') {
  const response = await api.post(`/api/groups/${groupId}/players/reset`, {
    resetType, // 'all', 'playCount', 'winCount'
  });
  return response.data;
}
