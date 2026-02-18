import api from './api';

/**
 * Verify Google OAuth token and get user info
 */
export async function verifyGoogleToken(credential) {
  const response = await api.post('/api/auth/google', { credential });
  return response.data;
}

/**
 * Get current user info
 */
export async function getCurrentUser() {
  const response = await api.get('/api/auth/me');
  return response.data;
}

/**
 * Logout user
 */
export async function logout() {
  localStorage.removeItem('badminton_token');
  localStorage.removeItem('badminton_user');
}
