import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './AppWithBackend.jsx'
import './App.css'
import { GoogleOAuthProvider } from '@react-oauth/google';

// Replace with your actual Google Client ID
const GOOGLE_CLIENT_ID = "634347628772-ot3d906un0ar1oq5p3b98tci67l99non.apps.googleusercontent.com"; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
)
