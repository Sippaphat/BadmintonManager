import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import PlayerCard from '../components/player/PlayerCard';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import { DEFAULT_BASE_SKILL, DEFAULT_COURTS, DEFAULT_TARGET_SCORE } from '../constants/config';

const SetupPage = ({ 
  players,
  onAddPlayer,
  onEditPlayer,
  onDeletePlayer,
  numberOfCourts,
  setNumberOfCourts,
  gameTarget,
  setGameTarget,
  gameMode,
  setGameMode,
  onStartGame,
  onBack,
  t 
}) => {
  const [playerName, setPlayerName] = useState('');
  const [baseSkill, setBaseSkill] = useState(DEFAULT_BASE_SKILL);
  const [playerPhoto, setPlayerPhoto] = useState(null);
  
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [tempName, setTempName] = useState('');
  const [tempSkill, setTempSkill] = useState(50);
  const [tempPhoto, setTempPhoto] = useState(null);
  
  const handleAddPlayer = async () => {
    if (!playerName.trim()) return;
    
    await onAddPlayer({
      name: playerName,
      baseSkill: baseSkill,
      photo: playerPhoto,
    });
    
    setPlayerName('');
    setBaseSkill(DEFAULT_BASE_SKILL);
    setPlayerPhoto(null);
  };
  
  const handleOpenEdit = (player) => {
    setEditingPlayer(player);
    setTempName(player.name);
    setTempSkill(player.baseSkill || DEFAULT_BASE_SKILL);
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
  
  const handlePhotoChange = (e, isTempPhoto = false) => {
    const file = e.target.files?.[0];
    if (file) {
      if (isTempPhoto) {
        setTempPhoto(file);
      } else {
        setPlayerPhoto(file);
      }
    }
  };
  
  const canStart = players.length >= (gameMode === 'singles' ? 2 : 4);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 p-4">
      <div className="max-w-6xl mx-auto py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={onBack}>
            ← Back
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-primary mb-2">
              {t('setup')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Configure your game settings and add players
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Game Settings */}
            <Card title="Game Settings">
              <div className="space-y-4">
                {/* Game Mode */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('gameMode')}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setGameMode('doubles')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        gameMode === 'doubles'
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-gray-200 hover:border-primary/50'
                      }`}
                    >
                      <div className="text-2xl mb-1">👥</div>
                      <div className="text-xs font-semibold">Doubles</div>
                      <div className="text-[10px] text-gray-500">2 vs 2</div>
                    </button>
                    <button
                      onClick={() => setGameMode('singles')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        gameMode === 'singles'
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-gray-200 hover:border-primary/50'
                      }`}
                    >
                      <div className="text-2xl mb-1">👤</div>
                      <div className="text-xs font-semibold">Singles</div>
                      <div className="text-[10px] text-gray-500">1 vs 1</div>
                    </button>
                  </div>
                </div>
                
                {/* Number of Courts */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('courts')}
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map((num) => (
                      <button
                        key={num}
                        onClick={() => setNumberOfCourts(num)}
                        className={`flex-1 py-2 px-3 rounded-lg border-2 font-bold transition-all ${
                          numberOfCourts === num
                            ? 'border-primary bg-primary text-white'
                            : 'border-gray-200 hover:border-primary/50'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Target Score */}
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  label={t('target')}
                  value={gameTarget}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '')
                    setGameTarget(value === '' ? '' : parseInt(value, 10))
                    }}
                  fullWidth
                />
              </div>
            </Card>
            
            {/* Add Player */}
            <Card title={t('add') + ' Player'}>
              <div className="space-y-3">
                <Input
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder={t('addPlayerPlaceholder')}
                  fullWidth
                  onKeyPress={(e) => e.key === 'Enter' && handleAddPlayer()}
                />
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('baseSkillLabel')}
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={baseSkill}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      const num = parseInt(value) || 0;
                      setBaseSkill(Math.min(100, Math.max(0, num)));
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
                    onChange={(e) => handlePhotoChange(e, false)}
                    className="text-sm"
                  />
                </div>
                
                <Button
                  onClick={handleAddPlayer}
                  disabled={!playerName.trim()}
                  fullWidth
                >
                  ➕ {t('add')}
                </Button>
              </div>
            </Card>
            
            {/* Start Game Button */}
            <Button
              onClick={onStartGame}
              disabled={!canStart}
              variant="accent"
              size="lg"
              fullWidth
            >
              🚀 {t('startGame')}
            </Button>
            
            {!canStart && (
              <p className="text-sm text-center text-red-600">
                {t('notEnoughPlayers')}
                <br />
                Need at least {gameMode === 'singles' ? '2' : '4'} players
              </p>
            )}
          </div>
          
          {/* Players List */}
          <div className="lg:col-span-2">
            <Card>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {t('playersList')}
                </h3>
                <Badge variant="primary">
                  {players.length} player{players.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              
              {players.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4 opacity-30">👥</div>
                  <p className="text-gray-500 dark:text-gray-400">
                    No players yet. Add some to get started!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {players.map((player) => (
                    <PlayerCard
                      key={player.id}
                      player={player}
                      onEdit={handleOpenEdit}
                      onDelete={onDeletePlayer}
                      showStats
                      size="sm"
                    />
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
      
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
              onChange={(e) => handlePhotoChange(e, true)}
              className="text-sm"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SetupPage;
