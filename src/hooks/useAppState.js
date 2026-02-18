import { useState, useEffect } from 'react';
import { STORAGE_KEYS } from '../constants/config';

/**
 * Hook for managing theme (light/dark mode)
 */
export function useTheme() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    return saved || 'light';
  });
  
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };
  
  return { theme, setTheme, toggleTheme };
}

/**
 * Hook for managing language
 */
export function useLanguage() {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
    return saved || 'th';
  });
  
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
  }, [language]);
  
  return { language, setLanguage };
}

/**
 * Hook for managing authentication state
 */
export function useAuth() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });
  
  const [token, setToken] = useState(() => {
    return localStorage.getItem('badminton_token');
  });
  
  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
    localStorage.setItem('badminton_token', authToken);
  };
  
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem('badminton_token');
  };
  
  return { user, token, login, logout, isAuthenticated: !!user };
}
