# API Migration Guide

## Overview
This document outlines the changes between the old and new API endpoints to help with frontend integration.

---

## Authentication

### Old API
```javascript
POST /auth/google
Body: { token: "google-id-token" }
Response: { user: {...}, token: "jwt-token" }
```

### New API ✅
```javascript
POST /api/auth/google
Body: { credential: "google-id-token" }  // Changed: token → credential
Response: { success: true, user: {...}, token: "jwt-token" }
```

**Changes:**
- Added `/api` prefix
- Body field changed from `token` to `credential` (matches @react-oauth/google)
- Response includes `success: true` field

**Frontend Update Required:**
```javascript
// OLD:
authService.googleLogin({ token: credential })

// NEW:
authService.googleLogin({ credential })
```

---

## Groups

### Old API
```javascript
GET /groups?userId=xxx
Response: [{ _id, name, owner, sharedWith, players }]
```

### New API ✅
```javascript
GET /api/groups
Headers: { Authorization: "Bearer <token>" }  // userId from token
Response: { success: true, groups: [{ _id, name, owner, sharedWith, players, isOwner }] }
```

**Changes:**
- Added `/api` prefix
- Authentication via JWT token (no userId in query)
- Response wrapped in success object
- Added `isOwner` boolean flag

---

### Old API
```javascript
POST /groups
Body: { name: "Group Name", userId: "123" }
```

### New API ✅
```javascript
POST /api/groups
Headers: { Authorization: "Bearer <token>" }  // userId from token
Body: { name: "Group Name" }  // No userId needed
Response: { success: true, group: {..., isOwner: true} }
```

---

### Old API
```javascript
GET /groups/:groupId
Response: { _id, name, owner, sharedWith, players: [...] }
```

### New API ✅
```javascript
GET /api/groups/:groupId
Headers: { Authorization: "Bearer <token>" }
Response: { 
  success: true, 
  group: {..., isOwner: boolean}, 
  players: [...] 
}
```

**Changes:**
- Players moved to separate field (not nested in group)
- Added `isOwner` flag

---

### Share Group

### Old API
```javascript
POST /groups/:groupId/share
Body: { email: "user@example.com" }
Response: { message: "Shared successfully", user: {...} }
```

### New API ✅
```javascript
POST /api/groups/:groupId/share
Headers: { Authorization: "Bearer <token>" }
Body: { email: "user@example.com" }
Response: { 
  success: true, 
  message: "Group shared successfully",
  sharedWith: { id, name, email }
}
```

---

## Players

### Old API
```javascript
POST /groups/:groupId/players
Body: FormData with { name, baseSkill, photo }
Response: { _id, name, photo, baseSkill, elo, ... }
```

### New API ✅
```javascript
POST /api/groups/:groupId/players
Headers: { Authorization: "Bearer <token>" }
Body: FormData with { name, baseSkill, photo }
Response: { success: true, player: { _id, name, photo, baseSkill, elo, ... } }
```

**Changes:**
- Added `/api` prefix
- Authentication required
- Response wrapped with success flag

---

### Old API
```javascript
PUT /players/:id
DELETE /players/:id
PUT /players/:id/stats
PUT /players/:id/reset
```

### New API ✅
```javascript
PUT /api/groups/:groupId/players/:playerId
DELETE /api/groups/:groupId/players/:playerId
PATCH /api/groups/:groupId/players/:playerId/stats  // Changed: PUT → PATCH
POST /api/groups/:groupId/players/reset  // Changed: individual → bulk reset
```

**Changes:**
- All player endpoints now nested under groups
- Stats update changed from PUT to PATCH (more semantically correct)
- Reset changed to bulk operation for all players in group

**Frontend Update Required:**
```javascript
// OLD:
api.put(`/players/${playerId}/stats`, { elo, playCount, ... })

// NEW:
api.patch(`/api/groups/${groupId}/players/${playerId}/stats`, { elo, playCount, ... })
```

---

### New Endpoints (Not in old API) ✨
```javascript
GET /api/groups/:groupId/players/leaderboard?limit=10
// Get top players by ELO

GET /api/groups/:groupId/players/queue
// Get players sorted by play count (for rotation)
```

---

## Schedules

### Old API
```javascript
GET /schedules?groupId=xxx
POST /schedules
DELETE /schedules/:id
```

### New API ✅
```javascript
GET /api/groups/:groupId/schedules?startDate=...&endDate=...&upcoming=true
POST /api/groups/:groupId/schedules
PUT /api/schedules/:scheduleId  // NEW: update schedule
DELETE /api/schedules/:scheduleId
```

**Changes:**
- Schedules now nested under groups
- Added query filters (date range, upcoming)
- Added update endpoint (was missing)
- Changed field names:
  - `title` → auto-generated (or can be added)
  - `start/end` → `date/time`
  - Added `maxPlayers`, `participants`, `status`

---

### New Endpoints (Not in old API) ✨
```javascript
POST /api/schedules/:scheduleId/participants
// Add user to schedule

DELETE /api/schedules/:scheduleId/participants/:userId
// Remove user from schedule

PATCH /api/schedules/:scheduleId/status
// Update schedule status (upcoming/completed/cancelled)
```

---

## Response Format Changes

### Old Format
```javascript
// Success
{ _id: "...", name: "...", ... }

// Error
{ error: "Error message" }
```

### New Format ✅
```javascript
// Success
{ 
  success: true, 
  data: { ... },  // or specific key like 'user', 'group', 'players'
  message: "..." 
}

// Error
{ 
  success: false, 
  error: "Error message" 
}
```

---

## Authentication Changes

### Old: No Authentication
- Used `userId` query parameter
- No token required

### New: JWT Bearer Token ✅
- All protected endpoints require `Authorization: Bearer <token>` header
- UserId extracted from JWT token
- Token expires in 7 days

**Frontend Service Update:**
```javascript
// api.js already handles this with interceptors
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## Error Codes

### Old API
- Mostly 500 for all errors
- Inconsistent error messages

### New API ✅
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (no access to resource)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `500` - Server Error

---

## Validation Errors

### New Format
```javascript
{
  success: false,
  error: "Validation error",
  errors: [
    { field: "name", message: "Name is required" },
    { field: "email", message: "Invalid email format" }
  ]
}
```

---

## Frontend Service Updates Needed

### 1. Update authService.js
```javascript
// Change token field name
export const googleLogin = (credential) => 
  api.post('/api/auth/google', { credential }); // was: { token: credential }
```

### 2. Update groupService.js
```javascript
// Remove userId from request
export const getGroups = () => 
  api.get('/api/groups'); // was: /groups?userId=xxx

export const createGroup = (name) => 
  api.post('/api/groups', { name }); // was: { name, userId }
```

### 3. Update playerService.js
```javascript
// Add groupId to all player endpoints
export const updatePlayerStats = (groupId, playerId, stats) => 
  api.patch(`/api/groups/${groupId}/players/${playerId}/stats`, stats);
  // was: api.put(`/players/${playerId}/stats`, stats)
```

### 4. Update scheduleService.js
```javascript
// Nest under groups
export const getSchedules = (groupId, filters) => 
  api.get(`/api/groups/${groupId}/schedules`, { params: filters });
  // was: api.get('/schedules', { params: { groupId } })
```

---

## Backward Compatibility

The new API is **NOT backward compatible** due to:
1. `/api` prefix added to all endpoints
2. Authentication now required (JWT tokens)
3. Response format changes (success wrapper)
4. Field name changes (token → credential)
5. Endpoint structure changes (players/schedules nested under groups)

**Recommended approach:** Update frontend to use new API all at once, or maintain both versions temporarily.

---

## Testing Checklist

- [ ] Google OAuth login works
- [ ] JWT token stored and sent with requests
- [ ] Groups CRUD operations
- [ ] Group sharing functionality
- [ ] Players CRUD operations
- [ ] Player stats update (ELO, play count)
- [ ] Player leaderboard and queue
- [ ] Schedule CRUD operations
- [ ] Image upload for player photos
- [ ] Error handling (401, 403, 404, 500)
- [ ] Token refresh on 401

---

## Quick Migration Tips

1. **Search and replace** in frontend code:
   - `/auth/` → `/api/auth/`
   - `/groups` → `/api/groups`
   - `/players` → `/api/groups/${groupId}/players`
   - `/schedules` → `/api/groups/${groupId}/schedules`

2. **Update API service** to always send Authorization header (already done in api.js)

3. **Update response handling** to check `response.data.success` and access `response.data.<resource>`

4. **Remove userId** from request bodies (extracted from JWT)

5. **Update field names**:
   - `token` → `credential` (Google OAuth)
   - Player stats: use PATCH instead of PUT

---

## Need Help?

Check:
- [README_BACKEND_REFACTOR.md](./README_BACKEND_REFACTOR.md) - Full backend structure
- [server/routes/](./server/routes/) - All endpoint definitions
- [server/controllers/](./server/controllers/) - Business logic
- [server/middleware/validation.js](./server/middleware/validation.js) - Request validation rules
