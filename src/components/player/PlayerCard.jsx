import React from 'react';
import { getInitials } from '../../utils/helpers';
import { calculateWinRate } from '../../utils/eloSystem';

const PlayerCard = ({ 
  player, 
  onEdit, 
  onDelete,
  showStats = false,
  showActions = true,
  serving = false,
  selectable = false,
  onSelect = null,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
  };
  
  const selectableClass = selectable ? 'border-2 border-dashed border-primary/50 hover:border-primary hover:shadow-player cursor-pointer hover:scale-105' : '';
  const servingClass = serving ? 'bg-gradient-to-br from-yellow-400 to-orange-400 shadow-serve animate-pulse-slow' : '';
  
  return (
    <div 
      className={`
        relative
        bg-white dark:bg-dark-card
        rounded-xl shadow-md
        transition-all duration-200
        ${sizeClasses[size]}
        ${selectableClass}
        ${servingClass}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      onClick={selectable ? onSelect : undefined}
    >
      {/* Serving indicator */}
      {serving && (
        <div className="absolute -top-2 -right-2 text-2xl animate-bounce-slow filter drop-shadow-lg">
          🏸
        </div>
      )}
      
      {selectable && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-white/90 px-2 py-0.5 rounded-full text-xs font-bold text-primary whitespace-nowrap">
          Click to serve
        </div>
      )}
      
      {/* Player Photo or Avatar */}
      <div className="flex flex-col items-center">
        {player.photo ? (
          <div className="w-full aspect-square rounded-lg overflow-hidden mb-2">
            <img 
              src={player.photo} 
              alt={player.name}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white text-2xl font-bold mb-2 shadow-md">
            {getInitials(player.name)}
          </div>
        )}
        
        {/* Player Name */}
        <h4 className={`font-bold text-center ${serving ? 'text-gray-900' : 'text-gray-900 dark:text-white'} mb-1`}>
          {player.name}
        </h4>
        
        {/* Stats */}
        {showStats && (
          <div className="w-full space-y-1 text-xs text-gray-600 dark:text-gray-400 mt-2">
            <div className="flex justify-between">
              <span>ELO:</span>
              <span className="font-semibold">{Math.round(player.elo || 1500)}</span>
            </div>
            <div className="flex justify-between">
              <span>Games:</span>
              <span className="font-semibold">{player.gamesPlayed || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Wins:</span>
              <span className="font-semibold text-primary">{player.winCount || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Win Rate:</span>
              <span className="font-semibold">{calculateWinRate(player)}%</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Actions */}
      {showActions && (
        <div className="flex gap-2 mt-3 border-t border-gray-200 dark:border-gray-700 pt-2">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(player);
              }}
              className="flex-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2 py-1 rounded text-sm font-semibold transition-colors"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(player.id);
              }}
              className="flex-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded text-sm font-semibold transition-colors"
            >
              Remove
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PlayerCard;
