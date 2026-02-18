import React from 'react';
import Button from '../ui/Button';

const ScoreBoard = ({ 
  team1Score, 
  team2Score, 
  onIncrement, 
  onDecrement,
  targetScore = 21,
  team1Label = 'Team 1',
  team2Label = 'Team 2',
  onSelectTeam = null,
  selectedTeam = null,
  className = '',
}) => {
  const renderTeamScore = (team, score, label) => {
    const isSelected = selectedTeam === team;
    const isWinning = team === 1 ? team1Score > team2Score : team2Score > team1Score;
    
    return (
      <div 
        className={`
          flex flex-col items-center gap-2 p-4 rounded-lg transition-all duration-200
          ${isSelected ? 'bg-yellow-400/30 shadow-lg scale-105' : ''}
          ${onSelectTeam ? 'cursor-pointer hover:bg-white/10' : ''}
        `.trim().replace(/\s+/g, ' ')}
        onClick={() => onSelectTeam && onSelectTeam(team)}
      >
        <span className="text-white text-xs font-bold opacity-90 uppercase tracking-wide">
          {label}
        </span>
        
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDecrement(team);
            }}
            className="w-8 h-8 rounded-full border-2 border-white bg-white/20 hover:bg-white/30 text-white font-bold text-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          >
            −
          </button>
          
          <div className={`
            min-w-[60px] h-14 bg-white rounded-lg flex items-center justify-center
            shadow-md
            ${isWinning ? 'ring-2 ring-yellow-400' : ''}
          `.trim().replace(/\s+/g, ' ')}>
            <span className="text-3xl font-bold text-primary">
              {score}
            </span>
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onIncrement(team);
            }}
            className="w-8 h-8 rounded-full border-2 border-white bg-white/20 hover:bg-white/30 text-white font-bold text-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          >
            +
          </button>
        </div>
        
        {score >= targetScore && (
          <div className="text-yellow-400 text-xs font-bold animate-pulse">
            🏆 Match Point!
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className={`bg-gradient-to-r from-primary via-primary-light to-primary rounded-xl p-4 shadow-court ${className}`}>
      <div className="flex justify-around items-center">
        {renderTeamScore(1, team1Score, team1Label)}
        
        <div className="text-white text-3xl font-bold opacity-50">
          :
        </div>
        
        {renderTeamScore(2, team2Score, team2Label)}
      </div>
    </div>
  );
};

export default ScoreBoard;
