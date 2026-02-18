import api from './api';

/**
 * Get all groups for current user
 */
export async function fetchGroups() {
  const response = await api.get('/api/groups');
  return response.data.groups || [];
}

/**
 * Create a new group
 */
export async function createGroup(name) {
  const response = await api.post('/api/groups', { name });
  return response.data.group;
}

/**
 * Get group details with players
 */
export async function fetchGroupDetails(groupId) {
  const response = await api.get(`/api/groups/${groupId}`);
  return response.data;
}

/**
 * Share group with another user
 */
export async function shareGroup(groupId, email) {
  const response = await api.post(`/api/groups/${groupId}/share`, { email });
  return response.data;
}

/**
 * Delete a group
 */
export async function deleteGroup(groupId) {
  const response = await api.delete(`/api/groups/${groupId}`);
  return response.data;
}
/**
 * Send invitation to join group
 */
export async function sendInvitation(groupId, email) {
  const response = await api.post(`/api/groups/${groupId}/invite`, { email });
  return response.data;
}

/**
 * Accept invitation
 */
export async function acceptInvitation(token) {
  const response = await api.post('/api/groups/invitations/accept', { token });
  return response.data;
}
