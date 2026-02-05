# Google Authentication Setup

To make the login work, you need to configure your Google Cloud Console credentials.

## Steps

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one.
3. Navigate to **APIs & Services > Credentials**.
4. Create **OAuth 2.0 Client IDs**.
   - Application Type: **Web application**
   - Authorized JavaScript origins: `http://localhost:5173` (or your frontend port)
5. Copy the **Client ID**.

## Configuration

### Frontend
Open `src/main.jsx` and replace:
```javascript
const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID";
```
with your actual Client ID.

### Backend
Open `server/index.js` and replace:
```javascript
const CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID";
const JWT_SECRET = "your_strong_jwt_secret";
```
with your Client ID and a secure secret key.

## Running
1. Start Backend:
   ```bash
   cd server
   pnpm start
   ```
2. Start Frontend:
   ```bash
   pnpm dev
   ```
