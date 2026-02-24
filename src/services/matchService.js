import api from './api';

/**
 * Record a finished match in the backend
 */
export async function recordMatch(groupId, matchData) {
    const response = await api.post(`/api/groups/${groupId}/matches`, matchData);
    return response.data.data;
}
