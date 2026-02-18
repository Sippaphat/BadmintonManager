import React, { useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import AuthPage from './pages/AuthPage';
import GroupSelectPage from './pages/GroupSelectPage';
import SetupPage from './pages/SetupPage';
import GamePage from './pages/GamePage';
import LoadingSpinner from './components/ui/LoadingSpinner';
import { useTheme, useLanguage, useAuth } from './hooks/useAppState';
import { usePlayers } from './hooks/usePlayers';
import { useCourts } from './hooks/useCourts';
import { TRANSLATIONS } from './constants/translations';
import { DEFAULT_COURTS, DEFAULT_TARGET_SCORE, GAME_MODE_DOUBLES } from './constants/config';
import { verifyGoogleToken } from './services/authService';
import { 
  fetchGroups as apiFetchGroups,
  createGroup as apiCreateGroup,
  fetchGroupDetails,
  shareGroup as apiShareGroup,
} from './services/groupService';

function App() {
  // Global state
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { user, login, logout, isAuthenticated } = useAuth();
  
  // Translation helper
  const t = (key) => TRANSLATIONS[language]?.[key] || key;
  
  // App state
  const [currentView, setCurrentView] = useState('auth'); // 'auth' | 'groups' | 'setup' | 'game'
  const [loading, setLoading] = useState(false);
  
  // Group state
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  
  // Game settings
  const [numberOfCourts, setNumberOfCourts] = useState(DEFAULT_COURTS);
  const [gameTarget, setGameTarget] = useState(DEFAULT_TARGET_SCORE);
  const [gameMode, setGameMode] = useState(GAME_MODE_DOUBLES);
  const [sortMode, setSortMode] = useState('queue');
  
  // Players hook
  const {
    players,
    setPlayers,
    addPlayer,
    updatePlayer,
    deletePlayer,
    updatePlayerStats,
    resetStats,
  } = usePlayers(selectedGroup?.id);
  
  // Courts hook
  const {
    courts,
    assignRandomMatch,
    addPlayerToCourt,
    addPlayerToPosition,
    removePlayerFromCourt,
    updateScore,
    switchServe,
    setServingPlayer,
    resetScore,
    finishMatch,
    clearAllCourts,
  } = useCourts(numberOfCourts, gameMode, players, updatePlayerStats);
  
  // Initialize view based on auth state
  useEffect(() => {
    if (isAuthenticated) {
      setCurrentView('groups');
      fetchGroups();
    } else {
      setCurrentView('auth');
    }
  }, [isAuthenticated]);
  
  // Authentication handlers
  const handleLoginSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      const { credential } = credentialResponse;
      
      // Verify with backend
      const response = await verifyGoogleToken(credential);
      const { token, user: userData } = response;
      
      // Save auth state
      login(userData, token);
      
      setCurrentView('groups');
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = () => {
    logout();
    setSelectedGroup(null);
    setPlayers([]);
    setCurrentView('auth');
  };
  
  // Group handlers
  const fetchGroups = async () => {
    try {
      setLoading(true);
      const groupsData = await apiFetchGroups();
      setGroups(groupsData);
    } catch (error) {
      console.error('Failed to fetch groups:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateGroup = async (name) => {
    try {
      const newGroup = await apiCreateGroup(name);
      setGroups(prev => [...prev, newGroup]);
      return newGroup;
    } catch (error) {
      console.error('Failed to create group:', error);
      alert(t('errorCreateGroup'));
      throw error;
    }
  };
  
  const handleSelectGroup = async (group) => {
    try {
      setLoading(true);
      const groupDetails = await fetchGroupDetails(group.id);
      
      setSelectedGroup(groupDetails.group);
      setPlayers(groupDetails.players || []);
      setCurrentView('setup');
    } catch (error) {
      console.error('Failed to load group:', error);
      alert(t('errorLoadGroup'));
    } finally {
      setLoading(false);
    }
  };
  
  // Player handlers
  const handleAddPlayer = async (playerData) => {
    try {
      await addPlayer(playerData);
    } catch (error) {
      if (error.message.includes('exists')) {
        alert(t('playerExists'));
      } else {
        alert(t('addFailed'));
      }
    }
  };
  
  const handleEditPlayer = async (playerId, updates) => {
    try {
      await updatePlayer(playerId, updates);
    } catch (error) {
      alert(t('updateFailed'));
    }
  };
  
  const handleDeletePlayer = async (playerId) => {
    if (!confirm(t('confirmDelete'))) return;
    
    try {
      await deletePlayer(playerId);
    } catch (error) {
      alert(t('deleteFailed'));
    }
  };
  
  const handleToggleRest = async (player) => {
    try {
      if (player.isPlaying) {
        alert(t('playerPlaying'));
        return;
      }
      
      // Update local state is enough for session-based rest
      // But we can also persist to backend if we added the field
      const newRestState = !player.isResting;
      
      // Optimistic update
      setPlayers(prev => prev.map(p => 
        p.id === player.id ? { ...p, isResting: newRestState } : p
      ));
      
      // Optional: Persist to backend if API supports it
      // await updatePlayer(player.id, { isResting: newRestState });
      
    } catch (error) {
      console.error('Toggle rest failed:', error);
    }
  };
  
  // Game handlers
  const handleStartGame = () => {
    setCurrentView('game');
  };
  
  const handleResetGame = () => {
    clearAllCourts();
    setPlayers(prev => prev.map(p => ({ ...p, isPlaying: false })));
    setCurrentView('setup');
  };
  
  const handleResetStats = async (resetType) => {
    try {
      await resetStats(resetType);
      alert(t('resetSuccess'));
    } catch (error) {
      alert('Failed to reset stats');
    }
  };
  
  const handleAssignRandom = (courtId) => {
    const assignedPlayerIds = assignRandomMatch(courtId);
    
    if (!assignedPlayerIds) {
      alert(t('notEnoughPlayers'));
      return;
    }
    
    // Update players' playing status
    setPlayers(prev => prev.map(p => ({
      ...p,
      isPlaying: assignedPlayerIds.includes(p.id) ? true : p.isPlaying,
    })));
  };
  
  const handleFinishMatch = async (courtId, winnerTeam) => {
    const result = await finishMatch(courtId, winnerTeam);
    
    if (result) {
      // Update players' playing status
      setPlayers(prev => prev.map(p => ({
        ...p,
        isPlaying: result.court.team1.concat(result.court.team2).some(tp => tp.id === p.id) ? false : p.isPlaying,
        lastFinishTime: result.updatedRatings.includes(p.id) ? Date.now() : p.lastFinishTime,
      })));
    }
  };
  
  const handleIncrementScore = (courtId, team) => {
    updateScore(courtId, team, true);
  };
  
  const handleDecrementScore = (courtId, team) => {
    updateScore(courtId, team, false);
  };
  
  const handleSwitchServe = (courtId) => {
    switchServe(courtId);
  };
  
  const handleOpenCourtModal = (courtId) => {
    // Additional logic if needed
  };
  
  const handleAddPlayerToCourtPosition = (courtId, position, player) => {
    // Position format: "team1-0", "team1-1", "team2-0", "team2-1"
    const [teamKey, indexStr] = position.split('-');
    const teamNum = teamKey === 'team1' ? 1 : 2;
    const index = parseInt(indexStr);
    
    // Add player to specific position
    addPlayerToPosition(courtId, teamNum, index, player);
    
    // Update player's playing status
    setPlayers(prev => prev.map(p => 
      p.id === player.id ? { ...p, isPlaying: true } : p
    ));
  };
  
  const handleRemovePlayerFromCourtPosition = (courtId, playerId) => {
    removePlayerFromCourt(courtId, playerId);
    
    // Update player's playing status
    setPlayers(prev => prev.map(p => 
      p.id === playerId ? { ...p, isPlaying: false } : p
    ));
  };
  
  const handleSwapPlayersOnCourt = (courtId, fromPosition, toPosition, player) => {
    // For now, just move the player
    // In future, could implement actual position swapping
    console.log('Swap not yet implemented', { courtId, fromPosition, toPosition, player });
  };
  
  const handleSetServingPlayer = (courtId, player) => {
    // Find which team and index the player is in
    const court = courts.find(c => c.id === courtId);
    if (!court) return;
    
    const team1Index = court.team1.findIndex(p => p.id === player.id);
    const team2Index = court.team2.findIndex(p => p.id === player.id);
    
    if (team1Index !== -1) {
      setServingPlayer(courtId, 1, team1Index);
    } else if (team2Index !== -1) {
      setServingPlayer(courtId, 2, team2Index);
    }
  };
  
  // Render appropriate view
  if (loading && currentView === 'auth') {
    return <LoadingSpinner fullScreen />;
  }
  
  if (currentView === 'auth') {
    return (
      <AuthPage
        onLoginSuccess={handleLoginSuccess}
        loading={loading}
        t={t}
      />
    );
  }
  
  if (currentView === 'groups') {
    return (
      <GroupSelectPage
        groups={groups}
        onSelectGroup={handleSelectGroup}
        onCreateGroup={handleCreateGroup}
        onLogout={handleLogout}
        user={user}
        loading={loading}
        t={t}
      />
    );
  }
  
  if (currentView === 'setup') {
    return (
      <SetupPage
        players={players}
        onAddPlayer={handleAddPlayer}
        onEditPlayer={handleEditPlayer}
        onDeletePlayer={handleDeletePlayer}
        numberOfCourts={numberOfCourts}
        setNumberOfCourts={setNumberOfCourts}
        gameTarget={gameTarget}
        setGameTarget={setGameTarget}
        gameMode={gameMode}
        setGameMode={setGameMode}
        onStartGame={handleStartGame}
        onBack={() => setCurrentView('groups')}
        t={t}
      />
    );
  }
  
  if (currentView === 'game') {
    return (
      <GamePage
        courts={courts}
        players={players}
        gameMode={gameMode}
        gameTarget={gameTarget}
        sortMode={sortMode}
        setSortMode={setSortMode}
        onAssignRandom={handleAssignRandom}
        onOpenCourtModal={handleOpenCourtModal}
        onAddPlayerToPosition={handleAddPlayerToCourtPosition}
        onRemovePlayerFromPosition={handleRemovePlayerFromCourtPosition}
        onSwapPlayers={handleSwapPlayersOnCourt}
        onSetServingPlayer={handleSetServingPlayer}
        onFinishMatch={handleFinishMatch}
        onIncrementScore={handleIncrementScore}
        onDecrementScore={handleDecrementScore}
        onSwitchServe={handleSwitchServe}
        onEditPlayer={handleEditPlayer}
        onDeletePlayer={handleDeletePlayer}
        onToggleRest={handleToggleRest}
        onResetGame={handleResetGame}
        onResetStats={handleResetStats}
        t={t}
      />
    );
  }
  
  return null;
}

export default App;
