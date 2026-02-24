// API Configuration
export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

// Google OAuth Configuration
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "634347628772-ot3d906un0ar1oq5p3b98tci67l99non.apps.googleusercontent.com";

// Game Configuration
export const DEFAULT_COURTS = 2;
export const DEFAULT_TARGET_SCORE = 15;
export const DEFAULT_BASE_SKILL = 50;
export const DEFAULT_ELO = 1500;

// ELO System Configuration
export const ELO_K_FACTOR_NEW = 32; // For players with < 10 games
export const ELO_K_FACTOR_REGULAR = 24; // For experienced players
export const ELO_NEW_PLAYER_THRESHOLD = 10; // Games threshold for "new" player

export const ELO_MIN = 1100;
export const ELO_MAX = 1900;

// Game Modes
export const GAME_MODE_DOUBLES = 'doubles';
export const GAME_MODE_SINGLES = 'singles';

// Players per court based on mode
export const PLAYERS_PER_COURT = {
  [GAME_MODE_DOUBLES]: 4,
  [GAME_MODE_SINGLES]: 2,
};

// Theme Configuration
export const THEMES = {
  light: {
    primary: "#006400",
    accent: "#32CD32",
    bg: "#F2F2F2",
    card: "#FFFFFF",
    text: "#333333",
    red: "#D32F2F",
    blue: "#1976D2",
    gray: "#757575",
    lightGreen: "#E8F5E9",
  },
  dark: {
    primary: "#66BB6A",
    accent: "#81C784",
    bg: "#121212",
    card: "#1E1E1E",
    text: "#E0E0E0",
    red: "#EF5350",
    blue: "#42A5F5",
    gray: "#BDBDBD",
    lightGreen: "#1B5E20",
  },
};

// Sort Modes
export const SORT_MODE_QUEUE = 'queue';
export const SORT_MODE_LEADERBOARD = 'leaderboard';

// Local Storage Keys
export const STORAGE_KEYS = {
  THEME: 'badminton_theme',
  LANGUAGE: 'badminton_language',
  USER: 'badminton_user',
};
