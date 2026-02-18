import React, { useState } from 'react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import CourtVisualization from './CourtVisualization';

const CourtManagement = ({
  court,
  availablePlayers,
  onAddPlayer,
  onRemovePlayer,
  onSwapPlayers,
  onSetServing,
  gameMode,
  t,
}) => {
  const [draggedPlayer, setDraggedPlayer] = useState(null);
  const [draggedFrom, setDraggedFrom] = useState(null);
  
  const maxPlayersPerTeam = gameMode === 'doubles' ? 2 : 1;
  
  const handleDragStart = (player, from) => {
    setDraggedPlayer(player);
    setDraggedFrom(from);
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
  };
  
  const handleDrop = (position) => {
    if (!draggedPlayer) return;
    
    if (draggedFrom === 'available') {
      onAddPlayer(position, draggedPlayer);
    } else if (draggedFrom !== position) {
      onSwapPlayers(draggedFrom, position, draggedPlayer);
    }
    
    setDraggedPlayer(null);
    setDraggedFrom(null);
  };
  
  const renderPlayerSlot = (position, team, index) => {
    const player = team[index];
    const positionKey = `${position}-${index}`;
    const isServing = court.servingPlayer?.id === player?.id;
    
    return (
      <div
        key={positionKey}
        className={`
          relative p-3 rounded-lg border-2 transition-all min-h-[80px]
          ${player ? 'bg-white dark:bg-gray-800 border-primary' : 'bg-gray-100 dark:bg-gray-900 border-dashed border-gray-300'}
          ${isServing ? 'ring-2 ring-yellow-400 shadow-lg' : ''}
        `}
        onDragOver={handleDragOver}
        onDrop={() => handleDrop(positionKey)}
      >
        {player ? (
          <div
            draggable
            onDragStart={() => handleDragStart(player, positionKey)}
            className="cursor-move"
          >
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1">
                <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                  {isServing && <span className="text-yellow-500">🏸</span>}
                  {player.name}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  ELO: {Math.round(player.elo || 1500)}
                </div>
              </div>
              <div className="flex gap-1">
                {!isServing && (
                  <button
                    onClick={() => onSetServing(player)}
                    className="text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 px-2 py-1 rounded text-xs"
                    title="Set as serving player"
                  >
                    🏸
                  </button>
                )}
                <button
                  onClick={() => onRemovePlayer(positionKey)}
                  className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded text-xs"
                >
                  ✖
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-400 text-sm py-4">
            Drop player here or
            <div className="mt-2">
              {availablePlayers.length > 0 && (
                <select
                  onChange={(e) => {
                    const player = availablePlayers.find(p => p.id === e.target.value);
                    if (player) {
                      onAddPlayer(positionKey, player);
                      e.target.value = '';
                    }
                  }}
                  className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                >
                  <option value="">+ Add</option>
                  {availablePlayers.map(p => (
                    !p.isResting && (
                    <option key={p.id} value={p.id}>
                      {p.name} (ELO: {Math.round(p.elo || 1500)})
                    </option>
                    )
                  ))}
                </select>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      {/* Court Visualization */}
      <CourtVisualization
        team1={court.team1}
        team2={court.team2}
        servingPlayer={court.servingPlayer}
      />
      
      {/* Team Management */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            Team 1
            <Badge variant="info">{court.team1.length}/{maxPlayersPerTeam}</Badge>
          </h4>
          <div className="space-y-2">
            {Array.from({ length: maxPlayersPerTeam }).map((_, i) =>
              renderPlayerSlot('team1', court.team1, i)
            )}
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            Team 2
            <Badge variant="info">{court.team2.length}/{maxPlayersPerTeam}</Badge>
          </h4>
          <div className="space-y-2">
            {Array.from({ length: maxPlayersPerTeam }).map((_, i) =>
              renderPlayerSlot('team2', court.team2, i)
            )}
          </div>
        </div>
      </div>
      
      {/* Available Players */}
      <div>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          Available Players
          <Badge variant="success">{availablePlayers.length}</Badge>
        </h4>
        <div className="max-h-48 overflow-y-auto space-y-2">
          {availablePlayers.length > 0 ? (
            availablePlayers.map(player => (
              !player.isResting && (
              <div
                key={player.id}
                draggable
                onDragStart={() => handleDragStart(player, 'available')}
                className="p-3 rounded-lg border-2 border-gray-200 hover:border-primary bg-white dark:bg-gray-800 transition-all cursor-move"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {player.name}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      ELO: {Math.round(player.elo || 1500)} | Games: {player.gamesPlayed || 0}
                      {(player.consecutiveGames || 0) >= 3 && (
                        <span className="text-orange-600 ml-2">😰 Tired</span>
                      )}
                    </div>
                  </div>
                  <div className="text-gray-400 text-sm">
                    <span>⋮⋮</span>
                  </div>
                </div>
              </div>
              )
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
              All players are assigned or resting
            </div>
          )}
        </div>
      </div>
      
      <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
        💡 Drag &amp; drop players to assign positions, or use the + dropdown
      </div>
    </div>
  );
};

export default CourtManagement;
