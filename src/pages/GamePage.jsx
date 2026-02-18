import React, { useState } from 'react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import CourtCard from '../components/court/CourtCard';
import PlayerList from '../components/player/PlayerList';
import Modal from '../components/ui/Modal';
import Card from '../components/ui/Card';
import CourtVisualization from '../components/court/CourtVisualization';
import CourtManagement from '../components/court/CourtManagement';
import Badge from '../components/ui/Badge';
import { hasEnoughPlayers } from '../utils/matchmaking';
import PixelLayout from '../components/pixel/PixelLayout'; // Import new layout

const GamePage = ({
  courts,
  players,
  gameMode,
  gameTarget,
  sortMode,
  setSortMode,
  onAssignRandom,
  onOpenCourtModal,
  onAddPlayerToPosition,
  onRemovePlayerFromPosition,
  onSwapPlayers,
  onSetServingPlayer,
  onFinishMatch,
  onIncrementScore,
  onDecrementScore,
  onSwitchServe,
  onEditPlayer,
  onDeletePlayer,
  onToggleRest,
  onResetGame,
  onResetStats,
  t,
}) => {
  const [isFinishModalOpen, setFinishModalOpen] = useState(false);
  const [finishingCourtId, setFinishingCourtId] = useState(null);
  const [selectedCourtId, setSelectedCourtId] = useState(null);
  const [isManageModalOpen, setManageModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [tempName, setTempName] = useState('');
  const [tempSkill, setTempSkill] = useState(50);
  const [tempPhoto, setTempPhoto] = useState(null);
  const [isPixelMode, setPixelMode] = useState(true); // Default to Pixel Mode for now as requested

  const [celebratingCourtId, setCelebratingCourtId] = useState(null);
  const [celebratingTeam, setCelebratingTeam] = useState(null);

  const handleOpenFinishModal = (courtId) => {
    setFinishingCourtId(courtId);
    setFinishModalOpen(true);
  };

  const handleFinishMatch = async (winnerTeam) => {
    // 1. Close the modal immediately
    setFinishModalOpen(false);

    if (isPixelMode && winnerTeam) {
      // 2. Start Celebration Animation
      setCelebratingCourtId(finishingCourtId);
      setCelebratingTeam(winnerTeam);

      // 3. Wait for animation to finish (e.g., 3 seconds)
      setTimeout(async () => {
        await onFinishMatch(finishingCourtId, winnerTeam);
        setCelebratingCourtId(null);
        setCelebratingTeam(null);
        setFinishingCourtId(null);
      }, 3000);
    } else {
      // Classic mode or Draw: Finish immediately
      await onFinishMatch(finishingCourtId, winnerTeam);
      setFinishingCourtId(null);
    }
  };

  const handleOpenManageModal = (courtId) => {
    setSelectedCourtId(courtId);
    setManageModalOpen(true);
    onOpenCourtModal(courtId);
  };

  const handleOpenEditModal = (player) => {
    setEditingPlayer(player);
    setTempName(player.name);
    setTempSkill(player.baseSkill || 50);
    setTempPhoto(null);
    setEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!tempName.trim()) return;

    await onEditPlayer(editingPlayer.id, {
      name: tempName,
      baseSkill: tempSkill,
      photo: tempPhoto,
    });

    setEditModalOpen(false);
    setEditingPlayer(null);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setTempPhoto(file);
    }
  };

  const finishingCourt = courts.find(c => c.id === finishingCourtId);
  const selectedCourt = courts.find(c => c.id === selectedCourtId);


  // Render the Pixel Layout if enabled
  if (isPixelMode) {
    return (
      <>
        <PixelLayout
          courts={courts}
          players={players}
          celebratingCourtId={celebratingCourtId}
          celebratingTeam={celebratingTeam}
          sortMode={sortMode}
          setSortMode={setSortMode}
          onAssignRandom={onAssignRandom}
          onOpenCourtModal={handleOpenManageModal}
          onAddPlayerToPosition={onAddPlayerToPosition}
          onRemovePlayerFromPosition={onRemovePlayerFromPosition}
          onSwapPlayers={onSwapPlayers}
          onSetServingPlayer={onSetServingPlayer}
          onFinishMatch={handleOpenFinishModal} // Use same modal logic
          onIncrementScore={onIncrementScore}
          onDecrementScore={onDecrementScore}
          onSwitchServe={onSwitchServe}
          onEditPlayer={handleOpenEditModal}
          onDeletePlayer={onDeletePlayer}
          onToggleRest={onToggleRest}
          onResetGame={onResetGame}
          onResetStats={onResetStats}
          t={t}
        />

        {/* Toggle back to Classic Mode (Optional, hidden in corner) */}
        <button
          onClick={() => setPixelMode(false)}
          className="fixed bottom-4 right-4 bg-gray-800 text-white text-xs p-2 rounded opacity-50 hover:opacity-100 z-50 font-sans"
        >
          Switch to Classic
        </button>

        {/* Existing Modals reused for functionality */}
        <Modal
          isOpen={isFinishModalOpen}
          onClose={() => setFinishModalOpen(false)}
          title={`${t('finishGameCourt')} ${finishingCourtId}`}
          size="lg"
        >
          {/* ... (Same modal content as below) ... */}
          {finishingCourt && (
            <div className="space-y-6">
              <CourtVisualization
                team1={finishingCourt.team1}
                team2={finishingCourt.team2}
                servingPlayer={finishingCourt.servingPlayer}
              />
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {t('scoreDisplay')}
                </p>
                <p className="text-4xl font-bold text-primary">
                  {finishingCourt.score.team1} : {finishingCourt.score.team2}
                </p>
              </div>
              <div className="space-y-3">
                <p className="text-center font-semibold text-gray-700 dark:text-gray-300">
                  Who won?
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <Button variant="accent" onClick={() => handleFinishMatch(1)} fullWidth>
                    🏆 {t('team1Win')}
                  </Button>
                  <Button variant="secondary" onClick={() => handleFinishMatch(null)} fullWidth>
                    {t('draw')}
                  </Button>
                  <Button variant="accent" onClick={() => handleFinishMatch(2)} fullWidth>
                    🏆 {t('team2Win')}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Modal>

        <Modal
          isOpen={isManageModalOpen}
          onClose={() => setManageModalOpen(false)}
          title={`${t('manage')} ${t('court')} ${selectedCourtId}`}
          size="lg"
        >
          {selectedCourt && (
            <CourtManagement
              court={selectedCourt}
              availablePlayers={players.filter(p => !p.isPlaying)}
              onAddPlayer={(position, player) => {
                onAddPlayerToPosition(selectedCourtId, position, player);
              }}
              onRemovePlayer={(position) => {
                const court = courts.find(c => c.id === selectedCourtId);
                if (!court) return;
                const [teamKey, indexStr] = position.split('-');
                const index = parseInt(indexStr);
                const team = teamKey === 'team1' ? court.team1 : court.team2;
                const player = team[index];
                if (player) {
                  onRemovePlayerFromPosition(selectedCourtId, player.id);
                }
              }}
              onSwapPlayers={(from, to, player) => {
                onSwapPlayers(selectedCourtId, from, to, player);
              }}
              onSetServing={(player) => {
                onSetServingPlayer(selectedCourtId, player);
              }}
              gameMode={gameMode}
              t={t}
            />
          )}
        </Modal>

        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setEditModalOpen(false)}
          title={t('editPlayer')}
          footer={
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setEditModalOpen(false)} fullWidth>
                {t('cancel')}
              </Button>
              <Button onClick={handleSaveEdit} disabled={!tempName.trim()} fullWidth>
                {t('save')}
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <Input
              label={t('name')}
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              fullWidth
            />
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {t('baseSkillLabel')}
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={tempSkill}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  const num = parseInt(value) || 0;
                  setTempSkill(Math.min(100, Math.max(0, num)));
                }}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
                placeholder="0-100"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {t('changePhoto')}
              </label>
              <input type="file" accept="image/*" onChange={handlePhotoChange} className="text-sm" />
            </div>
          </div>
        </Modal>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 p-4">
      {/* ... Existing Classic Return ... */}
      <div className="max-w-7xl mx-auto py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">
              {t('gameTitle')}
            </h1>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="info">
                {gameMode === 'doubles' ? '👥 Doubles' : '👤 Singles'}
              </Badge>
              <Badge variant="success">
                🎯 Target: {gameTarget}
              </Badge>
              <Badge variant="primary">
                🏟️ {courts.length} Courts
              </Badge>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setPixelMode(true)}
              className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
            >
              👾 8-Bit Mode
            </button>

            <Button
              variant="warning"
              size="sm"
              onClick={() => {
                if (confirm(t('confirmResetStats'))) {
                  onResetStats('all');
                }
              }}
            >
              ↺ Reset Stats
            </Button>
            <Button
              variant="warning"
              size="sm"
              onClick={() => {
                if (confirm(t('confirmResetElo'))) {
                  onResetStats('elo');
                }
              }}
            >
              📉 {t('resetElo')}
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                if (confirm(t('confirmResetGame'))) {
                  onResetGame();
                }
              }}
            >
              ⚠️ {t('resetGame')}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Courts Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courts.map((court, index) => (
                <CourtCard
                  key={court.id}
                  court={court}
                  courtNumber={index + 1}
                  onManage={handleOpenManageModal}
                  onRandom={(courtId) => onAssignRandom(courtId)}
                  onFinish={handleOpenFinishModal}
                  onSwitchServe={onSwitchServe}
                  onIncrementScore={onIncrementScore}
                  onDecrementScore={onDecrementScore}
                  players={players}
                  t={t}
                />
              ))}
            </div>
          </div>

          {/* Stats & Players Section */}
          <div className="lg:col-span-1 space-y-6">
            {/* Sort Toggle */}
            <div className="flex gap-2">
              <Button
                variant={sortMode === 'queue' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSortMode('queue')}
                fullWidth
              >
                ⏳ Queue
              </Button>
              <Button
                variant={sortMode === 'leaderboard' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSortMode('leaderboard')}
                fullWidth
              >
                🏆 Leaderboard
              </Button>
            </div>

            {/* Player List */}
            <PlayerList
              players={players}
              onEdit={handleOpenEditModal}
              onDelete={onDeletePlayer}
              onToggleRest={onToggleRest}
              sortMode={sortMode}
              showStats
              t={t}
            />

            {/* Quick Stats */}
            <Card title="📊 Quick Stats">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Players:</span>
                  <span className="font-bold">{players.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Active Courts:</span>
                  <span className="font-bold text-primary">
                    {courts.filter(c => c.team1.length > 0).length} / {courts.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Playing Now:</span>
                  <span className="font-bold text-accent">
                    {players.filter(p => p.isPlaying).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">In Queue:</span>
                  <span className="font-bold">
                    {players.filter(p => !p.isPlaying).length}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Existing Modals for Classic Mode */}
      <Modal
        isOpen={isFinishModalOpen}
        onClose={() => setFinishModalOpen(false)}
        title={`${t('finishGameCourt')} ${finishingCourtId}`}
        size="lg"
      >
        {finishingCourt && (
          <div className="space-y-6">
            {/* Court Visualization */}
            <CourtVisualization
              team1={finishingCourt.team1}
              team2={finishingCourt.team2}
              servingPlayer={finishingCourt.servingPlayer}
            />

            {/* Score Display */}
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {t('scoreDisplay')}
              </p>
              <p className="text-4xl font-bold text-primary">
                {finishingCourt.score.team1} : {finishingCourt.score.team2}
              </p>
            </div>

            {/* Winner Selection */}
            <div className="space-y-3">
              <p className="text-center font-semibold text-gray-700 dark:text-gray-300">
                Who won?
              </p>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant="accent"
                  onClick={() => handleFinishMatch(1)}
                  fullWidth
                >
                  🏆 {t('team1Win')}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleFinishMatch(null)}
                  fullWidth
                >
                  {t('draw')}
                </Button>
                <Button
                  variant="accent"
                  onClick={() => handleFinishMatch(2)}
                  fullWidth
                >
                  🏆 {t('team2Win')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Manage Court Modal */}
      <Modal
        isOpen={isManageModalOpen}
        onClose={() => setManageModalOpen(false)}
        title={`${t('manage')} ${t('court')} ${selectedCourtId}`}
        size="lg"
      >
        {selectedCourt && (
          <CourtManagement
            court={selectedCourt}
            availablePlayers={players.filter(p => !p.isPlaying)}
            onAddPlayer={(position, player) => {
              onAddPlayerToPosition(selectedCourtId, position, player);
            }}
            onRemovePlayer={(position) => {
              // Extract player ID from position
              const court = courts.find(c => c.id === selectedCourtId);
              if (!court) return;

              const [teamKey, indexStr] = position.split('-');
              const index = parseInt(indexStr);
              const team = teamKey === 'team1' ? court.team1 : court.team2;
              const player = team[index];

              if (player) {
                onRemovePlayerFromPosition(selectedCourtId, player.id);
              }
            }}
            onSwapPlayers={(from, to, player) => {
              onSwapPlayers(selectedCourtId, from, to, player);
            }}
            onSetServing={(player) => {
              onSetServingPlayer(selectedCourtId, player);
            }}
            gameMode={gameMode}
            t={t}
          />
        )}
      </Modal>

      {/* Edit Player Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={t('editPlayer')}
        footer={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => setEditModalOpen(false)}
              fullWidth
            >
              {t('cancel')}
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={!tempName.trim()}
              fullWidth
            >
              {t('save')}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label={t('name')}
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            fullWidth
          />

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t('baseSkillLabel')}
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={tempSkill}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '');
                const num = parseInt(value) || 0;
                setTempSkill(Math.min(100, Math.max(0, num)));
              }}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
              placeholder="0-100"
            />
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
              <span>Beginner (0)</span>
              <span>Expert (100)</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t('changePhoto')}
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="text-sm"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default GamePage;
